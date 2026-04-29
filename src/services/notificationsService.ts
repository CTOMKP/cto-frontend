import { getAuthToken } from "@/lib/authSession";
import { apiGet, apiPost } from "@/lib/apiClient";

function normalizeNotificationItems(payload: unknown): unknown[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return [];
  const o = payload as Record<string, unknown>;
  if (Array.isArray(o.items)) return o.items;
  const data = o.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const inner = data as Record<string, unknown>;
    if (Array.isArray(inner.items)) return inner.items;
  }
  return [];
}

const notificationsService = {
  /**
   * @param unreadOnly - when true, requests `?unread=1`
   * @param signal - passed through for TanStack Query cancellation
   */
  async list(unreadOnly?: boolean, signal?: AbortSignal) {
    if (!getAuthToken()) {
      return { items: [] as unknown[] };
    }
    const query = unreadOnly ? "?unread=1" : "";
    const json = await apiGet<unknown>(`/api/v1/notifications${query}`, { signal });
    const items = normalizeNotificationItems(json);
    return { items };
  },

  async markRead(id: string) {
    return apiPost<unknown>(`/api/v1/notifications/${id}/read`, undefined, {
      clearSessionOn401: true,
    });
  },
};

export default notificationsService;
