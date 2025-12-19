import axios from 'axios';

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
    wallets: Array<{
      address: string;
      chainType: string;
      walletClient: string;
      isPrimary: boolean;
    }>;
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
        
        if (retryCount === maxRetries) {
          // Log full error details for debugging
          if (axios.isAxiosError(error)) {
            console.error('❌ Backend error response:', {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              message: error.response?.data?.message,
            });
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

    if (response.data.success) {
      console.log('✅ Backend sync successful:', response.data);

      // Store our JWT token and user info (matching test frontend exactly)
      localStorage.setItem('cto_auth_token', response.data.token);
      localStorage.setItem('cto_user_email', response.data.user.email);
      localStorage.setItem('cto_user_id', response.data.user.id.toString());
      
      if (response.data.user.walletAddress) {
        localStorage.setItem('cto_wallet_address', response.data.user.walletAddress);
      }

      // Store avatarUrl if available (from database)
      if (response.data.user.avatarUrl) {
        console.log('✅ Storing avatarUrl from backend sync:', response.data.user.avatarUrl);
        localStorage.setItem('cto_user_avatar_url', response.data.user.avatarUrl);
        localStorage.setItem('profile_avatar_url', response.data.user.avatarUrl);
      } else {
        console.log('⚠️ No avatarUrl in sync response');
      }

      // Store ALL wallets (including Aptos) for profile display
      if (response.data.wallets && response.data.wallets.length > 0) {
        localStorage.setItem('cto_user_wallets', JSON.stringify(response.data.wallets));
        console.log('💼 Saved wallets to localStorage:', response.data.wallets);
      }

      return response.data;
    }

    throw new Error('Failed to sync user');
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
      const token = localStorage.getItem('cto_auth_token');
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
   * Logout user (clear all tokens and user data)
   */
  logout() {
    // Clear authentication tokens
    localStorage.removeItem('cto_auth_token');
    localStorage.removeItem('cto_user_email');
    localStorage.removeItem('cto_user_id');
    localStorage.removeItem('cto_wallet_address');
    localStorage.removeItem('cto_user_wallets');
    
    // Clear avatar/profile data
    localStorage.removeItem('cto_user_avatar_url');
    localStorage.removeItem('profile_avatar_url');
    localStorage.removeItem('profile_avatar_meta');
    localStorage.removeItem('profile_banner_url');
    
    // Clear any other user-related data
    localStorage.removeItem('cto_token');
    localStorage.removeItem('cto_user');
    
    console.log('✅ User logged out - all localStorage cleared');
  }
}

export const privyService = new PrivyService();

