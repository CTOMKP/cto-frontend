import axios from 'axios';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';;

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cto_auth_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const marketplaceService = {
  async getPricing() {
    const res = await axios.get(`${backendUrl}/api/v1/marketplace/pricing`);
    const responseData = res.data?.data || res.data;
    return responseData?.items || responseData || [];
  },

  async createDraft(payload: Record<string, unknown>) {
    const url = `${backendUrl}/api/v1/marketplace/ads`;
    try {
      const res = await axios.post(url, payload, {
        headers: authHeaders(),
      });
      return res.data?.data || res.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        // validation errors surfaced to caller
      }
      throw err;
    }
  },

  async updateDraft(adId: string, payload: Record<string, unknown>) {
    const url = `${backendUrl}/api/v1/marketplace/ads/${adId}`;
    try {
      const res = await axios.put(url, payload, {
        headers: authHeaders(),
      });
      return res.data?.data || res.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        // validation errors surfaced to caller
      }
      throw err;
    }
  },

  async createPayment(adId: string) {
    const res = await axios.post(`${backendUrl}/api/v1/marketplace/ads/${adId}/pay`, {}, {
      headers: authHeaders(),
    });
    return res.data?.data || res.data;
  },

  async verifyPayment(paymentId: string, txHash: string) {
    const res = await axios.post(
      `${backendUrl}/api/v1/marketplace/ads/payments/${paymentId}/verify`,
      { txHash },
      { headers: authHeaders() }
    );
    return res.data?.data || res.data;
  },

  async listMine() {
    const res = await axios.get(`${backendUrl}/api/v1/marketplace/ads/mine`, {
      headers: authHeaders(),
    });
    const responseData = res.data?.data || res.data;
    return responseData?.items || responseData || [];
  },

  async listPublic(params?: { page?: number; limit?: number; category?: string; subCategory?: string }) {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.category) search.set('category', params.category);
    if (params?.subCategory) search.set('subCategory', params.subCategory);
    const qs = search.toString();
    const res = await axios.get(`${backendUrl}/api/v1/marketplace/ads${qs ? `?${qs}` : ''}`);
    const responseData = res.data?.data || res.data;
    return responseData?.items || responseData || [];
  },

  async listTrending(params?: { page?: number; limit?: number }) {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    const res = await axios.get(`${backendUrl}/api/v1/marketplace/ads/trending${qs ? `?${qs}` : ''}`);
    const responseData = res.data?.data || res.data;
    return responseData?.items || responseData || [];
  },

  async listForYou(params?: { page?: number; limit?: number }) {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    const res = await axios.get(`${backendUrl}/api/v1/marketplace/ads/for-you${qs ? `?${qs}` : ''}`, {
      headers: authHeaders(),
    });
    const responseData = res.data?.data || res.data;
    return responseData?.items || responseData || [];
  },

  async getPublicAd(id: string) {
    const res = await axios.get(`${backendUrl}/api/v1/marketplace/ads/${id}`);
    const responseData = res.data?.data || res.data;
    return responseData?.data || responseData;
  },

  async shareAd(id: string) {
    const res = await axios.post(`${backendUrl}/api/v1/marketplace/ads/${id}/share`, {}, {
      headers: authHeaders(),
    });
    return res.data?.data || res.data;
  },
};

export default marketplaceService;
