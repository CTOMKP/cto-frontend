import { apiGet, apiPost } from '@/lib/apiClient';

export interface WalletBalance {
  id: string;
  walletId: string;
  tokenAddress: string;
  tokenSymbol: string;
  balance: string;
  decimals: number;
  lastUpdated: string;
  networkStatus?: 'healthy' | 'degraded' | 'down';
  isStale?: boolean;
  lastSyncTime?: string;
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
    const response = await apiGet<unknown>(`/api/v1/wallet/movement/balance/${walletId}`);
    const data = (response as { data?: { balances?: WalletBalance[] }; balances?: WalletBalance[] });
    return data?.data?.balances || data?.balances || [];
  },

  /**
   * Sync wallet balance from blockchain
   */
  async syncBalance(walletId: string, testnet: boolean = true): Promise<WalletBalance> {
    const response = await apiPost<unknown>(
      `/api/v1/wallet/movement/sync/${walletId}`,
      { testnet },
    );
    const data = (response as { data?: { balance?: WalletBalance }; balance?: WalletBalance });
    return (data?.data?.balance || data?.balance) as WalletBalance;
  },

  /**
   * Get transaction history
   */
  async getTransactions(walletId: string, limit: number = 10): Promise<WalletTransaction[]> {
    const response = await apiGet<unknown>(`/api/v1/wallet/movement/transactions/${walletId}?limit=${limit}`);
    const data = (response as { data?: { transactions?: WalletTransaction[] }; transactions?: WalletTransaction[] });
    return data?.data?.transactions || data?.transactions || [];
  },

  /**
   * Poll for new transactions
   */
  async pollTransactions(walletId: string, testnet: boolean = true): Promise<WalletTransaction[]> {
    const response = await apiPost<unknown>(
      `/api/v1/wallet/movement/poll/${walletId}`,
      { testnet },
    );
    const data = (response as { data?: { transactions?: WalletTransaction[] }; transactions?: WalletTransaction[] });
    return data?.data?.transactions || data?.transactions || [];
  }
};
