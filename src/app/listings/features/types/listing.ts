export type SortField = 'name' | 'marketCap' | 'liquidity' | 'holders' | 'age' | 'price' | 'change24h' | 'change1m' | 'change5m' | 'change1h' | 'communityScore' | 'degenAudit';
export type SortDirection = 'asc' | 'desc' | null;

export type MockLikeCoin = {
  name: string;
  whale: boolean;
  age: string | null;
  address: string;
  x?: string;
  website?: string;
  image?: string;
  chain?: string;
  category?: string;
  communityScore: number;
  degenAudit: number; // not in API; filled with 0 to keep UI stable
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

