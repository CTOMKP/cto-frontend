import { ApiError } from "@/lib/apiError";
import { apiGet, apiPost } from "@/lib/apiClient";
import { unwrapApiData } from "@/lib/apiResponse";

/**
 * Escrow API — paths mirror typical Nest `EscrowController` layout.
 * If your backend uses different routes, adjust here only.
 */
export const escrowService = {
  async getLatestByConversation(conversationId: string) {
    try {
      const res = await apiGet<unknown>(`/api/v1/escrow/latest?conversationId=${encodeURIComponent(conversationId)}`);
      return unwrapApiData(res);
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
    return unwrapApiData(res);
  },

  async fund(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/fund`, {});
    return unwrapApiData(res);
  },

  async accept(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/accept`, {});
    return unwrapApiData(res);
  },

  async decline(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/decline`, {});
    return unwrapApiData(res);
  },
};

export default escrowService;
