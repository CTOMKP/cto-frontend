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

export type MessageThread = {
  id: string;
  ad?: ThreadAdSummary | null;
  posterId: number;
  applicantId: number;
  poster?: MessageThreadUser | null;
  applicant?: MessageThreadUser | null;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  updatedAt?: string;
  unreadCount?: number;
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

export type EscrowSummary = {
  id?: string;
  status?: string;
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
