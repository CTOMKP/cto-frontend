import { apiGet } from "@/lib/apiClient";
import { getUserId } from "@/lib/authSession";
import { getWalletsFromStorage, saveWalletsToStorage } from "@/utils/localStorage";
import type { BackendWallet } from "@/types/privy";

function normalizeWalletsPayload(payload: unknown): BackendWallet[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;

  if (Array.isArray(root.wallets)) return root.wallets as BackendWallet[];

  const data = root.data;
  if (data && typeof data === "object") {
    const inner = data as Record<string, unknown>;
    if (Array.isArray(inner.wallets)) return inner.wallets as BackendWallet[];
  }

  return [];
}

export const walletsService = {
  async listPrivyWallets(opts?: {
    userId?: string | null;
    preferStorage?: boolean;
    signal?: AbortSignal;
  }): Promise<BackendWallet[]> {
    const userId = opts?.userId ?? getUserId();
    const preferStorage = opts?.preferStorage !== false;

    if (preferStorage && userId) {
      try {
        const cached = getWalletsFromStorage(userId);
        if (cached && cached.length > 0) return cached;
      } catch {
        // best effort fallback to backend
      }
    }

    const payload = await apiGet<unknown>("/api/v1/auth/privy/wallets", {
      signal: opts?.signal,
    });
    const wallets = normalizeWalletsPayload(payload);

    if (wallets.length > 0 && userId) {
      try {
        saveWalletsToStorage(wallets, userId);
      } catch {
        // cache write should never block consumers
      }
    }

    return wallets;
  },
};

export default walletsService;
