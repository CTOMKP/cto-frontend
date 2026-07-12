/** XP notification `data` payload (type === "XP"). */
export interface NotificationXpData {
  amount: number;
  reason: string;
  balance: number;
}

/** GET /api/v1/notifications — one item */
export interface NotificationApiItem {
  id: string;
  userId: number;
  type: string;
  title: string;
  body: string;
  data: NotificationXpData | Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

/** GET /api/v1/notifications — unwrapped inner payload */
export interface NotificationsListResponse {
  success: boolean;
  items: NotificationApiItem[];
}

/** XP ledger row from GET /api/v1/xp/me `history` */
export interface XpHistoryEntryApi {
  id: string;
  userId: number;
  type: "EARN" | "SPEND" | string;
  reason: string;
  amount: number;
  balanceAfter: number;
  eventKey?: string;
  metadata: {
    day?: string;
    streakDays?: number;
    originalAmount?: number;
    countsTowardDailyCap?: boolean;
    [key: string]: unknown;
  } | null;
  createdAt: string;
}

/** GET /api/v1/xp/me — unwrapped inner payload */
export interface XpMeApiResponse {
  success: boolean;
  balance: number;
  xpBalance: number;
  rankScore: number;
  rankTier: number;
  rankLevel: number;
  rankLabel: string;
  rankEmoji: string;
  nextRankTier: number | null;
  nextRankLevel: number | null;
  nextRankLabel: string | null;
  progressPercent: number;
  scoreProgressPercent: number;
  dayProgressPercent: number;
  rankScoreToNext: number;
  daysToNext: number;
  daysOnPlatform: number;
  currentStreakDays: number;
  history: XpHistoryEntryApi[];
}

/** GET /api/v1/wallet/solana/balance/:address — unwrapped (after double `data` unwrap) */
export interface SolanaWalletBalanceResponse {
  address: string;
  solLamports: number;
  sol: number;
  usdcAmount: string;
  usdc: number;
  usdcMint: string;
  rpcUsed: string;
}

/** One row in GET /api/v1/wallet/movement/balance/:walletId */
export interface MovementWalletBalanceRow {
  id: string;
  walletId: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  decimals: number;
  balance: string;
  balanceUsd: number | null;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/v1/wallet/movement/balance/:walletId — unwrapped inner payload */
export interface MovementWalletBalanceResponse {
  success: boolean;
  balances: MovementWalletBalanceRow[];
}

/** Marketplace ad embedded on a message thread */
export interface MessageThreadAdApi {
  id: string;
  userId: number;
  postType: string;
  category: string;
  subCategory: string;
  title: string;
  description: string;
  chain?: string | null;
  priceCurrency?: string | null;
  priceAmount?: number | null;
  [key: string]: unknown;
}

/** GET /api/v1/messages/threads — one thread */
export interface MessageThreadApiItem {
  id: string;
  adId: string;
  posterId: number;
  applicantId: number;
  status: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  createdAt: string;
  updatedAt: string;
  ad: MessageThreadAdApi;
  unreadCount?: number;
  poster?: {
    id: number;
    name?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
  } | null;
  applicant?: {
    id: number;
    name?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
  } | null;
  escrow?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/** GET /api/v1/messages/threads — unwrapped inner payload */
export interface MessageThreadsListResponse {
  success: boolean;
  items: MessageThreadApiItem[];
}
