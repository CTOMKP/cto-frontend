import { apiDelete, apiGet, apiPost } from "@/lib/apiClient";
import { unwrapApiJsonBody } from "@/lib/apiResponse";

export type FavoriteTargetType = "TOKEN" | "USER_LISTING" | "MARKETPLACE_AD";

export type FavoriteRecord = {
  id: string;
  targetType: FavoriteTargetType;
  targetId: string;
  targetKey: string;
  chain?: string | null;
};

const EVM_LIKE_CHAINS = new Set([
  "ETHEREUM",
  "BASE",
  "BSC",
  "MOVEMENT",
  "APTOS",
]);

/** Same identity as cto-test-frontend: `CHAIN:address` (EVM addresses lowercased). */
export function tokenFavoriteKey(
  chain: string | null | undefined,
  address: string,
) {
  const normalizedChain = String(chain || "SOLANA").trim().toUpperCase();
  const trimmed = address.trim();
  const normalizedAddress = EVM_LIKE_CHAINS.has(normalizedChain)
    ? trimmed.toLowerCase()
    : trimmed;
  return `${normalizedChain}:${normalizedAddress}`;
}

export function typedFavoriteKey(
  targetType: FavoriteTargetType,
  targetKey: string,
) {
  return targetType === "TOKEN" ? targetKey : `${targetType}:${targetKey}`;
}

export function listingFavoriteKeys(coin: {
  listingId?: string | null;
  address?: string | null;
  chain?: string | null;
}) {
  const keys: string[] = [];
  if (coin.address) keys.push(tokenFavoriteKey(coin.chain, coin.address));
  if (coin.listingId) keys.push(typedFavoriteKey("USER_LISTING", coin.listingId));
  return keys;
}

/** All lookup aliases for a stored favorite (raw API key + normalized token key). */
export function favoriteRecordKeys(favorite: FavoriteRecord) {
  const keys = new Set<string>();
  keys.add(typedFavoriteKey(favorite.targetType, favorite.targetKey));
  if (favorite.targetId) {
    keys.add(typedFavoriteKey(favorite.targetType, favorite.targetId));
  }
  if (favorite.targetType === "TOKEN") {
    keys.add(favorite.targetKey);
    const colon = favorite.targetKey.indexOf(":");
    const keyChain = colon >= 0 ? favorite.targetKey.slice(0, colon) : favorite.chain;
    const keyAddress =
      colon >= 0 ? favorite.targetKey.slice(colon + 1) : favorite.targetKey;
    keys.add(tokenFavoriteKey(favorite.chain || keyChain, keyAddress));
    if (favorite.targetId) {
      keys.add(tokenFavoriteKey(favorite.chain || keyChain, favorite.targetId));
    }
  }
  return [...keys];
}

export const favoritesService = {
  async list(targetType?: FavoriteTargetType) {
    const qs = targetType ? `?type=${encodeURIComponent(targetType)}` : "";
    const res = await apiGet<unknown>(`/api/v1/favorites${qs}`);
    return unwrapApiJsonBody<{
      success?: boolean;
      items: FavoriteRecord[];
      total?: number;
    }>(res);
  },

  async add(payload: {
    targetType: FavoriteTargetType;
    targetId: string;
    chain?: string;
  }) {
    const res = await apiPost<unknown>(`/api/v1/favorites`, payload);
    return unwrapApiJsonBody<{ success?: boolean; favorite: FavoriteRecord }>(
      res,
    );
  },

  async remove(favoriteId: string) {
    const res = await apiDelete<unknown>(
      `/api/v1/favorites/${encodeURIComponent(favoriteId)}`,
    );
    return unwrapApiJsonBody<{ success?: boolean; deletedId: string }>(res);
  },
};

export default favoritesService;
