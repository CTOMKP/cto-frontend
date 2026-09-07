import { ApiError } from "@/lib/apiError";
import { apiGet, apiPost } from "@/lib/apiClient";
import { unwrapApiJsonBody } from "@/lib/apiResponse";

/**
 * Escrow API — paths match cto-test-frontend `escrowService`
 * and the Nest escrow controller:
 *   POST /escrow/offer
 *   GET  /escrow/:id
 *   GET  /escrow/conversation/:id
 *   POST /escrow/:id/{accept,decline,fund,submit,release,refund,review,dispute-response}
 */
export const escrowService = {
  async createOffer(body: {
    conversationId: string;
    title: string;
    totalAmount: number;
    currency: string;
    deadline: string | null;
    noDeadline: boolean;
    milestones: unknown[];
  }) {
    const res = await apiPost<unknown>(`/api/v1/escrow/offer`, body);
    return unwrapApiJsonBody(res);
  },

  async getEscrow(id: string) {
    const res = await apiGet<unknown>(`/api/v1/escrow/${id}`);
    return unwrapApiJsonBody(res);
  },

  async getLatestByConversation(conversationId: string) {
    try {
      const res = await apiGet<unknown>(
        `/api/v1/escrow/conversation/${encodeURIComponent(conversationId)}`,
      );
      return unwrapApiJsonBody(res);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async accept(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/accept`, {});
    return unwrapApiJsonBody(res);
  },

  async decline(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/decline`, {});
    return unwrapApiJsonBody(res);
  },

  async fund(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/fund`, {});
    return unwrapApiJsonBody(res);
  },

  async submitWork(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/submit`, {});
    return unwrapApiJsonBody(res);
  },

  async release(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/release`, {});
    return unwrapApiJsonBody(res);
  },

  async refund(escrowId: string) {
    const res = await apiPost<unknown>(`/api/v1/escrow/${escrowId}/refund`, {});
    return unwrapApiJsonBody(res);
  },

  async posterReview(
    escrowId: string,
    payload: { satisfied: boolean; reason?: string },
  ) {
    const res = await apiPost<unknown>(
      `/api/v1/escrow/${escrowId}/review`,
      payload,
    );
    return unwrapApiJsonBody(res);
  },

  async submitDisputeResponse(escrowId: string, explanation: string) {
    const res = await apiPost<unknown>(
      `/api/v1/escrow/${escrowId}/dispute-response`,
      { explanation },
    );
    return unwrapApiJsonBody(res);
  },
};

export default escrowService;
