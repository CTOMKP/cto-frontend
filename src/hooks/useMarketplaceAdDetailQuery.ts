"use client";

import { useQuery } from "@tanstack/react-query";
import { marketplaceKeys } from "@/lib/queryKeys";
import marketplaceService from "@/services/marketplaceService";

export function useMarketplaceAdDetailQuery(adId: string | undefined) {
  return useQuery({
    queryKey: adId ? marketplaceKeys.ad(adId) : [...marketplaceKeys.all, "ad", "none"],
    queryFn: ({ signal }) => marketplaceService.getPublicAd(adId!, signal),
    enabled: !!adId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
