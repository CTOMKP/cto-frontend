import { apiGet, apiPost } from '@/lib/apiClient';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export const privyPaymentService = {
  /**
   * Create a listing payment for Privy user
   */
  async payForListing(data: { userId: number; listingId: string; chain?: string }) {
    const response = await apiPost<unknown>(
      `${API_BASE}/api/payment/privy/listing`,
      {
        userId: data.userId,
        listingId: data.listingId,
        chain: data.chain || 'base', // Default to Base
      },
    );

    return response;
  },

  /**
   * Verify a payment after transaction is submitted
   */
  async verifyPayment(paymentId: string, txHash?: string) {
    const response = await apiPost<unknown>(
      `${API_BASE}/api/payment/privy/verify/${paymentId}`,
      { txHash },
    );

    return response;
  },

  /**
   * Get pricing information
   */
  async getPricing() {
    const response = await apiGet<unknown>(`${API_BASE}/api/payment/pricing`);
    return response;
  },
};




