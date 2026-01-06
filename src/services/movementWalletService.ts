import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('cto_auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export interface WalletBalance {
  id: string;
  walletId: string;
  tokenAddress: string;
  tokenSymbol: string;
  balance: string;
  decimals: number;
  lastUpdated: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  txHash: string;
  txType: 'CREDIT' | 'DEBIT' | 'TRANSFER';
  amount: string;
  tokenSymbol: string;
  status: string;
  description: string;
  createdAt: string;
}

export const movementWalletService = {
  /**
   * Get Movement wallet balance from database
   */
  async getBalance(walletId: string): Promise<WalletBalance[]> {
    const response = await axios.get(`${API_BASE}/api/v1/wallet/movement/balance/${walletId}`, {
      headers: getAuthHeaders(),
    });
    return response.data?.data?.balances || response.data?.balances || [];
  },

  /**
   * Sync wallet balance from blockchain
   */
  async syncBalance(walletId: string, testnet: boolean = true): Promise<WalletBalance> {
    const response = await axios.post(
      `${API_BASE}/api/v1/wallet/movement/sync/${walletId}`,
      { testnet },
      { headers: getAuthHeaders() }
    );
    return response.data?.data?.balance || response.data?.balance;
  },

  /**
   * Get transaction history
   */
  async getTransactions(walletId: string, limit: number = 10): Promise<WalletTransaction[]> {
    const response = await axios.get(`${API_BASE}/api/v1/wallet/movement/transactions/${walletId}?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return response.data?.data?.transactions || response.data?.transactions || [];
  },

  /**
   * Poll for new transactions
   */
  async pollTransactions(walletId: string, testnet: boolean = true): Promise<WalletTransaction[]> {
    const response = await axios.post(
      `${API_BASE}/api/v1/wallet/movement/poll/${walletId}`,
      { testnet },
      { headers: getAuthHeaders() }
    );
    return response.data?.data?.transactions || response.data?.transactions || [];
  }
};
