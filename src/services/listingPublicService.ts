import { apiGet } from "@/lib/apiClient";
import { unwrapApiData } from "@/lib/apiResponse";
import { mapUserListingToApiCoinItem } from "@/lib/mapUserListingToApiCoinItem";
import type { ListingTableFilters } from "@/lib/queryKeys";
import type { AllUserListings, ApiCoinItem, ApiListingResponse } from "@/types/api";
import {
  userListingsService,
  type PublicUserListingsPage,
} from "@/services/userListingsService";

export const LISTING_TABLE_PAGE_SIZE = 15;
/** Load enough of both sources once so page clicks can slice in memory. */
const LISTING_SOURCE_FETCH_LIMIT = 100;

const EMPTY_USER_LISTINGS_PAGE: PublicUserListingsPage = {
  items: [],
  total: 0,
  page: 1,
  limit: LISTING_TABLE_PAGE_SIZE,
};

const EMPTY_CATALOG: ApiListingResponse = {
  total: 0,
  items: [],
  page: 1,
  limit: LISTING_TABLE_PAGE_SIZE,
};

function listingIdentityKey(contractAddress?: string | null, chain?: string | null): string | null {
  const address = String(contractAddress ?? "").trim().toLowerCase();
  if (!address) return null;
  return `${String(chain ?? "").trim().toUpperCase()}:${address}`;
}

function filterUserListingsByChain(
  items: AllUserListings[],
  chain: string | null,
): AllUserListings[] {
  if (!chain) return items;
  return items.filter((row) => String(row.chain ?? "").toUpperCase() === chain);
}

function collectUserListingKeys(items: AllUserListings[], chain: string | null): Set<string> {
  const keys = new Set<string>();
  for (const row of filterUserListingsByChain(items, chain)) {
    const key = listingIdentityKey(row.contractAddr, row.chain);
    if (key) keys.add(key);
  }
  return keys;
}

function extractListingItems(payload: unknown): ApiCoinItem[] {
  const root = unwrapApiData<Record<string, unknown>>(payload);
  if (!root || typeof root !== "object") return [];
  if (Array.isArray(root.items)) return root.items as ApiCoinItem[];
  return [];
}

function normalizeListingResponse(response: unknown): ApiListingResponse {
  const fallback: ApiListingResponse = { total: 0, items: [], page: 1, limit: LISTING_TABLE_PAGE_SIZE };
  const normalized = unwrapApiData<unknown>(response);
  const data =
    normalized && typeof normalized === "object"
      ? (normalized as ApiListingResponse)
      : fallback;
  return {
    total: data.total || 0,
    items: data.items || [],
    page: data.page ?? 1,
    limit: data.limit ?? LISTING_TABLE_PAGE_SIZE,
  };
}

async function fetchCatalogPage(
  page: number,
  limit: number,
  chain: string | null,
  signal?: AbortSignal,
): Promise<ApiListingResponse> {
  const qs = new URLSearchParams({
    category: "MEME",
    sort: "updatedAt:desc",
    page: String(page),
    limit: String(limit),
  });
  if (chain) qs.set("chain", chain);

  return apiGet<unknown>(`/api/v1/listing/listings?${qs.toString()}`, {
    signal,
    auth: false,
  }).then(normalizeListingResponse);
}

/** Pull `take` catalog rows starting at `offset`, using page-based listing APIs. */
async function fetchCatalogSlice(
  offset: number,
  take: number,
  pageSize: number,
  chain: string | null,
  signal: AbortSignal | undefined,
  firstPage?: ApiListingResponse,
): Promise<{ items: ApiCoinItem[]; total: number }> {
  if (take <= 0) {
    return { items: [], total: firstPage?.total ?? 0 };
  }

  const items: ApiCoinItem[] = [];
  let total = firstPage?.total ?? 0;
  let remaining = take;
  let cursor = Math.max(0, offset);

  while (remaining > 0) {
    const page = Math.floor(cursor / pageSize) + 1;
    const skip = cursor % pageSize;
    const cached =
      page === 1 && firstPage
        ? firstPage
        : await fetchCatalogPage(page, pageSize, chain, signal);
    total = cached.total;

    if (!cached.items.length) break;

    const slice = cached.items.slice(skip, skip + remaining);
    if (!slice.length) break;

    items.push(...slice);
    remaining -= slice.length;
    cursor += slice.length;
    if (cursor >= total) break;
  }

  return { items, total };
}

/**
 * Combined public table: published user listings first, then catalog tokens.
 * Duplicate contract+chain rows from the catalog are skipped.
 */
async function mergeCatalogWithPublishedUserListings(
  filters: ListingTableFilters,
  catalogPage1: ApiListingResponse,
  userPage: PublicUserListingsPage,
  signal?: AbortSignal,
): Promise<ApiListingResponse> {
  const page = Math.max(1, filters.page);
  const limit = Math.max(1, filters.limit);
  const chain = filters.chain?.trim().toUpperCase() || null;
  const offset = (page - 1) * limit;
  const userTotal = userPage.total;
  const catalogTotal = catalogPage1.total;

  const mappedUserItems = filterUserListingsByChain(userPage.items, chain).map(
    mapUserListingToApiCoinItem,
  );

  let userKeys = collectUserListingKeys(userPage.items, chain);
  const needsCatalog = catalogTotal > 0 && offset + limit > userTotal;
  if (needsCatalog && userTotal > userPage.items.length) {
    const allUsers = await userListingsService
      .listPublic(1, userTotal, signal, chain)
      .catch(() => EMPTY_USER_LISTINGS_PAGE);
    userKeys = collectUserListingKeys(allUsers.items, chain);
  }

  const takeFromCatalog = (rows: ApiCoinItem[], remaining: number): ApiCoinItem[] => {
    const out: ApiCoinItem[] = [];
    for (const item of rows) {
      if (out.length >= remaining) break;
      const key = listingIdentityKey(item.contractAddress, item.chain);
      if (key && userKeys.has(key)) continue;
      out.push(item);
    }
    return out;
  };

  let items: ApiCoinItem[];

  if (offset >= userTotal) {
    const catalogOffset = offset - userTotal;
    const extraForDupes = userKeys.size;
    const catalogSlice = await fetchCatalogSlice(
      catalogOffset,
      limit + extraForDupes,
      limit,
      chain,
      signal,
      Math.floor(catalogOffset / limit) + 1 === 1 ? catalogPage1 : undefined,
    );
    items = takeFromCatalog(catalogSlice.items, limit);
  } else if (offset + limit <= userTotal) {
    items = mappedUserItems.slice(0, limit);
  } else {
    const remaining = Math.max(0, limit - mappedUserItems.length);
    const catalogSlice = await fetchCatalogSlice(
      0,
      remaining + userKeys.size,
      limit,
      chain,
      signal,
      catalogPage1,
    );
    items = [...mappedUserItems, ...takeFromCatalog(catalogSlice.items, remaining)];
  }

  return {
    items,
    total: userTotal + catalogTotal,
    page,
    limit,
  };
}

export type ListingTableSources = {
  userPage: PublicUserListingsPage;
  catalog: ApiListingResponse;
};

export type CombinedListingPage = ApiListingResponse & {
  fullyLoaded: boolean;
  loadedCount: number;
};

/** Fetch published user listings + catalog once (independent of table page). */
export async function fetchListingTableSources(
  chain: string | null,
  signal?: AbortSignal,
): Promise<ListingTableSources> {
  const normalizedChain = chain?.trim().toUpperCase() || null;
  const [catalogResult, userResult] = await Promise.allSettled([
    fetchCatalogPage(1, LISTING_SOURCE_FETCH_LIMIT, normalizedChain, signal),
    userListingsService.listPublic(1, LISTING_SOURCE_FETCH_LIMIT, signal, normalizedChain),
  ]);

  if (catalogResult.status === "rejected" && userResult.status === "rejected") {
    throw catalogResult.reason;
  }

  return {
    catalog: catalogResult.status === "fulfilled" ? catalogResult.value : EMPTY_CATALOG,
    userPage: userResult.status === "fulfilled" ? userResult.value : EMPTY_USER_LISTINGS_PAGE,
  };
}

/** Merge cached sources and slice the requested page locally (no network). */
export function buildCombinedListingPage(
  sources: ListingTableSources | undefined,
  page: number,
  limit: number,
  chain: string | null,
): CombinedListingPage {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const normalizedChain = chain?.trim().toUpperCase() || null;

  if (!sources) {
    return {
      items: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
      fullyLoaded: false,
      loadedCount: 0,
    };
  }

  const mappedUserItems = filterUserListingsByChain(sources.userPage.items, normalizedChain).map(
    mapUserListingToApiCoinItem,
  );
  const userKeys = collectUserListingKeys(sources.userPage.items, normalizedChain);
  const catalogItems = sources.catalog.items.filter((item) => {
    const key = listingIdentityKey(item.contractAddress, item.chain);
    return !key || !userKeys.has(key);
  });
  const combined = [...mappedUserItems, ...catalogItems];
  const userTotal = normalizedChain ? mappedUserItems.length : sources.userPage.total;
  const total = userTotal + sources.catalog.total;
  const fullyLoaded =
    sources.userPage.items.length >= sources.userPage.total &&
    sources.catalog.items.length >= sources.catalog.total;
  const offset = (safePage - 1) * safeLimit;

  return {
    items: combined.slice(offset, offset + safeLimit),
    total,
    page: safePage,
    limit: safeLimit,
    fullyLoaded,
    loadedCount: combined.length,
  };
}

/** Paginated public MEME listings for the listings table (no auth). */
export async function fetchListingTable(
  filters: ListingTableFilters,
  signal?: AbortSignal,
): Promise<ApiListingResponse> {
  const page = Math.max(1, filters.page);
  const limit = Math.max(1, filters.limit);
  const chain = filters.chain?.trim().toUpperCase() || null;

  const [catalogResult, userResult] = await Promise.allSettled([
    fetchCatalogPage(1, limit, chain, signal),
    userListingsService.listPublic(page, limit, signal, chain),
  ]);

  if (catalogResult.status === "rejected" && userResult.status === "rejected") {
    throw catalogResult.reason;
  }

  const catalogPage1 =
    catalogResult.status === "fulfilled" ? catalogResult.value : EMPTY_CATALOG;
  const userPage =
    userResult.status === "fulfilled" ? userResult.value : EMPTY_USER_LISTINGS_PAGE;

  return mergeCatalogWithPublishedUserListings(filters, catalogPage1, userPage, signal);
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
