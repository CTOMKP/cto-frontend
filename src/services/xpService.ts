import axios from "axios";
import { getAuthToken } from "@/lib/authSession";
import { normalizeRewardData } from "@/lib/rewardStorage";
import type { RewardProgress } from "@/types/auth.types";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.ctomarketplace.com";

function authHeaders() {
  const token = getAuthToken();
  if (!token) {
    console.warn("⚠️ No auth token found in localStorage");
    return {
      "Content-Type": "application/json",
    };
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

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

function parseXpMeResponse(res: { data?: unknown }): XpMeResponse {
  const data = (res.data as { data?: unknown })?.data ?? res.data;
  const record =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
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
    const res = await axios.get(`${backendUrl}/api/v1/xp/me`, {
      headers: authHeaders(),
    });
    return parseXpMeResponse(res);
  },
  async getBalance(): Promise<XpMeResponse> {
    const res = await axios.get(`${backendUrl}/api/v1/xp/me`, {
      headers: authHeaders(),
    });
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
