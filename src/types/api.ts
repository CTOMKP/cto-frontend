export interface ApiCoinItem {
  id: string;
  contractAddress: string;
  chain: string;
  category: string;
  symbol: string;
  name: string;
  summary: string | null;
  riskScore: number | null;
  communityScore: number;
  tier: string | null;
  priceUsd: number;
  change1h: number;
  change6h: number;
  change24h: number;
  liquidityUsd: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  age: string | null;
  txCount1h: number;
  txCount24h: number;
  metadata: {
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
        h1: number;
        h6: number;
        h24: number;
      };
      liquidityUsd: number;
      communityScore: number | null;
    };
  };
  lastScannedAt: string | null;
  lpBurnedPercentage: number | null;
  top10HoldersPercentage: number | null;
  mintAuthDisabled: boolean | null;
  raidingDetected: boolean | null;
  createdAt: string;
  updatedAt: string;
  logoUrl?: string;
}

// API Response type for listings
export interface ApiListingResponse {
  items: ApiCoinItem[];
  total: number;
  page: number;
  limit: number;
}
