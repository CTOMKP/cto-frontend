"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { marketplaceKeys, type MarketplacePublicListParams } from "@/lib/queryKeys";
import marketplaceService from "@/services/marketplaceService";

export function useMarketplacePublicAdsQuery(
  params: MarketplacePublicListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: marketplaceKeys.public(params),
    queryFn: ({ signal }) => marketplaceService.listPublic(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    enabled,
  });
}
