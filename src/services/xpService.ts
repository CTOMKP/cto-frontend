import { apiGet } from "@/lib/apiClient";
import { toRecord, unwrapApiData } from "@/lib/apiResponse";
import { normalizeRewardData } from "@/lib/rewardStorage";
import type { RewardProgress } from "@/types/auth.types";

export type XpHistoryEntryType = "EARN" | "SPEND" | string;

export type XpHistoryEntry = {
  id: string;
  userId: number;
  type: XpHistoryEntryType;
  reason: string;
  amount: number;
  balanceAfter: number;
  metadata: unknown | null;
  createdAt: string;
};

export type XpMeResponse = {
  success: boolean;
  balance: number;
  history: XpHistoryEntry[];
  /** Rank / streak fields merged from API payload when present */
  rewardPatch: Partial<RewardProgress>;
};

function parseXpMeResponse(res: unknown): XpMeResponse {
  const record = toRecord(unwrapApiData(res));
  const balance = Number(record.balance ?? 0);
  const rewardPatch = normalizeRewardData({
    ...record,
    balance,
    xpBalance:
      typeof record.xpBalance === "number" ? record.xpBalance : balance,
  });

  return {
    success: !!record.success,
    balance,
    history: Array.isArray(record.history)
      ? (record.history as XpHistoryEntry[])
      : [],
    rewardPatch,
  };
}

export const xpService = {
  async getMe(): Promise<XpMeResponse> {
    const res = await apiGet<unknown>(`/api/v1/xp/me`);
    return parseXpMeResponse(res);
  },
  async getBalance(): Promise<XpMeResponse> {
    const res = await apiGet<unknown>(`/api/v1/xp/me`);
    return parseXpMeResponse(res);
  },
  // Backward-compatible alias for existing usage in this repo.
  async me(limit?: number): Promise<XpMeResponse> {
    void limit;
    return this.getMe();
  },
} satisfies {
  getMe: () => Promise<XpMeResponse>;
  getBalance: () => Promise<XpMeResponse>;
  me: (limit?: number) => Promise<XpMeResponse>;
};

export default xpService;
