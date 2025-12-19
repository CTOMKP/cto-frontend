import axios from 'axios';
import { getCloudFrontUrl } from '@/lib/image-url-helper';

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

      // Handle nested response structure (NestJS wraps in {data: {...}, statusCode, timestamp})
      const presignData = presignRes.data?.data || presignRes.data;
      const { uploadUrl, key } = presignData || {};
      
      if (uploadUrl && key) {
        console.log(`📤 Uploading to S3: ${uploadUrl.substring(0, 100)}...`);
        // 2) Upload directly to storage (S3) via presigned PUT
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (putRes.ok) {
          // Wait a moment for S3 to propagate the file
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verify the file exists by trying to access it via the backend endpoint
          const viewUrl = `${API_BASE}/api/v1/images/view/${key}`;
          console.log(`✅ S3 upload successful, verifying file exists at: ${viewUrl}`);
          
          // Try to verify the file exists (with retries)
          let verified = false;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const verifyRes = await fetch(viewUrl, { method: 'HEAD' });
              if (verifyRes.ok || verifyRes.status === 307 || verifyRes.status === 302) {
                verified = true;
                console.log(`✅ File verified after ${attempt + 1} attempt(s)`);
                break;
              }
              if (attempt < 2) {
                console.log(`⏳ File not yet available, retrying in 1s... (attempt ${attempt + 1}/3)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } catch (verifyError) {
              console.warn(`⚠️ Verification attempt ${attempt + 1} failed:`, verifyError);
              if (attempt < 2) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          if (!verified) {
            console.warn(`⚠️ Could not verify file exists, but upload appeared successful. File may be propagating.`);
          }
          
          return { viewUrl, key };
        } else {
          const errorText = await putRes.text().catch(() => 'Unknown error');
          console.error(`❌ S3 upload failed: ${putRes.status} ${putRes.statusText}`, errorText);
          throw new Error(`S3 upload failed: ${putRes.status} ${putRes.statusText}`);
        }
      } else {
        console.error('❌ No uploadUrl or key in presign response:', {
          hasData: !!presignRes.data,
          hasNestedData: !!presignRes.data?.data,
          dataKeys: presignRes.data ? Object.keys(presignRes.data) : [],
          nestedDataKeys: presignRes.data?.data ? Object.keys(presignRes.data.data) : [],
          fullResponse: presignRes.data,
        });
        throw new Error('Presign response missing uploadUrl or key');
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
      console.log(`💾 Saving PFP to backend: ${imageUrl.substring(0, 100)}...`);
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

      // Handle nested response structure (NestJS wraps in {data: {...}, statusCode, timestamp})
      const saveData = response.data?.data || response.data;
      console.log('📦 Backend save response:', {
        status: response.status,
        hasData: !!response.data,
        hasNestedData: !!response.data?.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        nestedDataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        success: saveData?.success,
        message: saveData?.message,
        avatarUrl: saveData?.avatarUrl,
        fullResponse: response.data,
      });

      if (saveData?.success) {
        // Use backend's avatarUrl if provided, otherwise use our constructed imageUrl
        // Backend might return avatarUrl, imageUrl, or url field
        const backendUrl = saveData?.avatarUrl || saveData?.imageUrl || saveData?.url || imageUrl;
        // Transform to CloudFront URL (same approach as memes)
        const finalAvatarUrl = getCloudFrontUrl(backendUrl);
        
        console.log('💾 Storing avatar URL:', {
          backendAvatarUrl: saveData?.avatarUrl,
          backendImageUrl: saveData?.imageUrl,
          backendUrl: saveData?.url,
          constructedImageUrl: imageUrl,
          cloudfrontUrl: finalAvatarUrl,
          allSaveDataKeys: Object.keys(saveData || {}),
        });
        
        // Store CloudFront URL in localStorage for quick access (both keys for compatibility)
        localStorage.setItem('profile_avatar_url', finalAvatarUrl);
        localStorage.setItem('cto_user_avatar_url', finalAvatarUrl);
        
        // Dispatch custom event to notify components of avatar update
        // Use a small delay to ensure localStorage is updated before event fires
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(new Event('avatarUpdated'));
          }, 100);
        }
        
        return {
          success: true,
          message: saveData.message || 'PFP saved successfully',
          imageUrl: finalAvatarUrl,
        };
      }

      throw new Error(saveData?.message || `Failed to save PFP. Response: ${JSON.stringify(saveData)}`);
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

