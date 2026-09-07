import { apiGet, apiPatch, apiPost } from '@/lib/apiClient';
import { unwrapApiData } from '@/lib/apiResponse';
import { uploadGenericViaPresign } from '@/lib/presignedUpload';
import { assertMessageContentAllowed } from '@/lib/messageContentPolicy';

export type MessageInboxType = 'GENERAL' | 'MARKETPLACE';

export const messagesService = {
  async apply(adId: string, coverLetter: string) {
    const res = await apiPost<unknown>(
      `/api/v1/messages/apply/${adId}`,
      { coverLetter },
    );
    return unwrapApiData(res);
  },

  async listThreads(options?: {
    type?: MessageInboxType;
    archived?: boolean;
  }) {
    const search = new URLSearchParams();
    if (options?.type) search.set('type', options.type);
    if (typeof options?.archived === 'boolean') {
      search.set('archived', String(options.archived));
    }
    const qs = search.toString();
    const res = await apiGet<unknown>(
      `/api/v1/messages/threads${qs ? `?${qs}` : ''}`,
    );
    return unwrapApiData(res);
  },

  async searchUsers(query: string) {
    const res = await apiGet<unknown>(
      `/api/v1/messages/users/search?q=${encodeURIComponent(query)}`,
    );
    return unwrapApiData(res);
  },

  async createGeneral(recipientUserId: number, initialMessage?: string) {
    const res = await apiPost<unknown>(`/api/v1/messages/threads/general`, {
      recipientUserId,
      initialMessage,
    });
    return unwrapApiData(res);
  },

  async getThread(id: string) {
    const res = await apiGet<unknown>(`/api/v1/messages/threads/${id}`);
    return unwrapApiData(res);
  },

  async sendMessage(threadId: string, body: string) {
    assertMessageContentAllowed(body);
    const res = await apiPost<unknown>(
      `/api/v1/messages/threads/${threadId}/messages`,
      { body },
    );
    return unwrapApiData(res);
  },

  async markRead(threadId: string) {
    const res = await apiPost<unknown>(
      `/api/v1/messages/threads/${threadId}/read`,
      {},
    );
    return unwrapApiData(res);
  },

  async archiveThread(threadId: string) {
    const res = await apiPatch<unknown>(
      `/api/v1/messages/threads/${threadId}/archive`,
      {},
    );
    return unwrapApiData(res);
  },

  async restoreThread(threadId: string) {
    const res = await apiPatch<unknown>(
      `/api/v1/messages/threads/${threadId}/restore`,
      {},
    );
    return unwrapApiData(res);
  },

  async toggleReaction(messageId: string, emoji: string) {
    const res = await apiPost<unknown>(
      `/api/v1/messages/reactions/${messageId}`,
      { emoji },
    );
    return unwrapApiData(res);
  },

  /** Presign through apiClient + S3 PUT; returns stable view URL for the message body. */
  uploadAttachmentViaPresign(
    file: File,
    userId: string | number,
    signal?: AbortSignal,
  ) {
    return uploadGenericViaPresign(
      file,
      { userId: String(userId ?? "") },
      signal,
    );
  },
};

export default messagesService;
