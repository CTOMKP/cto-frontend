import { ApiError } from '@/lib/apiError';
import { apiPost } from '@/lib/apiClient';
import { unwrapApiData } from '@/lib/apiResponse';
import { getAuthToken } from '@/lib/authSession';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';

function ensureAuthTokenOrThrow(): void {
  const token = getAuthToken();
  if (!token) {
    console.error('❌ No auth token found in localStorage');
    throw new Error('Authentication required. Please login first.');
  }
}

function throwMovementPaymentError(error: unknown, fallbackMessage: string): never {
  if (error instanceof ApiError) {
    const status = error.status;
    const body = error.body as { message?: string } | undefined;
    const message = body?.message || error.message;
    if (status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    if (status === 403) {
      throw new Error('Access denied. Please check your permissions.');
    }
    throw new Error(message || fallbackMessage);
  }
  throw error;
}

/**
 * Movement Payment Service
 * Handles payments using Movement test tokens (MOVE) via Privy Movement wallets
 */
export const movementPaymentService = {
  /**
   * Create a Movement payment for listing
   * @param listingId - The listing ID to pay for
   * @returns Payment data including transaction data for Privy signing
   */
  async createListingPayment(listingId: string) {
    ensureAuthTokenOrThrow();

    if (!API_BASE) {
      console.error('❌ API_BASE is not defined');
      throw new Error('Backend URL not configured');
    }

    console.log('💳 Creating Movement payment:', {
      listingId,
      apiBase: API_BASE,
      hasToken: true,
    });

    try {
      const response = await apiPost<unknown>(
        `${API_BASE}/api/v1/payment/movement/listing/${listingId}`,
        {},
      );

      // Handle wrapped response from TransformInterceptor
      const responseData = unwrapApiData(response);
      console.log('✅ Payment created successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Payment creation failed:', error);
      throwMovementPaymentError(error, 'Failed to create payment');
    }
  },

  /**
   * Create a Movement payment for an ad
   * @param adId - The ad ID to pay for
   * @returns Payment data including transaction data for Privy signing
   */
  async createAdPayment(adId: string) {
    ensureAuthTokenOrThrow();

    if (!API_BASE) {
      console.error('❌ API_BASE is not defined');
      throw new Error('Backend URL not configured');
    }

    console.log('💳 Creating Movement payment for ad:', { adId, apiBase: API_BASE, hasToken: true });

    try {
      const response = await apiPost<unknown>(
        `${API_BASE}/api/v1/payment/movement/ad/${adId}`,
        {},
      );

      const responseData = unwrapApiData(response);
      console.log('✅ Ad payment created successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Ad payment creation failed:', error);
      throwMovementPaymentError(error, 'Failed to create ad payment');
    }
  },

  /**
   * Verify a Movement payment after transaction is submitted
   * @param paymentId - The payment ID to verify
   * @param txHash - The transaction hash from the blockchain
   * @returns Verification result
   */
  async verifyPayment(paymentId: string, txHash: string) {
    ensureAuthTokenOrThrow();

    if (!API_BASE) {
      console.error('❌ API_BASE is not defined');
      throw new Error('Backend URL not configured');
    }

    console.log('🔍 Verifying Movement payment:', {
      paymentId,
      txHash,
      apiBase: API_BASE,
      hasToken: true,
    });

    try {
      const response = await apiPost<unknown>(
        `${API_BASE}/api/v1/payment/movement/verify/${paymentId}`,
        { txHash },
      );

      // Handle wrapped response from TransformInterceptor
      const responseData = unwrapApiData(response);
      console.log('✅ Payment verified successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      throwMovementPaymentError(error, 'Failed to verify payment');
    }
  },
};
