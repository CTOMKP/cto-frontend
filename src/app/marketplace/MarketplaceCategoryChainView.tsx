"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MARKETPLACE_CATEGORY_DISPLAY_NAMES,
  CHAIN_DISPLAY_NAMES,
  type MarketplaceCategorySlug,
  type ChainSlug,
} from "@/lib/constants/slugs";

type Props = {
  category: MarketplaceCategorySlug;
  chain: ChainSlug;
};

/**
 * Category × chain view — e.g. "Developers on Aptos".
 * Doc: only generate page if >= 2 active ads in that combination.
 */
export default function MarketplaceCategoryChainView({ category, chain }: Props) {
  const categoryName = MARKETPLACE_CATEGORY_DISPLAY_NAMES[category];
  const chainName = CHAIN_DISPLAY_NAMES[chain];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href={`/marketplace/${category}`} className="text-white/70 hover:text-white text-sm">
            ← {categoryName}
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {categoryName} on {chainName}
        </h1>
        <p className="text-white/70 mb-8">
          Classified ads in this category for {chainName}. Only shown when ≥2 active ads exist (per URL architecture).
        </p>
        <Button className="cta-gradient" asChild>
          <Link href="/marketplace/post-ad"><Plus /> Post an ad</Link>
        </Button>
      </div>
    </div>
  );
}
