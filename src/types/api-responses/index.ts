/**
 * API response types — derived from live captures (Part 2 auth + shell).
 * Source: live API captures, 2026-05-24.
 */

export type { ApiEnvelope, ApiErrorBody } from "./common";

export type {
  PrivySyncRequest,
  AuthUserWallet,
  PrivySyncWalletSummary,
  AuthUserProfile,
  PrivySyncResponse,
  AuthProfileResponse,
  PrivyWalletsResponse,
  PrivySyncEnvelope,
  AuthProfileEnvelope,
} from "./auth";

export type {
  NotificationXpData,
  NotificationApiItem,
  NotificationsListResponse,
  XpHistoryEntryApi,
  XpMeApiResponse,
  SolanaWalletBalanceResponse,
  MovementWalletBalanceRow,
  MovementWalletBalanceResponse,
  MessageThreadAdApi,
  MessageThreadApiItem,
  MessageThreadsListResponse,
} from "./shell";
