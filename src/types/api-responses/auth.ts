import type { ApiEnvelope } from "./common";

/** POST /api/v1/auth/privy/sync — request body */
export interface PrivySyncRequest {
  privyToken: string;
}

/** Wallet row on `user.wallets` (full DB shape from sync/profile). */
export interface AuthUserWallet {
  id: string;
  circleWalletId: string | null;
  privyWalletId: string | null;
  address: string;
  blockchain: "ETHEREUM" | "SOLANA" | "MOVEMENT" | "APTOS" | string;
  type: "PRIVY_EMBEDDED" | "PRIVY_EXTERNAL" | string;
  walletClient: "privy" | "external" | string;
  description: string | null;
  isPrimary: boolean;
  encryptedPrivateKey: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/** Compact wallet in top-level `wallets[]` on privy sync. */
export interface PrivySyncWalletSummary {
  id: string;
  address: string;
  chainType: "ethereum" | "solana" | "movement" | "aptos" | string;
  walletClient: string;
  isPrimary: boolean;
}

/** User object nested in privy sync + profile responses. */
export interface AuthUserProfile {
  id: number;
  email: string;
  name: string | null;
  bio: string | null;
  walletAddress: string | null;
  walletId: string | null;
  role: string;
  privyUserId: string;
  walletsCount: number;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  xpBalance: number;
  rankScore: number;
  rankTier: number;
  rankLevel: number;
  rankLabel: string;
  rankEmoji: string;
  nextRankTier: number | null;
  nextRankLevel: number | null;
  nextRankLabel: string | null;
  /** API field name on sync; profile may use `progressPercent` instead */
  rankProgressPercent?: number;
  progressPercent?: number;
  scoreProgressPercent?: number;
  dayProgressPercent?: number;
  rankScoreToNext?: number;
  daysToNext?: number;
  daysOnPlatform?: number;
  currentStreakDays: number;
  wallets?: AuthUserWallet[];
}

/** POST /api/v1/auth/privy/sync — unwrapped inner payload */
export interface PrivySyncResponse {
  success: boolean;
  token: string;
  user: AuthUserProfile;
  wallets: PrivySyncWalletSummary[];
}

/** GET /api/v1/auth/profile — unwrapped inner payload (same shape as sync user) */
export type AuthProfileResponse = AuthUserProfile;

/** GET /api/v1/auth/privy/wallets */
export interface PrivyWalletsResponse {
  wallets?: PrivySyncWalletSummary[];
  items?: PrivySyncWalletSummary[];
}

export type PrivySyncEnvelope = ApiEnvelope<PrivySyncResponse>;
export type AuthProfileEnvelope = ApiEnvelope<AuthUserProfile>;
