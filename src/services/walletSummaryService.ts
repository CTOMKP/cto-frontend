import { apiGet } from "@/lib/apiClient";
import { unwrapApiData } from "@/lib/apiResponse";

export type WalletPaidOutSummary = {
  totalPaidOut: string;
  totalPaidOutUsd: number;
  currency: "USD";
  tokenSymbol: "USDC";
  transactionCount: number;
  calculatedAt: string;
};

export async function getTotalPaidOut(
  signal?: AbortSignal,
): Promise<WalletPaidOutSummary> {
  const response = await apiGet<unknown>(
    "/api/v1/wallet/summary/total-paid-out",
    { signal },
  );
  return unwrapApiData<WalletPaidOutSummary>(response);
}
