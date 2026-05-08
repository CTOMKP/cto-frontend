import type { AllUserListings, ApiCoinItem } from "@/types/api";

function emptyTxns() {
  const z = { buys: 0, sells: 0 };
  return { h1: z, h6: z, m5: z, h24: z };
}

/** Maps a user listing detail payload into {@link ApiCoinItem} for `/projects` UI. */
export function mapUserListingToApiCoinItem(listing: AllUserListings): ApiCoinItem {
  const md = listing.scanMetadata;
  const vr = md?.vetting_results;
  const risk = listing.scanRiskScore ?? listing.vettingScore ?? null;
  const tierRaw = listing.vettingTier || listing.scanTier || "";
  const tierLower = tierRaw ? String(tierRaw).trim().toLowerCase() : null;

  const holders = md?.holder_count ?? 0;
  const priceUsd = md?.token_price ?? 0;
  const liq = md?.lp_amount_usd ?? 0;
  const mcap = md?.market_cap ?? null;
  const vol = md?.volume_24h ?? 0;

  return {
    id: listing.id,
    contractAddress: listing.contractAddr,
    chain: listing.chain,
    category: "MEME",
    symbol: md?.token_symbol ?? "",
    name: md?.token_name || listing.title || "",
    summary: listing.description || listing.bio || listing.scanSummary || null,
    riskScore: risk,
    communityScore: null,
    tier: tierLower,
    priceUsd,
    change1m: null,
    change5m: null,
    change1h: null,
    change6h: null,
    change24h: null,
    liquidityUsd: liq,
    marketCap: mcap,
    volume24h: vol,
    holders,
    age: md?.age_display ?? md?.age_display_short ?? null,
    txCount1h: null,
    txCount24h: null,
    metadata: {
      lpData: {
        lpBurned: false,
        lpLocked: false,
        lockDetails: [],
        lpLockPercentage: 0,
        totalLiquidityUsd: liq,
      },
      market: {
        age: md?.age_display ?? null,
        fdv: mcap ?? 0,
        txns: emptyTxns(),
        source: "user-listing",
        volume: { h24: vol },
        chainId: listing.chain,
        holders,
        logoUrl: listing.logoUrl ?? "",
        category: "MEME",
        priceUsd,
        riskScore: risk,
        lastUpdated: Date.now(),
        pairAddress: "",
        priceChange: { h1: null, h6: null, m5: null, h24: null },
        liquidityUsd: liq,
        communityScore: null,
      },
      imageUrl: listing.logoUrl ?? "",
      tokenAge: md?.project_age_days ?? 0,
      topHolders: [],
      launchAnalysis: {
        creatorStatus: "",
        creatorAddress: null,
        creatorBalance: 0,
        top10HolderRate: 0,
        creatorTokenCount: 0,
      },
      vettingResults: {
        flags: vr?.allFlags ?? [],
        riskLevel: vr?.riskLevel ?? "",
        eligibleTier: vr?.eligibleTier ?? "",
        overallScore: vr?.overallScore ?? risk ?? 0,
        componentScores: {
          liquidity: vr?.componentScores?.liquidity?.score ?? 0,
          technical: vr?.componentScores?.technical?.score ?? 0,
          distribution: vr?.componentScores?.distribution?.score ?? 0,
          devAbandonment: vr?.componentScores?.devAbandonment?.score ?? 0,
        },
      },
    },
    lastScannedAt: md?.scan_timestamp ?? null,
    vetted: listing.status === "PUBLISHED",
    lpBurnedPercentage: null,
    top10HoldersPercentage: null,
    mintAuthDisabled: null,
    raidingDetected: null,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    logoUrl: listing.logoUrl,
  };
}
