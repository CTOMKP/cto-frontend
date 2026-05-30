import { apiGet, apiPost } from "@/lib/apiClient";

export type CreatorTier = "STARTER" | "BUILDER" | "PARTNER";
export type CreatorEarningType = "LISTING_FEE" | "MARKETPLACE_AD" | "ESCROW_FEE" | "REVENUE_SHARE";
export type CreatorPayoutStatus = "REQUESTED" | "APPROVED" | "PROCESSING" | "PAID" | "REJECTED" | "ON_HOLD";
export type CreatorReferralStatus = "SIGNED_UP" | "ACTIVE" | "FRAUD_HOLD";
export type CreatorEarningStatus = "PENDING" | "AVAILABLE" | "HELD" | "PAID" | "REVERSED";

export type CreatorDashboardAccount = {
  id: string;
  userId: number;
  referralCode: string;
  referralLink: string;
  tier: CreatorTier;
  activeReferralsCount: number;
  totalReferralsCount: number;
  totalEarned: number;
  pendingBalance: number;
  reservedBalance: number;
  paidBalance: number;
  heldBalance: number;
  payoutWalletAddress?: string | null;
  fraudStatus: string;
  fraudReason?: string | null;
  lastReviewedAt?: string | null;
};

export type CreatorDashboardStats = {
  totalReferrals: number;
  activeReferrals: number;
  tier: CreatorTier;
  referralsNeededForNextTier: number;
  thisMonthEarnings: number;
  pendingPayoutBalance: number;
  reservedPayoutBalance: number;
  allTimeTotalEarned: number;
  creatorCutPercent: number;
  nextTierTarget: number | null;
};

export type CreatorDashboardReferral = {
  id: string;
  referredUserId: number;
  referredUser: {
    id: number;
    email?: string | null;
    name?: string | null;
  };
  status: CreatorReferralStatus;
  isActive: boolean;
  isFraudFlagged: boolean;
  signedUpAt: string;
  activatedAt?: string | null;
  totalEarned: number;
  firstQualifyingActionType?: string | null;
};

export type CreatorDashboardEarning = {
  id: string;
  sourceType: CreatorEarningType;
  sourceId: string;
  amountGross: number;
  platformFeeAmount: number;
  creatorCutPercent: number;
  amountEarned: number;
  status: CreatorEarningStatus;
  createdAt: string;
  paymentId?: string | null;
  escrowId?: string | null;
};

export type CreatorDashboardPayout = {
  id: string;
  status: CreatorPayoutStatus;
  amountRequested: number;
  amountApproved?: number | null;
  walletAddress: string;
  txHash?: string | null;
  requestNote?: string | null;
  createdAt: string;
  processedAt?: string | null;
  reviewedAt?: string | null;
  failureReason?: string | null;
};

export type CreatorDashboardResponse = {
  success: true;
  account: CreatorDashboardAccount;
  stats: CreatorDashboardStats;
  earningsBreakdown: Array<{ type: CreatorEarningType; amount: number }>;
  dailyEarnings: Array<{ date: string; amount: number }>;
  referrals: CreatorDashboardReferral[];
  earnings: CreatorDashboardEarning[];
  payouts: CreatorDashboardPayout[];
};

export type CreatorPayoutRequest = {
  walletAddress?: string;
  amount?: number;
  note?: string;
};

export const creatorProgramService = {
  async getDashboard(limit: number = 20) {
    return apiGet<CreatorDashboardResponse>(`/api/v1/creator/me?limit=${limit}`);
  },

  async getReferrals(limit: number = 50) {
    return apiGet<{ success: true; referrals: CreatorDashboardReferral[] }>(
      `/api/v1/creator/referrals?limit=${limit}`,
    );
  },

  async getEarnings(limit: number = 50) {
    return apiGet<{ success: true; earnings: CreatorDashboardEarning[] }>(
      `/api/v1/creator/earnings?limit=${limit}`,
    );
  },

  async getPayouts(limit: number = 20) {
    return apiGet<{ success: true; payouts: CreatorDashboardPayout[] }>(
      `/api/v1/creator/payouts?limit=${limit}`,
    );
  },

  async requestPayout(payload: CreatorPayoutRequest) {
    return apiPost<{ success: true; payout: CreatorDashboardPayout }>(
      `/api/v1/creator/payouts/request`,
      payload,
    );
  },
};

export default creatorProgramService;
