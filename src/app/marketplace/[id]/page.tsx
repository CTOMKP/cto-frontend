import MarketplaceAdDetail from "../MarketplaceAdDetail";

type Props = { params: Promise<{ id: string }> };

/**
 * /marketplace/[id] — Single ad detail (approved/live ads).
 * Renders MarketplaceAdDetail for the given ad id.
 */
export default async function MarketplaceAdPage({ params }: Props) {
  const { id } = await params;
  return <MarketplaceAdDetail adId={id} />;
}
