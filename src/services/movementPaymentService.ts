import axios from 'axios';
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
      const response = await axios.post(
        `${API_BASE}/api/v1/payment/movement/listing/${listingId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Handle wrapped response from TransformInterceptor
      const responseData = response.data?.data || response.data;
      console.log('✅ Payment created successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Payment creation failed:', error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
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
      const response = await axios.post(
        `${API_BASE}/api/v1/payment/movement/ad/${adId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const responseData = response.data?.data || response.data;
      console.log('✅ Ad payment created successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Ad payment creation failed:', error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
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
      const response = await axios.post(
        `${API_BASE}/api/v1/payment/movement/verify/${paymentId}`,
        { txHash },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Handle wrapped response from TransformInterceptor
      const responseData = response.data?.data || response.data;
      console.log('✅ Payment verified successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
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
