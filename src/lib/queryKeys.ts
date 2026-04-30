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
};
