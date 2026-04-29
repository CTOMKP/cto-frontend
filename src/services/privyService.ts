import axios from 'axios';
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

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Privy Authentication Service
 * Handles Privy authentication and syncs with CTO backend
 */
class PrivyService {
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
    let response;
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
        
        response = await axios.post(
        `${API_BASE}/api/v1/auth/privy/sync`,
          { privyToken: freshToken },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000 // 30 second timeout (matching test frontend)
          }
        );
        
        // If we get here, the request succeeded
        break;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ Sync attempt ${retryCount + 1} failed:`, errorMessage);
        
        // Log full error details for debugging on every attempt
        if (axios.isAxiosError(error)) {
          console.error(`❌ Backend error (attempt ${retryCount + 1}):`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.response?.data?.message || error.response?.data?.error,
            url: error.config?.url,
          });
        }
        
        if (retryCount === maxRetries) {
          // On final failure, throw with detailed error
          if (axios.isAxiosError(error)) {
            const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message;
            throw new Error(`Failed to sync user: ${backendMessage} (Status: ${error.response?.status || 'N/A'})`);
          }
          throw error; // Re-throw the last error
        }
        
        // Wait a bit before retrying (matching test frontend: 2 second delay)
        await new Promise(resolve => setTimeout(resolve, 2000));
        retryCount++;
      }
    }

    if (!response) {
      throw new Error('No response received from backend');
    }

    // Check HTTP status first - if it's an error status, treat as error
    if (response.status >= 400) {
      console.error('❌ Backend returned error status:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
      const errorMessage = response.data?.message || response.data?.error || `Backend returned status ${response.status}`;
      throw new Error(`Failed to sync user: ${errorMessage} (Status: ${response.status})`);
        }

    // Log the full response for debugging - CRITICAL for debugging
    const dataKeys = response.data ? Object.keys(response.data) : [];
    console.log('📦 Backend sync response:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      dataKeys: dataKeys,
      dataKeysString: dataKeys.join(', '), // Show actual keys
      success: response.data?.success,
      hasUser: !!response.data?.user,
      userId: response.data?.user?.id,
      hasToken: !!response.data?.token,
      fullResponseData: JSON.stringify(response.data, null, 2),
    });

    // Extract response data - handle different possible response structures
    let responseData = response.data;
    
    // Check if data is nested (some APIs wrap responses)
    if (responseData?.data && typeof responseData.data === 'object') {
      console.log('⚠️ Response data appears to be nested, trying nested structure...');
      responseData = responseData.data;
        }

    // Check if response has success flag (backend should return success: true)
    // Also allow response without success flag if it has user and token (more flexible)
    if ((responseData?.success === true || (responseData?.user && responseData?.token)) && responseData?.user && responseData?.token) {
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

      return responseData;
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
      return responseData;
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
      const response = await axios.post(
        `${API_BASE}/api/v1/auth/privy/verify`,
        { token },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
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

      const response = await axios.get(
        `${API_BASE}/api/v1/auth/privy/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
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

      const response = await axios.get(
        `${API_BASE}/api/v1/auth/privy/wallets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
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

