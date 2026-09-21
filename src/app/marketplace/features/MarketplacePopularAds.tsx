"use client";

import { useMemo } from "react";
import { useMarketplacePublicAdsQuery } from "@/hooks/useMarketplacePublicAdsQuery";
import MarketplaceAdRail from "./MarketplaceAdRail";
import { MARKETPLACE_RAIL_MAX_ADS, type MarketplaceAd } from "./marketplaceAd";

export default function MarketplacePopularAds({ excludeAdId }: { excludeAdId: string }) {
  const query = useMarketplacePublicAdsQuery({ page: 1, limit: 48 });

  const ads = useMemo(() => {
    const items = (query.data ?? []) as MarketplaceAd[];
    return items
      .filter((ad) => ad.id && ad.id !== excludeAdId)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, MARKETPLACE_RAIL_MAX_ADS);
  }, [query.data, excludeAdId]);

  if (query.isPending && query.data === undefined) return null;

  return <MarketplaceAdRail title="Popular" ads={ads} />;
}
