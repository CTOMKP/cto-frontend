import { SocialLinks } from "@/app/list-asset/features/Step2";

export interface ApiCoinItem {
  id: string;
  contractAddress: string;
  chain: string;
  category: string;
  symbol: string;
  name: string;
  summary: string | null;
  riskScore: number | null;
  communityScore: number | null;
  tier: string | null;
  priceUsd: number;
  change1m: number | null;
  change5m: number | null;
  change1h: number | null;
  change6h: number | null;
  change24h: number | null;
  liquidityUsd: number;
  marketCap: number | null;
  volume24h: number;
  holders: number;
  age: string | null;
  txCount1h: number | null;
  txCount24h: number | null;
  metadata: {
    lpData: {
      lpBurned: boolean;
      lpLocked: boolean;
      lockDetails: unknown[];
      lpLockPercentage: number;
      totalLiquidityUsd: number;
    };
    market: {
      age: string | null;
      fdv: number;
      txns: {
        h1: { buys: number; sells: number };
        h6: { buys: number; sells: number };
        m5: { buys: number; sells: number };
        h24: { buys: number; sells: number };
      };
      source: string;
      volume: { h24: number };
      chainId: string;
      holders: number;
      logoUrl: string;
      category: string;
      priceUsd: number;
      riskScore: number | null;
      lastUpdated: number;
      pairAddress: string;
      priceChange: {
        h1: number | null;
        h6: number | null;
        m5: number | null;
        h24: number | null;
      };
      liquidityUsd: number;
      communityScore: number | null;
    };
    imageUrl: string;
    tokenAge: number;
    topHolders: unknown[];
    launchAnalysis: {
      creatorStatus: string;
      creatorAddress: string | null;
      creatorBalance: number;
      top10HolderRate: number;
      creatorTokenCount: number;
    };
    vettingResults: {
      flags: string[];
      riskLevel: string;
      eligibleTier: string;
      overallScore: number;
      componentScores: {
        liquidity: number;
        technical: number;
        distribution: number;
        devAbandonment: number;
      };
    };
  };
  lastScannedAt: string | null;
  vetted: boolean;
  lpBurnedPercentage: number | null;
  top10HoldersPercentage: number | null;
  mintAuthDisabled: boolean | null;
  raidingDetected: boolean | null;
  createdAt: string;
  updatedAt: string;
  logoUrl?: string;
}

export interface AllUserListings {
  id: string;
  userId: number;
  contractAddr: string;
  bannerUrl: string;
  bio: string;
  chain: string;
  createdAt: string;
  description: string;
  links: SocialLinks;
  logoUrl: string;
  scanMetadata: {
    age_display: string;
    age_display_short: string;
    creation_date: string;
    holder_count: number;
    lp_amount_usd: number;
    market_cap: number;
    project_age_days: number;
    scan_timestamp: string;
    token_name: string;
    token_price: number;
    token_symbol: string;
    vetting_results: {
      allFlags: string[];
      calculatedAt: string;
      componentScores: {
        devAbandonment: {
          flags: string[];
          score: number;
        };
        distribution: {
          flags: string[];
          score: number;
        };
        liquidity: {
          flags: string[];
          score: number;
        };
        technical: {
          flags: string[];
          score: number;
        };
      };
      dataSufficient: boolean;
      eligibleTier: string;
      missingData: unknown[];
      overallScore: number;
      riskLevel: string;
    };
    volume_24h: number;
  };
  scanRiskScore: number;
  scanSummary: string;
  scanTier: string;
  status: string;
  title: string;
  updatedAt: string;
  vettingScore: number;
  vettingTier: string;
}

// API Response type for listings
export interface ApiListingResponse {
  items: ApiCoinItem[];
  total: number;
  page: number;
  limit: number;
}
