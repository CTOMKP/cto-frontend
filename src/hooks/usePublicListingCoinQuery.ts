"use client";

import { useQuery } from "@tanstack/react-query";
import { listingKeys } from "@/lib/queryKeys";
import { fetchPublicListingCoin } from "@/services/listingPublicService";

export function usePublicListingCoinQuery(identifier: string | undefined) {
  const key = identifier?.trim() || "";

  return useQuery({
    queryKey: key ? listingKeys.coin(key) : [...listingKeys.all, "coin", "none"],
    queryFn: ({ signal }) => fetchPublicListingCoin(key, signal),
    enabled: key.length > 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
