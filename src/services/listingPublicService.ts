import { apiGet } from "@/lib/apiClient";
import type { ListingTableFilters } from "@/lib/queryKeys";
import type { ApiCoinItem, ApiListingResponse } from "@/types/api";

function extractListingItems(payload: unknown): ApiCoinItem[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  if (Array.isArray(root.items)) return root.items as ApiCoinItem[];
  const data = root.data;
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: ApiCoinItem[] }).items;
  }
  return [];
}

function normalizeListingResponse(response: unknown): ApiListingResponse {
  let data: ApiListingResponse;
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    if ("data" in r && r.data && typeof r.data === "object") {
      data = r.data as ApiListingResponse;
    } else if ("items" in r || "total" in r) {
      data = response as ApiListingResponse;
    } else {
      data = { total: 0, items: [], page: 1, limit: 20 };
    }
  } else {
    data = { total: 0, items: [], page: 1, limit: 20 };
  }
  return {
    total: data.total || 0,
    items: data.items || [],
    page: data.page ?? 1,
    limit: data.limit ?? 20,
  };
}

/** Paginated public MEME listings for the listings table (no auth). */
export async function fetchListingTable(
  filters: ListingTableFilters,
  signal?: AbortSignal,
): Promise<ApiListingResponse> {
  const qs = new URLSearchParams({
    category: "MEME",
    sort: "updatedAt:desc",
    page: String(filters.page),
    limit: String(filters.limit),
  });
  const chain = filters.chain?.trim();
  if (chain) qs.set("chain", chain.toUpperCase());

  return apiGet<unknown>(`/api/v1/listing/listings?${qs.toString()}`, { signal, auth: false }).then(
    normalizeListingResponse,
  );
}

/** Public MEME listings for highlights strip (no auth). */
export async function fetchListingHighlights(signal?: AbortSignal): Promise<ApiCoinItem[]> {
  return apiGet<unknown>(
    `/api/v1/listing/listings?category=MEME&sort=updatedAt%3Adesc&limit=10000`,
    { signal, auth: false },
  ).then(extractListingItems);
}

/** Single public listing / coin for project profile (`GET /api/v1/listing/:id`). */
export async function fetchPublicListingCoin(
  identifier: string,
  signal?: AbortSignal,
): Promise<ApiCoinItem> {
  const raw = await apiGet<unknown>(
    `/api/v1/listing/${encodeURIComponent(identifier)}`,
    { signal, auth: false },
  );
  if (raw && typeof raw === "object" && "data" in raw && (raw as { data?: unknown }).data) {
    return (raw as { data: ApiCoinItem }).data;
  }
  return raw as ApiCoinItem;
}
