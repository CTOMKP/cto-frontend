import { ApiError } from "@/lib/apiError";
import { apiGet, apiPost } from "@/lib/apiClient";

function unwrapData<T = unknown>(res: unknown): T {
  return ((res as { data?: unknown })?.data ?? res) as T;
}

/**
 * Escrow API — paths mirror typical Nest `EscrowController` layout.
 * If your backend uses different routes, adjust here only.
 */
export const escrowService = {
  async getLatestByConversation(conversationId: string) {
    try {
      const res = await apiGet<unknown>(`/api/v1/escrow/latest?conversationId=${encodeURIComponent(conversationId)}`);
      return unwrapData(res);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
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
    const res = await apiPost<unknown>(`/api/v1/escrow/offers`, body);
    return unwrapData(res);
  },

  async fund(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/fund`, {});
    return unwrapData(res);
  },

  async accept(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/accept`, {});
    return unwrapData(res);
  },

  async decline(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/decline`, {});
    return unwrapData(res);
  },
};

export default escrowService;
