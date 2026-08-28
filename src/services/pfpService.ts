import { apiGet, apiPost } from '@/lib/apiClient';
import { toRecord, unwrapApiData } from '@/lib/apiResponse';
import {
  getAuthToken,
  getUserId,
  PROFILE_AVATAR_URL_KEY,
  USER_AVATAR_URL_KEY,
} from '@/lib/authSession';
import { useSessionStore } from '@/lib/sessionStore';
import { authService } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface PFPCard {
  id: number;
  img: string;
  name?: string;
  traits?: Record<string, unknown>;
}

export interface MascotAssignment {
  mascotKey: string;
  assetVersion: 'v1' | 'v2';
  assetPath: string;
  assignedAt?: string;
  catalogSize?: number;
}


class PFPService {
  /**
   * Fetch available PFP cards for selection
   */
  async getCards(): Promise<PFPCard[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('No authentication token found, using default cards');
        // Return default cards if not authenticated
        return this.getDefaultCards();
      }

      const response = await apiGet<{ success?: boolean; cards?: PFPCard[] }>(
        `${API_BASE}/api/v1/pfp/cards`,
      );
      const responseData = toRecord(unwrapApiData(response));
      const cards = Array.isArray(responseData.cards) ? (responseData.cards as PFPCard[]) : [];

      if (cards.length > 0) {
        return cards;
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



  async getOrCreateMascotAssignment(): Promise<MascotAssignment> {
    const response = await apiPost<unknown>(
      API_BASE + '/api/v1/pfp/assignment',
      {},
    );
    const data = toRecord(unwrapApiData(response));
    const mascotKey = typeof data.mascotKey === 'string' ? data.mascotKey.trim() : '';
    const assetVersion = data.assetVersion === 'v2' ? 'v2' : 'v1';
    const providedAssetPath =
      typeof data.assetPath === 'string' ? data.assetPath.trim() : '';
    // Keep the frontend compatible during a staggered deployment where the
    // legacy backend may still return only mascotKey.
    const assetPath =
      providedAssetPath ||
      (assetVersion === 'v1' ? `mascots/TRAITS/${mascotKey}.png` : '');
    if (!mascotKey || !/^[A-Za-z0-9._-]+$/.test(mascotKey)) {
      throw new Error('Backend returned an invalid mascot assignment');
    }
    if (!assetPath || !/^mascots\/[A-Za-z0-9._/-]+$/.test(assetPath)) {
      throw new Error('Backend returned an invalid mascot asset path');
    }
    return {
      mascotKey,
      assetVersion,
      assetPath,
      assignedAt: typeof data.assignedAt === 'string' ? data.assignedAt : undefined,
      catalogSize: typeof data.catalogSize === 'number' ? data.catalogSize : undefined,
    };
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

    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      // 1) Try presigned upload first (like old project)
      const presignRes = await apiPost<unknown>(
        `${API_BASE}/api/v1/images/presign`,
        {
          type: 'profile',
          userId: userId,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        },
      );

      const presignData = toRecord(unwrapApiData(presignRes));
      const uploadUrl = typeof presignData.uploadUrl === "string" ? presignData.uploadUrl : "";
      const key = typeof presignData.key === "string" ? presignData.key : "";
      
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
          dataKeys: Object.keys(presignData),
          fullResponse: presignData,
        });
        throw new Error('Presign response missing uploadUrl or key');
      }
    } catch (presignError) {
      console.error('❌ Presigned upload failed:', presignError);
      // Don't fallback to base64 for PFP saves - this creates huge URLs that cause backend errors
      throw new Error(`Failed to upload image: ${presignError instanceof Error ? presignError.message : 'Unknown error'}`);
    }
  }

  /**
   * Save/Upload PFP to user profile
   * Now accepts either a File (for upload), data URL (base64), or imageUrl (for existing URLs)
   */
  async savePFP(imageFileOrUrl: File | string, userId?: string): Promise<{ success: boolean; message?: string; imageUrl?: string }> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      let imageUrl: string;

      // If it's a File, upload it first
      if (imageFileOrUrl instanceof File) {
        if (!userId) {
          const userIdFromStorage = getUserId();
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
          const userIdFromStorage = getUserId();
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

      // Persist through the shared profile endpoint used by both CTO and CP.
      const updated = await authService.updateUser(userId ?? "", {
        avatarUrl: imageUrl,
      });
      const finalAvatarUrl = updated.avatarUrl || imageUrl;

        localStorage.setItem(PROFILE_AVATAR_URL_KEY, finalAvatarUrl);
        localStorage.setItem(USER_AVATAR_URL_KEY, finalAvatarUrl);

        // Immediate session update (navbar / profile) — same keys as cto-test-frontend
        useSessionStore.getState().setAvatarUrl(finalAvatarUrl);

        // Dispatch custom event to notify components of avatar update
        // Use a small delay to ensure localStorage is updated before event fires
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.dispatchEvent(new Event("avatarUpdated"));
          }, 100);
        }
        
      return {
        success: true,
        message: 'PFP saved successfully',
        imageUrl: finalAvatarUrl,
      };
    } catch (error: unknown) {
      console.error('❌ Failed to save PFP:', error);
      let message = 'Failed to save PFP';
      if (error instanceof Error) {
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
