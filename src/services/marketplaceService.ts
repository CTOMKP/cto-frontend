import { apiGet, apiPost, apiPut } from '@/lib/apiClient';
import { toRecord, unwrapApiData, unwrapApiJsonBody } from '@/lib/apiResponse';

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

/** List/detail APIs often expose `adId` or `_id`; routes and links need `id`. */
function normalizeMarketplaceAdItem(raw: unknown): unknown {
  const o = asRecord(raw);
  if (!o) return raw;
  const idVal = o.id ?? o.adId ?? o._id;
  if (idVal == null || idVal === "") return raw;
  const idStr = String(idVal);
  if (o.id === idStr) return raw;
  return { ...o, id: idStr };
}

function normalizeMarketplaceAdList(items: unknown): unknown[] {
  const arr = Array.isArray(items) ? items : [];
  return arr.map((item) => normalizeMarketplaceAdItem(item));
}

function parseMarketplaceAdDetailResponse(res: unknown): unknown {
  const unwrapped = unwrapApiJsonBody(unwrapApiData(res));
  const top = asRecord(unwrapped);
  if (top?.ad && typeof top.ad === "object" && !Array.isArray(top.ad)) {
    return normalizeMarketplaceAdItem(top.ad);
  }
  return normalizeMarketplaceAdItem(unwrapped);
}

function listItemsFromResponse(responseData: Record<string, unknown>): unknown[] {
  const raw = responseData?.items ?? responseData ?? [];
  return normalizeMarketplaceAdList(Array.isArray(raw) ? raw : []);
}

export type MarketplacePricingCatalog = {
  currency?: string;
  categories?: Array<{
    id: string;
    name: string;
    defaultPriceUsd?: number;
    active?: boolean;
    postTypes?: Array<"LOOKING_FOR" | "OFFERING">;
    defaultPostType?: "LOOKING_FOR" | "OFFERING";
    subcategories: Array<{
      id: string;
      name: string;
      priceUsd?: number;
      active?: boolean;
    }>;
  }>;
  addons?: Array<{ id: string; name: string; priceUsd: number; active: boolean }>;
};

export const marketplaceService = {
  async getPricing(): Promise<MarketplacePricingCatalog> {
    const res = await apiGet<unknown>(`/api/v1/marketplace/pricing`);
    const responseData = toRecord(unwrapApiData(res));
    return (responseData || {}) as MarketplacePricingCatalog;
  },

  async createDraft(payload: Record<string, unknown>) {
    const res = await apiPost<unknown>(`/api/v1/marketplace/ads`, payload);
    return unwrapApiData(res);
  },

  async updateDraft(adId: string, payload: Record<string, unknown>) {
    const res = await apiPut<unknown>(`/api/v1/marketplace/ads/${adId}`, payload);
    return unwrapApiData(res);
  },

  /**
   * cto-test-frontend: `res.data?.data || res.data`. Nest often double-wraps; use
   * {@link unwrapApiJsonBody} so `payment` / `transactionData` match `MarketDashboard` handlePayment.
   */
  async createPayment(adId: string, paymentChain?: "MOVEMENT" | "SOLANA") {
    const payload = paymentChain ? { paymentChain } : {};
    const res = await apiPost<unknown>(`/api/v1/marketplace/ads/${adId}/pay`, payload);
    return unwrapApiJsonBody(res);
  },

  async verifyPayment(paymentId: string, txHash: string) {
    const res = await apiPost<unknown>(
      `/api/v1/marketplace/ads/payments/${paymentId}/verify`,
      { txHash },
    );
    return unwrapApiJsonBody(res);
  },

  async listMine() {
    const res = await apiGet<unknown>(`/api/v1/marketplace/ads/mine`);
    const responseData = toRecord(unwrapApiData(res));
    return listItemsFromResponse(responseData);
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
    const responseData = toRecord(unwrapApiData(res));
    return listItemsFromResponse(responseData);
  },

  async listTrending(params?: { page?: number; limit?: number }, signal?: AbortSignal) {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    const res = await apiGet<unknown>(`/api/v1/marketplace/ads/trending${qs ? `?${qs}` : ''}`, { signal });
    const responseData = toRecord(unwrapApiData(res));
    return listItemsFromResponse(responseData);
  },

  async listForYou(params?: { page?: number; limit?: number }, signal?: AbortSignal) {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    const res = await apiGet<unknown>(`/api/v1/marketplace/ads/for-you${qs ? `?${qs}` : ''}`, { signal });
    const responseData = toRecord(unwrapApiData(res));
    return listItemsFromResponse(responseData);
  },

  async getPublicAd(id: string, signal?: AbortSignal) {
    const res = await apiGet<unknown>(`/api/v1/marketplace/ads/${id}`, { signal });
    return parseMarketplaceAdDetailResponse(res);
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
    return unwrapApiData(res);
  },
};

export default marketplaceService;
