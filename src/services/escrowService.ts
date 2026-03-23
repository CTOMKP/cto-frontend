import axios from "axios";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.ctomarketplace.com";

function authHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("cto_auth_token")
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Escrow API — paths mirror typical Nest `EscrowController` layout.
 * If your backend uses different routes, adjust here only.
 */
export const escrowService = {
  async getLatestByConversation(conversationId: string) {
    const res = await axios.get(
      `${backendUrl}/api/v1/escrow/latest`,
      {
        params: { conversationId },
        headers: authHeaders(),
        validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
      },
    );
    if (res.status === 404) return null;
    return res.data?.data ?? res.data;
  },

  async createOffer(body: {
    conversationId: string;
    title: string;
    totalAmount: number;
    currency: string;
    deadline: string | null;
    noDeadline: boolean;
    milestones: unknown[];
  }) {
    const res = await axios.post(
      `${backendUrl}/api/v1/escrow/offers`,
      body,
      { headers: { ...authHeaders(), "Content-Type": "application/json" } },
    );
    return res.data?.data ?? res.data;
  },

  async fund(escrowId: string) {
    const res = await axios.post(
      `${backendUrl}/api/v1/escrow/${escrowId}/fund`,
      {},
      { headers: authHeaders() },
    );
    return res.data?.data ?? res.data;
  },

  async accept(escrowId: string) {
    const res = await axios.post(
      `${backendUrl}/api/v1/escrow/${escrowId}/accept`,
      {},
      { headers: authHeaders() },
    );
    return res.data?.data ?? res.data;
  },

  async decline(escrowId: string) {
    const res = await axios.post(
      `${backendUrl}/api/v1/escrow/${escrowId}/decline`,
      {},
      { headers: authHeaders() },
    );
    return res.data?.data ?? res.data;
  },
};

export default escrowService;
