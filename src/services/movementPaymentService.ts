import { ApiError } from '@/lib/apiError';
import { apiPost } from '@/lib/apiClient';
import { getAuthToken } from '@/lib/authSession';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';

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
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No auth token found in localStorage');
      throw new Error('Authentication required. Please login first.');
    }

    if (!API_BASE) {
      console.error('❌ API_BASE is not defined');
      throw new Error('Backend URL not configured');
    }

    console.log('💳 Creating Movement payment:', {
      listingId,
      apiBase: API_BASE,
      hasToken: !!token,
      tokenLength: token.length,
    });

    try {
      const response = await apiPost<unknown>(
        `${API_BASE}/api/v1/payment/movement/listing/${listingId}`,
        {},
      );

      // Handle wrapped response from TransformInterceptor
      const responseData = (response as { data?: unknown })?.data || response;
      console.log('✅ Payment created successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Payment creation failed:', error);
      if (error instanceof ApiError) {
        const status = error.status;
        const body = error.body as { message?: string } | undefined;
        const message = body?.message || error.message;
        
        if (status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else {
          throw new Error(message || 'Failed to create payment');
        }
      }
      throw error;
    }
  },

  /**
   * Create a Movement payment for an ad
   * @param adId - The ad ID to pay for
   * @returns Payment data including transaction data for Privy signing
   */
  async createAdPayment(adId: string) {
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No auth token found in localStorage');
      throw new Error('Authentication required. Please login first.');
    }

    if (!API_BASE) {
      console.error('❌ API_BASE is not defined');
      throw new Error('Backend URL not configured');
    }

    console.log('💳 Creating Movement payment for ad:', { adId, apiBase: API_BASE, hasToken: !!token });

    try {
      const response = await apiPost<unknown>(
        `${API_BASE}/api/v1/payment/movement/ad/${adId}`,
        {},
      );

      const responseData = (response as { data?: unknown })?.data || response;
      console.log('✅ Ad payment created successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Ad payment creation failed:', error);
      if (error instanceof ApiError) {
        const status = error.status;
        const body = error.body as { message?: string } | undefined;
        const message = body?.message || error.message;
        if (status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else {
          throw new Error(message || 'Failed to create ad payment');
        }
      }
      throw error;
    }
  },

  /**
   * Verify a Movement payment after transaction is submitted
   * @param paymentId - The payment ID to verify
   * @param txHash - The transaction hash from the blockchain
   * @returns Verification result
   */
  async verifyPayment(paymentId: string, txHash: string) {
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No auth token found in localStorage');
      throw new Error('Authentication required. Please login first.');
    }

    if (!API_BASE) {
      console.error('❌ API_BASE is not defined');
      throw new Error('Backend URL not configured');
    }

    console.log('🔍 Verifying Movement payment:', {
      paymentId,
      txHash,
      apiBase: API_BASE,
      hasToken: !!token,
    });

    try {
      const response = await apiPost<unknown>(
        `${API_BASE}/api/v1/payment/movement/verify/${paymentId}`,
        { txHash },
      );

      // Handle wrapped response from TransformInterceptor
      const responseData = (response as { data?: unknown })?.data || response;
      console.log('✅ Payment verified successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      if (error instanceof ApiError) {
        const status = error.status;
        const body = error.body as { message?: string } | undefined;
        const message = body?.message || error.message;
        
        if (status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else {
          throw new Error(message || 'Failed to verify payment');
        }
      }
      throw error;
    }
  },
};
