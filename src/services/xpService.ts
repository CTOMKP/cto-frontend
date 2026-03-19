import axios from "axios";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.ctomarketplace.com";

function authHeaders() {
  const token = localStorage.getItem("cto_auth_token");
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
};

export const xpService = {
  /**
   * GET /api/v1/xp/me?limit=100
   * Returns XP balance + recent history.
   */
  async me(limit: number = 100): Promise<XpMeResponse> {
    const res = await axios.get(`${backendUrl}/api/v1/xp/me`, {
      params: { limit },
      headers: authHeaders(),
    });
    // Backend wraps: { data: { success, balance, history }, statusCode, timestamp }
    const data = res.data?.data ?? res.data;
    return {
      success: !!data?.success,
      balance: Number(data?.balance ?? 0),
      history: Array.isArray(data?.history) ? (data.history as XpHistoryEntry[]) : [],
    };
  },
};

export default xpService;
