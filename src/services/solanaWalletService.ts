import { apiGet, apiPost } from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";
import { toRecord, unwrapApiJsonBody } from "@/lib/apiResponse";
import type { WalletTransaction } from "@/services/movementWalletService";

export const solanaWalletService = {
  /**
   * Native SOL / USDC-on-Solana balances for an address come from the backend
   * (`GET …/wallet/solana/balance/:address`), not from Movement wallet APIs.
   */
  async getBalance(address: string) {
    try {
      const res = await apiGet<unknown>(`/api/v1/wallet/solana/balance/${address}`);
      const payload = toRecord(unwrapApiJsonBody(res));
      const solRaw = payload.sol;
      const usdcRaw = payload.usdc;
      const sol = typeof solRaw === "number" ? solRaw : Number(solRaw || 0);
      const usdc = typeof usdcRaw === "number" ? usdcRaw : Number(usdcRaw || 0);
      const normalized = {
        ...payload,
        sol: Number.isFinite(sol) ? sol : 0,
        usdc: Number.isFinite(usdc) ? usdc : 0,
      };
      return normalized;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : String(err);
      console.warn("[SOL balance] request failed", { address, message });
      throw err;
    }
  },

  async getTransactions(walletId: string, limit: number = 20): Promise<WalletTransaction[]> {
    const res = await apiGet<unknown>(`/api/v1/wallet/solana/transactions/${walletId}?limit=${limit}`);
    const data = toRecord(unwrapApiJsonBody(res));
    return (data.transactions as WalletTransaction[] | undefined) ?? [];
  },

  async pollTransactions(walletId: string, limit: number = 15, address?: string): Promise<WalletTransaction[]> {
    const res = await apiPost<unknown>(`/api/v1/wallet/solana/poll/${walletId}`, { limit, address });
    const data = toRecord(unwrapApiJsonBody(res));
    return (data.transactions as WalletTransaction[] | undefined) ?? [];
  },

  async recordTransaction(params: {
    walletId: string;
    txHash: string;
    asset: "SOL" | "USDC";
    amount: string;
    address?: string;
    toAddress?: string;
  }) {
    const res = await apiPost<unknown>(`/api/v1/wallet/solana/record/${params.walletId}`, {
      txHash: params.txHash,
      asset: params.asset,
      amount: params.amount,
      address: params.address,
      toAddress: params.toAddress,
    });
    const data = toRecord(unwrapApiJsonBody(res));
    return (data.transaction as Record<string, unknown> | undefined) ?? null;
  },
};

export default solanaWalletService;
