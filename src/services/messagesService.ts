import { apiGet, apiPost } from '@/lib/apiClient';
import { unwrapApiData } from '@/lib/apiResponse';
import { uploadGenericViaPresign } from '@/lib/presignedUpload';
import { assertMessageContentAllowed } from '@/lib/messageContentPolicy';

export const messagesService = {
  async apply(adId: string, coverLetter: string) {
    const res = await apiPost<unknown>(
      `/api/v1/messages/apply/${adId}`,
      { coverLetter },
    );
    return unwrapApiData(res);
  },

  async listThreads() {
    const res = await apiGet<unknown>(`/api/v1/messages/threads`);
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
