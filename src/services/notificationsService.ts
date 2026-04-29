import { getAuthToken } from '@/lib/authSession';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';

const notificationsService = {
  async list(unreadOnly?: boolean) {
    const token = getAuthToken();
    const query = unreadOnly ? '?unread=1' : '';
    const res = await fetch(`${backendUrl}/api/v1/notifications${query}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to load notifications');
    const payload = await res.json();
    const items = payload?.data?.items ?? payload?.items ?? payload?.data ?? payload ?? [];
    return { items };
  },

  async markRead(id: string) {
    const token = getAuthToken();
    const res = await fetch(`${backendUrl}/api/v1/notifications/${id}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to mark notification read');
    return res.json();
  },
};

export default notificationsService;
