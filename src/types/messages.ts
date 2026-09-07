/**
 * Messaging / thread types aligned with backend conversation payloads
 * (see cto-test-frontend MarketplaceMessages).
 */

export type MessageThreadUser = {
  id: number;
  name?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  /** When API includes rank on thread participants */
  rankLevel?: number | null;
  rankLabel?: string | null;
  rankEmoji?: string | null;
  progressPercent?: number | null;
};

/** Ad summary embedded on a message thread */
export type ThreadAdSummary = {
  title?: string | null;
  description?: string | null;
  chain?: string | null;
  priceCurrency?: string | null;
  priceAmount?: number | null;
  category?: string | null;
  subCategory?: string | null;
  /** Listing owner's info (fallback for poster avatar) */
  user?: {
    id?: number;
    name?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
  } | null;
  [key: string]: unknown;
};

export type MessageInboxType = "GENERAL" | "MARKETPLACE";
export type InboxFilter = "GENERAL" | "MARKETPLACE" | "ARCHIVED";

export type UserSearchResult = {
  id: number;
  name?: string | null;
  avatarUrl?: string | null;
};

export type MessageThread = {
  id: string;
  type?: MessageInboxType;
  ad?: ThreadAdSummary | null;
  posterId: number;
  applicantId: number;
  poster?: MessageThreadUser | null;
  applicant?: MessageThreadUser | null;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  updatedAt?: string;
  unreadCount?: number;
  isArchived?: boolean;
  escrow?: EscrowSummary | null;
  [key: string]: unknown;
};

export type MessageReaction = {
  emoji: string;
  userId?: number;
  [key: string]: unknown;
};

export type ChatMessage = {
  id: string;
  body?: string;
  content?: string;
  createdAt?: string;
  senderId?: number;
  userId?: number;
  reactions?: MessageReaction[];
  [key: string]: unknown;
};

export type EscrowStatus =
  | "PROPOSED"
  | "AWAITING_PAYMENT"
  | "FUNDED"
  | "IN_PROGRESS"
  | "ACTIVE"
  | "PAID"
  | "SUBMITTED"
  | "WORK_SUBMITTED"
  | "DELIVERED"
  | "UNDER_REVIEW"
  | "DISPUTED"
  | "COMPLETED"
  | "RELEASED"
  | "REFUNDED"
  | "DECLINED"
  | "CANCELLED"
  | "EXPIRED";

export type EscrowSummary = {
  id?: string;
  status?: EscrowStatus | string;
  title?: string;
  totalAmount?: number;
  currency?: string;
  deadline?: string | null;
  conversationId?: string;
  [key: string]: unknown;
};

export type EscrowCreatePayload = {
  title: string;
  totalAmount: number;
  currency: string;
  deadline: string | null;
  noDeadline: boolean;
  milestones: unknown[];
};
