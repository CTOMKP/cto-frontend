const CIRCLE_API_BASE = 'https://cto-backend-production-28e3.up.railway.app/api';

export interface CircleUser {
  id: string;
  email: string;
  status: string;
  circleUserId?: string;
  pinStatus?: string;
}

export interface CircleLoginResponse {
  success: boolean;
  user: CircleUser;
  token: string;
}

export interface CircleUserTokenResponse {
  success: boolean;
  userToken: string;
  challengeId?: string;
}

export interface CircleWallet {
  id: string;
  address: string;
  blockchain: string;
  status: string;
}

export interface CircleWalletResponse {
  success: boolean;
  wallet: CircleWallet;
}

export interface CircleBalance {
  tokenId: string;
  amount: string;
  token: {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
  };
}

export interface CircleTransaction {
  id: string;
  type: string;
  status: string;
  amount: string;
  tokenId: string;
  createdAt: string;
}

class CircleAuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = CIRCLE_API_BASE;
  }

  // Create or continue a Circle user
  async createUser(userId: string, email: string, password: string): Promise<CircleUser> {
    const requestBody = {
      userId,
      email,
      password
    };

    const response = await fetch(`${this.baseUrl}/circle/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const textError = await response.text();
        errorData = { error: `HTTP ${response.status}: ${textError}` };
      }
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to create user`);
    }

    const data = await response.json();
    return data.user;
  }

  // Login with stored credentials
  async login(userId: string, password: string): Promise<CircleLoginResponse> {
    const requestBody = {
      userId,
      password
    };

    const response = await fetch(`${this.baseUrl}/circle/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const textError = await response.text();
        errorData = { error: `HTTP ${response.status}: ${textError}` };
      }
      throw new Error(errorData.error || `HTTP ${response.status}: Login failed`);
    }

    const data = await response.json();
    return data;
  }

  // Get Circle userToken for user (ephemeral)
  async getUserToken(userId: string): Promise<CircleUserTokenResponse> {
    const response = await fetch(`${this.baseUrl}/circle/users/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user token');
    }

    return await response.json();
  }

  // Initialize user for PIN setup
  async initializeUser(userId: string): Promise<{ success: boolean; challengeId?: string }> {
    const response = await fetch(`${this.baseUrl}/circle/users/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize user');
    }

    return await response.json();
  }

  // Create wallet for user
  async createWallet(userId: string, userToken: string, challengeId?: string): Promise<CircleWalletResponse> {
    const response = await fetch(`${this.baseUrl}/circle/wallets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userToken,
        challengeId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create wallet');
    }

    return await response.json();
  }

  // List user's wallets
  async getUserWallets(userId: string): Promise<CircleWallet[]> {
    const response = await fetch(`${this.baseUrl}/circle/users/${userId}/wallets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user wallets');
    }

    const data = await response.json();
    return data.wallets || [];
  }

  // Get wallet balances
  async getWalletBalances(walletId: string): Promise<CircleBalance[]> {
    const response = await fetch(`${this.baseUrl}/circle/wallets/${walletId}/balances`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get wallet balances');
    }

    const data = await response.json();
    return data.balances || [];
  }

  // Get wallet transactions
  async getWalletTransactions(walletId: string): Promise<CircleTransaction[]> {
    const response = await fetch(`${this.baseUrl}/circle/wallets/${walletId}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get wallet transactions');
    }

    const data = await response.json();
    return data.transactions || [];
  }

  // Reset local password
  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/circle/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        newPassword
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }

    return await response.json();
  }
}

export const circleAuthService = new CircleAuthService();
