import { ApiError } from '@/lib/apiError';
import { apiGet, apiPost } from '@/lib/apiClient';
import { toRecord, unwrapApiData } from '@/lib/apiResponse';
import { getCloudFrontUrl } from '@/lib/image-url-helper';
import {
  clearSessionStorage,
  getAuthToken,
  PROFILE_AVATAR_URL_KEY,
  setAuthToken,
  USER_AVATAR_URL_KEY,
  USER_EMAIL_KEY,
  USER_ID_KEY,
  WALLET_ADDRESS_KEY,
} from '@/lib/authSession';
import { BackendWallet } from '@/types/privy';
import { saveWalletsToStorage } from '@/utils/localStorage';
import walletsService from '@/services/walletsService';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

type SyncResponseData = {
  success?: boolean;
  token?: string;
  user?: {
    id?: number | string;
    email?: string;
    walletAddress?: string;
    walletsCount?: number;
    avatarUrl?: string;
  };
  wallets?: BackendWallet[];
  id?: number | string;
  userId?: number | string;
};

/**
 * Privy Authentication Service
 * Handles Privy authentication and syncs with CTO backend
 */
class PrivyService {
  private isSyncSuccessPayload(
    payload: SyncResponseData,
  ): payload is SyncResponseData & {
    token: string;
    user: NonNullable<SyncResponseData['user']> & { id: number | string; email: string };
  } {
    return Boolean(
      (payload?.success === true || (payload?.user && payload?.token)) &&
      typeof payload?.token === 'string' &&
      payload?.user &&
      (typeof payload.user.id === 'number' || typeof payload.user.id === 'string') &&
      typeof payload.user.email === 'string',
    );
  }

  /**
   * Sync Privy user with CTO backend
   * @param privyToken - Privy authentication token from frontend
   * @returns User data and CTO JWT token
   */
  async syncUser(privyToken: string, getAccessToken?: () => Promise<string | null>): Promise<{
    success: boolean;
    token: string;
    user: {
      id: number;
      email: string;
      walletAddress?: string;
      walletsCount: number;
    };
    wallets: BackendWallet[];
  }> {
    // Match test frontend: retry logic with fresh tokens and 30 second timeout
    let response: unknown = null;
    let retryCount = 0;
    const maxRetries = 2; // Match test frontend: 2 retries
    
    while (retryCount <= maxRetries) {
      try {
        // Get a fresh token for each retry (matching test frontend)
        const freshToken = retryCount > 0 && getAccessToken 
          ? await getAccessToken() 
          : privyToken;
        
        if (!freshToken) {
          throw new Error('No fresh token available');
        }
        
        console.log(`🔄 Sync attempt ${retryCount + 1}: Using token: ${freshToken.substring(0, 20)}...`);
        
        response = await apiPost<unknown>(
        `${API_BASE}/api/v1/auth/privy/sync`,
          { privyToken: freshToken },
        );
        
        // If we get here, the request succeeded
        break;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ Sync attempt ${retryCount + 1} failed:`, errorMessage);
        
        // Log full error details for debugging on every attempt
        if (error instanceof ApiError) {
          console.error(`❌ Backend error (attempt ${retryCount + 1}):`, {
            status: error.status,
            data: error.body,
            message: (error.body as { message?: string; error?: string } | undefined)?.message || (error.body as { message?: string; error?: string } | undefined)?.error || error.message,
            url: `${API_BASE}/api/v1/auth/privy/sync`,
          });
        }
        
        if (retryCount === maxRetries) {
          // On final failure, throw with detailed error
          if (error instanceof ApiError) {
            const body = error.body as { message?: string; error?: string } | undefined;
            const backendMessage = body?.message || body?.error || error.message;
            throw new Error(`Failed to sync user: ${backendMessage} (Status: ${error.status || 'N/A'})`);
          }
          throw error; // Re-throw the last error
        }
        
        // Wait a bit before retrying (matching test frontend: 2 second delay)
        await new Promise(resolve => setTimeout(resolve, 2000));
        retryCount++;
      }
    }

    if (response == null) {
      throw new Error('No response received from backend');
    }

    // Log the full response for debugging - CRITICAL for debugging
    const rawResponse = toRecord(unwrapApiData(response));
    const dataKeys = rawResponse ? Object.keys(rawResponse) : [];
    console.log('📦 Backend sync response:', {
      hasData: !!rawResponse,
      dataKeys: dataKeys,
      dataKeysString: dataKeys.join(', '), // Show actual keys
      success: (rawResponse as { success?: unknown })?.success,
      hasUser: !!(rawResponse as { user?: unknown })?.user,
      userId: (rawResponse as { user?: { id?: unknown } })?.user?.id,
      hasToken: !!(rawResponse as { token?: unknown })?.token,
      fullResponseData: JSON.stringify(rawResponse, null, 2),
    });

    // Response is already normalized through unwrapApiData.
    const responseData: SyncResponseData = rawResponse as SyncResponseData;

    // Check if response has success flag (backend should return success: true)
    // Also allow response without success flag if it has user and token (more flexible)
    if (this.isSyncSuccessPayload(responseData)) {
      console.log('✅ Backend sync successful:', responseData);

      // Store our JWT token and user info (matching test frontend exactly)
      setAuthToken(responseData.token);
      localStorage.setItem(USER_EMAIL_KEY, responseData.user.email);
      localStorage.setItem(USER_ID_KEY, responseData.user.id.toString());

      if (responseData.user.walletAddress) {
        localStorage.setItem(WALLET_ADDRESS_KEY, responseData.user.walletAddress);
      }

      // Store avatarUrl if available (from database) - transform to CloudFront URL
      if (responseData.user.avatarUrl) {
        const cloudfrontUrl = getCloudFrontUrl(responseData.user.avatarUrl);
        console.log('✅ Storing avatarUrl from backend sync (CloudFront):', cloudfrontUrl);
        localStorage.setItem(USER_AVATAR_URL_KEY, cloudfrontUrl);
        localStorage.setItem(PROFILE_AVATAR_URL_KEY, cloudfrontUrl);
        } else {
        console.log('⚠️ No avatarUrl in sync response');
      }

      // Store ALL wallets (including Aptos) for profile display - scoped by user ID
      if (responseData.wallets && responseData.wallets.length > 0) {
        const userId = responseData.user?.id;
        if (userId) {
          try {
            saveWalletsToStorage(responseData.wallets, userId.toString());
            console.log(`💼 Saved wallets for user ${userId} to localStorage:`, responseData.wallets);
          } catch (error) {
            console.error('Failed to save wallets to localStorage:', error);
          }
        }
      }

      return responseData as {
        success: boolean;
        token: string;
        user: {
          id: number;
          email: string;
          walletAddress?: string;
          walletsCount: number;
        };
        wallets: BackendWallet[];
      };
        }

    // If we get here, the response structure is unexpected
    // Try to extract user ID from any possible location in the response
    console.error('❌ Unexpected response structure:', {
      success: responseData?.success,
      hasUser: !!responseData?.user,
      hasToken: !!responseData?.token,
      dataKeys: Object.keys(responseData || {}),
      fullResponse: responseData,
        });
    
    // Last resort: try to find user ID in the response anywhere
    const possibleUserId = responseData?.user?.id || 
                          responseData?.id || 
                          responseData?.userId ||
                          (responseData?.user && typeof responseData.user === 'object' && responseData.user.id);
    
    if (possibleUserId && responseData?.token) {
      console.warn('⚠️ Found user ID and token in unexpected structure, attempting to save anyway...');
      setAuthToken(responseData.token);
      localStorage.setItem(USER_ID_KEY, possibleUserId.toString());
      if (responseData.user?.email) {
        localStorage.setItem(USER_EMAIL_KEY, responseData.user.email);
      }
      return responseData as {
        success: boolean;
        token: string;
        user: {
          id: number;
          email: string;
          walletAddress?: string;
          walletsCount: number;
        };
        wallets: BackendWallet[];
      };
          }
    
    throw new Error(`Failed to sync user: Invalid response structure. Keys: ${Object.keys(responseData || {}).join(', ')}, Success: ${responseData?.success}, Has User: ${!!responseData?.user}, Has Token: ${!!responseData?.token}`);
  }

  /**
   * Verify Privy token
   * @param token - Privy token to verify
   * @returns Verification result
   */
  async verifyToken(token: string) {
    try {
      const response = await apiPost<unknown>(
        `${API_BASE}/api/v1/auth/privy/verify`,
        { token },
      );

      return unwrapApiData(response);
    } catch (error) {
      console.error('❌ Token verification error:', error);
      return { valid: false };
    }
  }

  /**
   * Get current Privy user info from backend
   * @returns User info
   */
  async getMe() {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiGet<unknown>(`${API_BASE}/api/v1/auth/privy/me`);
      return unwrapApiData(response);
    } catch (error) {
      console.error('❌ Get user error:', error);
      throw error;
    }
  }

  /**
   * Get user wallets from backend
   */
  async getUserWallets() {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      const wallets = await walletsService.listPrivyWallets({
        preferStorage: false,
      });
      return {
        success: true,
        wallets,
        data: { wallets },
      };
    } catch (error) {
      console.error('❌ Get wallets error:', error);
      throw error;
    }
  }

  /**
   * Logout user (clear all tokens and user data)
   */
  logout() {
    clearSessionStorage();
    console.log('✅ User logged out - session storage cleared');
  }
}

export const privyService = new PrivyService();

