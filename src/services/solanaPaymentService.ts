import { apiGet, apiPost } from "@/lib/apiClient";
import { unwrapApiData } from "@/lib/apiResponse";

/** Same unwrap as cto-test-frontend axios `return res.data?.data || res.data` (one `.data` step on the JSON body). */
function solanaPaymentBody<T = unknown>(raw: unknown): T {
  return unwrapApiData(raw) as T;
}

export const solanaPaymentService = {
  async getListingQuote(listingId: string) {
    const res = await apiGet<unknown>(`/api/v1/payment/solana/listing/${listingId}/quote`);
    return solanaPaymentBody(res);
  },

  async createListingPayment(listingId: string) {
    const res = await apiPost<unknown>(`/api/v1/payment/solana/listing/${listingId}`, {});
    return solanaPaymentBody(res);
  },

  async broadcastPayment(paymentId: string, signedTransaction: string) {
    const res = await apiPost<unknown>(`/api/v1/payment/solana/broadcast/${paymentId}`, {
      signedTransaction,
    });
    return solanaPaymentBody(res);
  },

  async verifyPayment(paymentId: string, txHash: string) {
    const res = await apiPost<unknown>(`/api/v1/payment/solana/verify/${paymentId}`, { txHash });
    return solanaPaymentBody(res);
  },

  async verifyMarketplaceAdPayment(paymentId: string, txHash: string) {
    const res = await apiPost<unknown>(`/api/v1/payment/solana/verify-ad/${paymentId}`, { txHash });
    return solanaPaymentBody(res);
  },
};

export default solanaPaymentService;
