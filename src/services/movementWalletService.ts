import { apiGet, apiPost } from '@/lib/apiClient';
import { toRecord, unwrapApiData } from '@/lib/apiResponse';

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
    const data = toRecord(unwrapApiData(response));
    return (data.balances as WalletBalance[] | undefined) ?? [];
  },

  /**
   * Sync wallet balance from blockchain
   */
  async syncBalance(walletId: string, testnet: boolean = true): Promise<WalletBalance> {
    const response = await apiPost<unknown>(
      `/api/v1/wallet/movement/sync/${walletId}`,
      { testnet },
    );
    const data = toRecord(unwrapApiData(response));
    return data.balance as WalletBalance;
  },

  /**
   * Get transaction history
   */
  async getTransactions(walletId: string, limit: number = 10): Promise<WalletTransaction[]> {
    const response = await apiGet<unknown>(`/api/v1/wallet/movement/transactions/${walletId}?limit=${limit}`);
    const data = toRecord(unwrapApiData(response));
    return (data.transactions as WalletTransaction[] | undefined) ?? [];
  },

  /**
   * Poll for new transactions
   */
  async pollTransactions(walletId: string, testnet: boolean = true): Promise<WalletTransaction[]> {
    const response = await apiPost<unknown>(
      `/api/v1/wallet/movement/poll/${walletId}`,
      { testnet },
    );
    const data = toRecord(unwrapApiData(response));
    return (data.transactions as WalletTransaction[] | undefined) ?? [];
  }
};
