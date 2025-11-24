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
  async syncUser(privyToken: string) {
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
        // Store CTO JWT token
        localStorage.setItem('cto_auth_token', response.data.token);
        localStorage.setItem('cto_user_email', response.data.user.email);
        localStorage.setItem('cto_user_id', response.data.user.id.toString());
        
        if (response.data.user.walletAddress) {
          localStorage.setItem('cto_wallet_address', response.data.user.walletAddress);
        }

        // Store wallets if available
        if (response.data.wallets && response.data.wallets.length > 0) {
          localStorage.setItem('cto_user_wallets', JSON.stringify(response.data.wallets));
        }

        console.log('✅ Privy user synced with CTO backend');
        return response.data;
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
   * Logout user (clear tokens)
   */
  logout() {
    localStorage.removeItem('cto_auth_token');
    localStorage.removeItem('cto_user_email');
    localStorage.removeItem('cto_user_id');
    localStorage.removeItem('cto_wallet_address');
    localStorage.removeItem('cto_user_wallets');
  }
}

export const privyService = new PrivyService();

