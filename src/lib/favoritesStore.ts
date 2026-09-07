"use client";

import { create } from "zustand";
import { toast } from "react-toastify";
import { getAuthToken } from "@/lib/authSession";
import { useSessionStore } from "@/lib/sessionStore";
import favoritesService, {
  favoriteRecordKeys,
  listingFavoriteKeys,
  tokenFavoriteKey,
  typedFavoriteKey,
  type FavoriteRecord,
  type FavoriteTargetType,
} from "@/services/favoritesService";

type TogglePayload = {
  key: string;
  targetType: FavoriteTargetType;
  targetId: string;
  chain?: string;
};

type CoinRef = {
  listingId?: string;
  address: string;
  chain?: string;
};

type FavoritesState = {
  items: FavoriteRecord[];
  favoriteIds: Record<string, string>;
  pending: Record<string, true>;
  loading: boolean;
  refresh: () => Promise<void>;
  toggle: (payload: TogglePayload) => Promise<void>;
  toggleToken: (address: string, chain?: string | null) => Promise<void>;
  toggleCoin: (coin: CoinRef) => Promise<void>;
};

function indexFavoriteRecords(items: FavoriteRecord[]) {
  const favoriteIds: Record<string, string> = {};
  for (const favorite of items) {
    for (const key of favoriteRecordKeys(favorite)) {
      favoriteIds[key] = favorite.id;
    }
  }
  return favoriteIds;
}

function dropFavoriteIds(
  favoriteIds: Record<string, string>,
  ids: Set<string>,
) {
  const next = { ...favoriteIds };
  for (const [key, id] of Object.entries(next)) {
    if (ids.has(id)) delete next[key];
  }
  return next;
}

function mergeFavoriteIndex(
  favoriteIds: Record<string, string>,
  favorite: FavoriteRecord,
) {
  const next = { ...favoriteIds };
  for (const key of favoriteRecordKeys(favorite)) {
    next[key] = favorite.id;
  }
  return next;
}

function markPending(pending: Record<string, true>, keys: string[]) {
  const next = { ...pending };
  for (const key of keys) next[key] = true;
  return next;
}

function clearPending(pending: Record<string, true>, keys: string[]) {
  const next = { ...pending };
  for (const key of keys) delete next[key];
  return next;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  favoriteIds: {},
  pending: {},
  loading: false,

  refresh: async () => {
    if (!getAuthToken()) {
      set({ items: [], favoriteIds: {}, loading: false });
      return;
    }
    const hadItems = get().items.length > 0;
    if (!hadItems) set({ loading: true });
    try {
      const response = await favoritesService.list();
      const nextItems = Array.isArray(response.items) ? response.items : [];
      set({
        items: nextItems,
        favoriteIds: indexFavoriteRecords(nextItems),
        loading: false,
      });
    } catch {
      if (!hadItems) set({ items: [], favoriteIds: {}, loading: false });
      else set({ loading: false });
    }
  },

  toggle: async (payload) => {
    if (!getAuthToken()) {
      toast.error("Please sign in to use your watchlist");
      return;
    }
    if (get().pending[payload.key]) return;

    const existingId = get().favoriteIds[payload.key];
    const snapshot = {
      items: get().items,
      favoriteIds: get().favoriteIds,
    };

    set((state) => ({
      pending: markPending(state.pending, [payload.key]),
    }));

    try {
      if (existingId) {
        set((state) => ({
          items: state.items.filter((item) => item.id !== existingId),
          favoriteIds: dropFavoriteIds(state.favoriteIds, new Set([existingId])),
        }));
        await favoritesService.remove(existingId);
        toast.success("Removed from watchlist");
      } else {
        const optimistic: FavoriteRecord = {
          id: `temp-${payload.key}`,
          targetType: payload.targetType,
          targetId: payload.targetId,
          targetKey:
            payload.targetType === "TOKEN"
              ? tokenFavoriteKey(payload.chain, payload.targetId)
              : payload.targetId,
          chain: payload.chain ?? null,
        };
        set((state) => ({
          items: [
            optimistic,
            ...state.items.filter((item) => item.id !== optimistic.id),
          ],
          favoriteIds: mergeFavoriteIndex(state.favoriteIds, optimistic),
        }));
        const response = await favoritesService.add({
          targetType: payload.targetType,
          targetId: payload.targetId,
          chain: payload.chain,
        });
        const favorite = response.favorite;
        set((state) => ({
          items: [
            favorite,
            ...state.items.filter(
              (item) => item.id !== optimistic.id && item.id !== favorite.id,
            ),
          ],
          favoriteIds: mergeFavoriteIndex(
            dropFavoriteIds(state.favoriteIds, new Set([optimistic.id])),
            favorite,
          ),
        }));
        toast.success("Added to watchlist");
      }
    } catch {
      set({ items: snapshot.items, favoriteIds: snapshot.favoriteIds });
      toast.error("Unable to update your watchlist");
    } finally {
      set((state) => ({
        pending: clearPending(state.pending, [payload.key]),
      }));
    }
  },

  toggleToken: (address, chain) => {
    const key = tokenFavoriteKey(chain, address);
    return get().toggle({
      key,
      targetType: "TOKEN",
      targetId: address,
      chain: chain || "SOLANA",
    });
  },

  toggleCoin: async (coin) => {
    const keys = listingFavoriteKeys(coin);
    if (keys.some((key) => get().pending[key])) return;

    const existingIds = [
      ...new Set(
        keys
          .map((key) => get().favoriteIds[key])
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    if (existingIds.length > 0) {
      if (!getAuthToken()) {
        toast.error("Please sign in to use your watchlist");
        return;
      }
      const snapshot = {
        items: get().items,
        favoriteIds: get().favoriteIds,
      };
      set((state) => ({
        pending: markPending(state.pending, keys),
        items: state.items.filter((item) => !existingIds.includes(item.id)),
        favoriteIds: dropFavoriteIds(state.favoriteIds, new Set(existingIds)),
      }));
      try {
        await Promise.all(
          existingIds.map((id) => favoritesService.remove(id)),
        );
        toast.success("Removed from watchlist");
      } catch {
        set({ items: snapshot.items, favoriteIds: snapshot.favoriteIds });
        toast.error("Unable to update your watchlist");
      } finally {
        set((state) => ({
          pending: clearPending(state.pending, keys),
        }));
      }
      return;
    }

    if (coin.address) {
      return get().toggleToken(coin.address, coin.chain);
    }
    if (coin.listingId) {
      return get().toggle({
        key: typedFavoriteKey("USER_LISTING", coin.listingId),
        targetType: "USER_LISTING",
        targetId: coin.listingId,
      });
    }
  },
}));

let refreshBound = false;

export function bindFavoritesRefresh() {
  if (typeof window === "undefined" || refreshBound) return;
  refreshBound = true;

  let lastToken = useSessionStore.getState().token;
  useSessionStore.subscribe((state) => {
    if (state.token === lastToken) return;
    lastToken = state.token;
    void useFavoritesStore.getState().refresh();
  });
  void useFavoritesStore.getState().refresh();
}
