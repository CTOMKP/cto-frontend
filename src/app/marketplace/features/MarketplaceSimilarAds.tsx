"use client";

import { useMemo } from "react";
import { useMarketplacePublicAdsQuery } from "@/hooks/useMarketplacePublicAdsQuery";
import MarketplaceAdRail from "./MarketplaceAdRail";
import {
  MARKETPLACE_RAIL_MAX_ADS,
  fieldsMatch,
  type MarketplaceAd,
} from "./marketplaceAd";

function similarScore(
  ad: MarketplaceAd,
  current: {
    category: string;
    subCategory: string;
    offerType: string;
  },
) {
  let score = 0;
  if (current.category && fieldsMatch(ad.category, current.category)) score += 3;
  if (current.subCategory && fieldsMatch(ad.subCategory, current.subCategory)) score += 5;
  if (current.offerType && fieldsMatch(ad.offerType, current.offerType)) score += 2;
  return score;
}

export default function MarketplaceSimilarAds({
  currentAdId,
  category,
  subCategory,
  offerType,
}: {
  currentAdId: string;
  category?: string | null;
  subCategory?: string | null;
  offerType?: string | null;
}) {
  const query = useMarketplacePublicAdsQuery({ page: 1, limit: 48 });

  const ads = useMemo(() => {
    const items = ((query.data ?? []) as MarketplaceAd[]).filter(
      (ad) => ad.id && ad.id !== currentAdId,
    );
    const scored = items
      .map((ad) => ({
        ad,
        score: similarScore(ad, {
          category: String(category ?? ""),
          subCategory: String(subCategory ?? ""),
          offerType: String(offerType ?? ""),
        }),
      }))
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return (b.ad.viewCount || 0) - (a.ad.viewCount || 0);
      });
    const similar = scored.filter(({ score }) => score > 0).map(({ ad }) => ad);
    const rest = scored.filter(({ score }) => score === 0).map(({ ad }) => ad);
    return [...similar, ...rest].slice(0, MARKETPLACE_RAIL_MAX_ADS);
  }, [query.data, currentAdId, category, subCategory, offerType]);

  if (query.isPending && query.data === undefined) return null;

  return <MarketplaceAdRail title="Because you liked this ad" ads={ads} />;
}
