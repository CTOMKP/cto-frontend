export type SortField = 'name' | 'marketCap' | 'liquidity' | 'holders' | 'age' | 'price' | 'change24h' | 'change1m' | 'change5m' | 'change1h' | 'communityScore' | 'degenAudit';
export type SortDirection = 'asc' | 'desc' | null;

export type MockLikeCoin = {
  /** User listing row id (profile “My listings”), when sourced from `/user-listings/mine`. */
  listingId?: string;
  name: string;
  whale: boolean;
  age: string | null;
  status?: string;
  address: string;
  x?: string;
  links?: {
    website: string;
    twitter: string;
    telegram: string;
    discord: string;
  };
  website?: string;
  image?: string;
  chain?: string;
  category?: string;
  communityScore: number;
  degenAudit: number; // Risk score (0-100, higher = safer)
  tier?: string | null; // Tier badge: STELLAR, BLOOM, SPROUT, SEED, or null
  mindshare?: { mentions: number; sentiment: string; volume: number };
  price: {
    amount: number;
    change: { "1m": number; "5m": number; "1h": number; "5h": number; "24h": number };
  };
  marketCap: number;
  liquidity: number;
  volume: { amount: number; timeframe?: number };
  holders: number;
};

