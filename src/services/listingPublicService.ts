import { apiGet } from "@/lib/apiClient";
import { unwrapApiData } from "@/lib/apiResponse";
import type { ListingTableFilters } from "@/lib/queryKeys";
import type { ApiCoinItem, ApiListingResponse } from "@/types/api";

function extractListingItems(payload: unknown): ApiCoinItem[] {
  const root = unwrapApiData<Record<string, unknown>>(payload);
  if (!root || typeof root !== "object") return [];
  if (Array.isArray(root.items)) return root.items as ApiCoinItem[];
  return [];
}

function normalizeListingResponse(response: unknown): ApiListingResponse {
  const fallback: ApiListingResponse = { total: 0, items: [], page: 1, limit: 20 };
  const normalized = unwrapApiData<unknown>(response);
  const data =
    normalized && typeof normalized === "object"
      ? (normalized as ApiListingResponse)
      : fallback;
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
  return unwrapApiData<ApiCoinItem>(raw);
}
