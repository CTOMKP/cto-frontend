import { apiGet, apiPost, apiPut } from '@/lib/apiClient';

function unwrapData(res: unknown): Record<string, unknown> {
  const out = ((res as { data?: unknown })?.data ?? res) as unknown;
  return out && typeof out === "object" ? (out as Record<string, unknown>) : {};
}

export const marketplaceService = {
  async getPricing() {
    const res = await apiGet<unknown>(`/api/v1/marketplace/pricing`);
    const responseData = unwrapData(res);
    return responseData?.items || responseData || [];
  },

  async createDraft(payload: Record<string, unknown>) {
    const res = await apiPost<unknown>(`/api/v1/marketplace/ads`, payload);
    return (res as { data?: unknown })?.data || res;
  },

  async updateDraft(adId: string, payload: Record<string, unknown>) {
    const res = await apiPut<unknown>(`/api/v1/marketplace/ads/${adId}`, payload);
    return (res as { data?: unknown })?.data || res;
  },

  async createPayment(adId: string) {
    const res = await apiPost<unknown>(`/api/v1/marketplace/ads/${adId}/pay`, {});
    return (res as { data?: unknown })?.data || res;
  },

  async verifyPayment(paymentId: string, txHash: string) {
    const res = await apiPost<unknown>(
      `/api/v1/marketplace/ads/payments/${paymentId}/verify`,
      { txHash },
    );
    return (res as { data?: unknown })?.data || res;
  },

  async listMine() {
    const res = await apiGet<unknown>(`/api/v1/marketplace/ads/mine`);
    const responseData = unwrapData(res);
    return responseData?.items || responseData || [];
  },

  async listPublic(
    params?: { page?: number; limit?: number; category?: string; subCategory?: string },
    signal?: AbortSignal,
  ) {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.category) search.set('category', params.category);
    if (params?.subCategory) search.set('subCategory', params.subCategory);
    const qs = search.toString();
    const res = await apiGet<unknown>(`/api/v1/marketplace/ads${qs ? `?${qs}` : ''}`, { signal });
    const responseData = unwrapData(res);
    return responseData?.items || responseData || [];
  },

  async listTrending(params?: { page?: number; limit?: number }, signal?: AbortSignal) {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    const res = await apiGet<unknown>(`/api/v1/marketplace/ads/trending${qs ? `?${qs}` : ''}`, { signal });
    const responseData = unwrapData(res);
    return responseData?.items || responseData || [];
  },

  async listForYou(params?: { page?: number; limit?: number }, signal?: AbortSignal) {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    const res = await apiGet<unknown>(`/api/v1/marketplace/ads/for-you${qs ? `?${qs}` : ''}`, { signal });
    const responseData = unwrapData(res);
    return responseData?.items || responseData || [];
  },

  async getPublicAd(id: string, signal?: AbortSignal) {
    const res = await apiGet<unknown>(`/api/v1/marketplace/ads/${id}`, { signal });
    const responseData = unwrapData(res);
    return responseData?.data || responseData;
  },

  /**
   * Tabbed marketplace grid: trending / for-you (with public fallback) / new.
   */
  async fetchFeed(tab: 'trending' | 'forYou' | 'new', signal?: AbortSignal): Promise<unknown[]> {
    const norm = (items: unknown) => (Array.isArray(items) ? items : []);
    if (tab === 'trending') {
      const items = await this.listTrending({ page: 1, limit: 24 }, signal);
      return norm(items);
    }
    if (tab === 'forYou') {
      try {
        const items = await this.listForYou({ page: 1, limit: 24 }, signal);
        return norm(items);
      } catch {
        const items = await this.listPublic({ page: 1, limit: 24 }, signal);
        return norm(items);
      }
    }
    const items = await this.listPublic({ page: 1, limit: 24 }, signal);
    return norm(items);
  },

  async shareAd(id: string) {
    const res = await apiPost<unknown>(`/api/v1/marketplace/ads/${id}/share`, {});
    return (res as { data?: unknown })?.data || res;
  },
};

export default marketplaceService;
