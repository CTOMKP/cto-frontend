"use client";

import { useEffect, useMemo } from "react";
import {
  bindFavoritesRefresh,
  useFavoritesStore,
} from "@/lib/favoritesStore";
import { listingFavoriteKeys } from "@/services/favoritesService";

export function useFavorites() {
  useEffect(() => {
    bindFavoritesRefresh();
  }, []);

  const items = useFavoritesStore((s) => s.items);
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const pending = useFavoritesStore((s) => s.pending);
  const loading = useFavoritesStore((s) => s.loading);
  const refresh = useFavoritesStore((s) => s.refresh);
  const toggle = useFavoritesStore((s) => s.toggle);
  const toggleToken = useFavoritesStore((s) => s.toggleToken);
  const toggleCoin = useFavoritesStore((s) => s.toggleCoin);

  return useMemo(
    () => ({
      items,
      favoriteIds: new Map(Object.entries(favoriteIds)),
      pending: new Set(Object.keys(pending)),
      loading,
      refresh,
      toggle,
      toggleToken,
      toggleCoin,
      isFavorited: (key: string) => Boolean(favoriteIds[key]),
      isPending: (key: string) => Boolean(pending[key]),
      isCoinFavorited: (coin: {
        listingId?: string | null;
        address?: string | null;
        chain?: string | null;
      }) => listingFavoriteKeys(coin).some((key) => Boolean(favoriteIds[key])),
      isCoinPending: (coin: {
        listingId?: string | null;
        address?: string | null;
        chain?: string | null;
      }) => listingFavoriteKeys(coin).some((key) => Boolean(pending[key])),
    }),
    [items, favoriteIds, pending, loading, refresh, toggle, toggleToken, toggleCoin],
  );
}
