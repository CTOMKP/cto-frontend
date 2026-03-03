import { isValidMarketplaceCategorySlug } from "@/lib/constants/slugs";
import MarketplaceCategoryView from "../MarketplaceCategoryView";
import MarketplaceAdDetail from "../MarketplaceAdDetail";

type Props = { params: Promise<{ category: string }> };

/**
 * /marketplace/[category] — Classified ads by role (e.g. /marketplace/developers).
 * If segment is not a valid marketplace category slug, treat as ad id and show ad detail.
 * @see URL & Slug Architecture — Section 3, Section 6
 */
export default async function MarketplaceCategoryPage({ params }: Props) {
  const { category } = await params;

  if (isValidMarketplaceCategorySlug(category)) {
    return <MarketplaceCategoryView category={category} />;
  }

  // Treat as ad id (e.g. /marketplace/1) — show ad detail
  return <MarketplaceAdDetail adId={category} />;
}
