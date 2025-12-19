import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface PFPCard {
  id: number;
  img: string;
  name?: string;
  traits?: Record<string, unknown>;
}


class PFPService {
  /**
   * Fetch available PFP cards for selection
   */
  async getCards(): Promise<PFPCard[]> {
    try {
      const token = localStorage.getItem('cto_auth_token');
      if (!token) {
        console.warn('No authentication token found, using default cards');
        // Return default cards if not authenticated
        return this.getDefaultCards();
      }

      const response = await axios.get(
        `${API_BASE}/api/v1/pfp/cards`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.cards && response.data.cards.length > 0) {
        return response.data.cards;
      }

      // Fallback to default cards if API fails or returns empty
      console.warn('API returned no cards, using default cards');
      return this.getDefaultCards();
    } catch (error) {
      console.error('Failed to fetch PFP cards:', error);
      // Return default cards as fallback - don't throw error, just use defaults
      return this.getDefaultCards();
    }
  }



  /**
   * Upload profile image using presigned URL (similar to old project)
   * Falls back to base64 if presigned upload is not available
   */
  async uploadProfileImage(file: File, userId: string): Promise<{ viewUrl: string; key?: string }> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image must be 10MB or less');
    }

    const token = localStorage.getItem('cto_auth_token');
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      // 1) Try presigned upload first (like old project)
      const presignRes = await axios.post(
        `${API_BASE}/api/v1/images/presign`,
        {
          type: 'profile',
          userId: userId,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { uploadUrl, key } = presignRes.data || {};
      if (uploadUrl && key) {
        console.log(`📤 Uploading to S3: ${uploadUrl.substring(0, 100)}...`);
        // 2) Upload directly to storage (S3) via presigned PUT
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (putRes.ok) {
          // 3) Use server redirect endpoint for stable reads
          const viewUrl = `${API_BASE}/api/v1/images/view/${key}`;
          console.log(`✅ S3 upload successful, viewUrl: ${viewUrl}`);
          return { viewUrl, key };
        } else {
          console.error(`❌ S3 upload failed: ${putRes.status} ${putRes.statusText}`);
          throw new Error(`S3 upload failed: ${putRes.status} ${putRes.statusText}`);
        }
      } else {
        console.warn('⚠️ No uploadUrl or key in presign response:', presignRes.data);
      }
    } catch (presignError) {
      console.error('❌ Presigned upload failed:', presignError);
      // Don't fallback to base64 for PFP saves - this creates huge URLs that cause backend errors
      throw new Error(`Failed to upload image: ${presignError instanceof Error ? presignError.message : 'Unknown error'}`);
    }

    // Fallback: Convert to base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve({ viewUrl: base64String });
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Save/Upload PFP to user profile
   * Now accepts either a File (for upload), data URL (base64), or imageUrl (for existing URLs)
   */
  async savePFP(imageFileOrUrl: File | string, userId?: string): Promise<{ success: boolean; message?: string; imageUrl?: string }> {
    try {
      const token = localStorage.getItem('cto_auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      let imageUrl: string;

      // If it's a File, upload it first
      if (imageFileOrUrl instanceof File) {
        if (!userId) {
          const userIdFromStorage = localStorage.getItem('cto_user_id');
          if (!userIdFromStorage) {
            throw new Error('User ID is required for file upload');
          }
          userId = userIdFromStorage;
        }

        const { viewUrl } = await this.uploadProfileImage(imageFileOrUrl, userId);
        imageUrl = viewUrl;
      } else if (imageFileOrUrl.startsWith('data:image/')) {
        // It's a data URL (base64) - convert to File and upload
        if (!userId) {
          const userIdFromStorage = localStorage.getItem('cto_user_id');
          if (!userIdFromStorage) {
            throw new Error('User ID is required for file upload');
          }
          userId = userIdFromStorage;
        }

        console.log('📸 Converting data URL to File for upload...');
        // Convert data URL to File
        const response = await fetch(imageFileOrUrl);
        const blob = await response.blob();
        const file = new File([blob], `mascot-${Date.now()}.png`, { type: 'image/png' });
        console.log(`📦 File created: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

        console.log('☁️ Uploading file to S3 via presigned URL...');
        const uploadResult = await this.uploadProfileImage(file, userId);
        imageUrl = uploadResult.viewUrl;
        console.log(`✅ Upload successful, imageUrl: ${imageUrl}`);
      } else {
        // It's already a URL string (not a data URL)
        imageUrl = imageFileOrUrl;
      }

      // Save the image URL to user profile
      const response = await axios.post(
        `${API_BASE}/api/v1/pfp/save`,
        { imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Store in localStorage for quick access (both keys for compatibility)
        localStorage.setItem('profile_avatar_url', imageUrl);
        localStorage.setItem('cto_user_avatar_url', imageUrl);
        
        // Dispatch custom event to notify components of avatar update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('avatarUpdated'));
        }
        
        return {
          success: true,
          message: response.data.message || 'PFP saved successfully',
          imageUrl,
        };
      }

      throw new Error(response.data.message || 'Failed to save PFP');
    } catch (error: unknown) {
      console.error('❌ Failed to save PFP:', error);
      let message = 'Failed to save PFP';
      if (axios.isAxiosError(error)) {
        console.error('❌ Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.response?.data?.message,
        });
        message = error.response?.data?.message || error.response?.data?.error || message;
        if (error.response?.status === 500) {
          message = `Backend error: ${message}. Check backend logs for details.`;
        }
      } else if (error instanceof Error) {
        message = error.message || message;
      }
      throw new Error(message);
    }
  }

  /**
   * Get default cards (fallback)
   */
  private getDefaultCards(): PFPCard[] {
    return [
      { id: 1, img: "/default-card.png" },
      { id: 2, img: "/default-card.png" },
      { id: 3, img: "/default-card.png" },
      { id: 4, img: "/default-card.png" },
      { id: 5, img: "/default-card.png" },
    ];
  }
}

export const pfpService = new PFPService();

