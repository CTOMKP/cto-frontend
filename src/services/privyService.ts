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
   * @param retryCount - Current retry attempt (for wallet creation timing)
   * @returns User data and CTO JWT token
   */
  async syncUser(privyToken: string, retryCount: number = 0): Promise<{
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
    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/privy/sync`,
        { privyToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Only update localStorage if values have changed to prevent unnecessary updates
        const currentToken = localStorage.getItem('cto_auth_token');
        const currentUserId = localStorage.getItem('cto_user_id');
        const newToken = response.data.token;
        const newUserId = response.data.user.id.toString();

        // Store CTO JWT token (only if different)
        if (currentToken !== newToken) {
          localStorage.setItem('cto_auth_token', newToken);
        }
        if (currentUserId !== newUserId) {
          localStorage.setItem('cto_user_id', newUserId);
        }
        localStorage.setItem('cto_user_email', response.data.user.email);
        
        if (response.data.user.walletAddress) {
          localStorage.setItem('cto_wallet_address', response.data.user.walletAddress);
        }

        // Store avatarUrl if available (only if different)
        if (response.data.user.avatarUrl) {
          const currentAvatarUrl = localStorage.getItem('cto_user_avatar_url');
          if (currentAvatarUrl !== response.data.user.avatarUrl) {
            localStorage.setItem('cto_user_avatar_url', response.data.user.avatarUrl);
          }
        }

        // Store wallets if available (only if different)
        if (response.data.wallets && response.data.wallets.length > 0) {
          const currentWallets = localStorage.getItem('cto_user_wallets');
          const newWalletsJson = JSON.stringify(response.data.wallets);
          if (currentWallets !== newWalletsJson) {
            localStorage.setItem('cto_user_wallets', newWalletsJson);
          }
          console.log('✅ Privy user synced with CTO backend');
          return response.data;
        } else {
          // No wallets yet - Privy might still be creating them
          console.log(`⏳ User synced but no wallets yet (attempt ${retryCount + 1}/5)`);
          
          // Retry up to 5 times with exponential backoff
          if (retryCount < 5) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 8000); // Max 8 seconds
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.syncUser(privyToken, retryCount + 1);
          } else {
            // After 5 retries, accept the user without wallets
            console.warn('⚠️ User synced but Privy has not created wallets yet. User can continue but may need to refresh.');
            return response.data;
          }
        }
      }

      throw new Error('Failed to sync user');
    } catch (error: unknown) {
      console.error('❌ Privy sync error:', error);
      let message = 'Failed to sync with backend';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message || message;
      }
      throw new Error(message);
    }
  }

  /**
   * Verify Privy token
   * @param token - Privy token to verify
   * @returns Verification result
   */
  async verifyToken(token: string) {
    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/privy/verify`,
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
        `${API_BASE}/api/auth/privy/me`,
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

