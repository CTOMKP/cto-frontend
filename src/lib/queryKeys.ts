/**
 * Stable TanStack Query keys — import from here instead of string literals.
 */

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

export const walletKeys = {
  all: ["wallets"] as const,
  movementContext: (userId: string | null) =>
    [...walletKeys.all, "movement-context", userId ?? "anonymous"] as const,
};

/** Serializable filters for the public listings table (pagination + chain). */
export type ListingTableFilters = {
  page: number;
  limit: number;
  /** Uppercase chain id, or null for all chains */
  chain: string | null;
};

export const listingKeys = {
  all: ["listings"] as const,
  highlights: () => [...listingKeys.all, "highlights"] as const,
  table: (filters: ListingTableFilters) =>
    [...listingKeys.all, "table", filters.page, filters.limit, filters.chain ?? "all"] as const,
  /** Authenticated user's listings (profile table). Invalidated with `listingKeys.all`. */
  mine: () => [...listingKeys.all, "mine"] as const,
  /** Public or mine user-listing detail (`/user-listings/[id]`, live page). */
  detail: (id: string) => [...listingKeys.all, "detail", id] as const,
  /** Published listing via `GET /api/v1/user-listings/{id}` (`/projects?userListingId=`). */
  publicUserListing: (id: string) => [...listingKeys.all, "public-user-listing", id] as const,
  /** Public token/coin by route key or `?address=` (projects/[id]). */
  coin: (key: string) => [...listingKeys.all, "coin", key] as const,
};

/** Marketplace ads list + detail (not token MEME listings). */
export const marketplaceKeys = {
  all: ["marketplace"] as const,
  feed: (tab: "trending" | "forYou" | "new") =>
    [...marketplaceKeys.all, "feed", tab] as const,
  ad: (id: string) => [...marketplaceKeys.all, "ad", id] as const,
};

export const creatorKeys = {
  all: ["creator-program"] as const,
  dashboard: () => [...creatorKeys.all, "dashboard"] as const,
  referrals: () => [...creatorKeys.all, "referrals"] as const,
  earnings: () => [...creatorKeys.all, "earnings"] as const,
  payouts: () => [...creatorKeys.all, "payouts"] as const,
};
