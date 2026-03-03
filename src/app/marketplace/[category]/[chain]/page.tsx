import { notFound } from "next/navigation";
import {
  isValidMarketplaceCategorySlug,
  isValidChainSlug,
  type MarketplaceCategorySlug,
  type ChainSlug,
} from "@/lib/constants/slugs";
import MarketplaceCategoryChainView from "../../MarketplaceCategoryChainView";

type Props = { params: Promise<{ category: string; chain: string }> };

/**
 * /marketplace/[category]/[chain] — Classified ads × chain (e.g. /marketplace/developers/aptos).
 * Only generate this page if >= 2 active ads in that combination (doc).
 * @see URL & Slug Architecture — Section 3, Section 6
 */
export default async function MarketplaceCategoryChainPage({ params }: Props) {
  const { category, chain } = await params;

  if (!isValidMarketplaceCategorySlug(category) || !isValidChainSlug(chain)) {
    notFound();
  }

  return (
    <MarketplaceCategoryChainView
      category={category as MarketplaceCategorySlug}
      chain={chain as ChainSlug}
    />
  );
}
