"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { marketplaceKeys } from "@/lib/queryKeys";
import marketplaceService from "@/services/marketplaceService";

export type MarketplaceFeedTab = "trending" | "forYou" | "new";

export function useMarketplaceFeedQuery(tab: MarketplaceFeedTab) {
  return useQuery({
    queryKey: marketplaceKeys.feed(tab),
    queryFn: ({ signal }) => marketplaceService.fetchFeed(tab, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
