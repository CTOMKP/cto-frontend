"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MemeCategory } from "@/components/MemeCategoryFilter";
import { listingKeys } from "@/lib/queryKeys";
import type { AllUserListings } from "@/types/api";
import type { MockLikeCoin } from "@/app/listings/features/types/listing";
import { mapApiCoinItemsToMockLikeCoins } from "@/app/listings/features/utils/listingUtils";
import {
  buildCombinedListingPage,
  fetchListingTableSources,
  fetchPublicListingCoin,
} from "@/services/listingPublicService";
import { userListingsService } from "@/services/userListingsService";
import { mapUserListingToApiCoinItem } from "@/lib/mapUserListingToApiCoinItem";
import {
  listingFavoriteKeys,
  tokenFavoriteKey,
  typedFavoriteKey,
  type FavoriteRecord,
} from "@/services/favoritesService";
import { useFavorites } from "@/hooks/useFavorites";

export const WATCHLIST_DROPDOWN_LIMIT = 10;

export type WatchlistCoin = MockLikeCoin & {
  favoriteId: string;
  placeholder?: boolean;
};

function tokenAddressFromFavorite(favorite: FavoriteRecord) {
  const raw = favorite.targetId || favorite.targetKey || "";
  if (raw.includes(":")) return raw.slice(raw.indexOf(":") + 1);
  return raw;
}

function placeholderFromFavorite(favorite: FavoriteRecord): WatchlistCoin {
  const address = tokenAddressFromFavorite(favorite);
  return {
    favoriteId: favorite.id,
    placeholder: true,
    listingId:
      favorite.targetType === "USER_LISTING" ? favorite.targetId : undefined,
    name: address ? address.slice(0, 8) : favorite.targetType,
    whale: false,
    age: null,
    address,
    chain: favorite.chain || "solana",
    category: "meme",
    communityScore: 0,
    degenAudit: 0,
    price: {
      amount: 0,
      change: { "1m": 0, "5m": 0, "1h": 0, "5h": 0, "24h": 0 },
    },
    marketCap: 0,
    liquidity: 0,
    volume: { amount: 0 },
    holders: 0,
  };
}

export function favoriteKeyForCoin(coin: MockLikeCoin) {
  return listingFavoriteKeys(coin)[0] ?? tokenFavoriteKey(coin.chain, coin.address);
}

export function filterCoinsByMemeCategory<T extends MockLikeCoin>(
  coins: T[],
  memeCategory: MemeCategory,
): T[] {
  if (memeCategory === "meme") {
    return coins.filter((coin) => {
      if (coin.category) return coin.category.toLowerCase() === "meme";
      const name = coin.name.toLowerCase();
      return (
        name.includes("meme") ||
        name.includes("dog") ||
        name.includes("cat") ||
        name.includes("pepe") ||
        name.includes("doge") ||
        name.includes("shib")
      );
    });
  }
  if (memeCategory === "emoji") {
    return coins.filter((coin) => {
      if (coin.category) return coin.category.toLowerCase() === "emoji";
      const name = coin.name.toLowerCase();
      return (
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
          coin.name,
        ) ||
        name.includes("emoji") ||
        name.includes("smile") ||
        name.includes("happy")
      );
    });
  }
  return coins;
}

function indexListingCoins(coins: MockLikeCoin[]) {
  const map = new Map<string, MockLikeCoin>();
  for (const coin of coins) {
    if (coin.listingId) {
      map.set(typedFavoriteKey("USER_LISTING", coin.listingId), coin);
    }
    if (coin.address) {
      map.set(tokenFavoriteKey(coin.chain, coin.address), coin);
      map.set(coin.address.trim().toLowerCase(), coin);
    }
  }
  return map;
}

function matchFavorite(
  favorite: FavoriteRecord,
  index: Map<string, MockLikeCoin>,
): MockLikeCoin | undefined {
  const typedKey = typedFavoriteKey(favorite.targetType, favorite.targetKey);
  const byTyped = index.get(typedKey);
  if (byTyped) return byTyped;

  if (favorite.targetType === "USER_LISTING") {
    return index.get(typedFavoriteKey("USER_LISTING", favorite.targetId));
  }
  if (favorite.targetType === "TOKEN") {
    return (
      index.get(tokenFavoriteKey(favorite.chain, favorite.targetId)) ||
      index.get(tokenAddressFromFavorite(favorite).trim().toLowerCase())
    );
  }
  return undefined;
}

async function hydrateFavorite(
  favorite: FavoriteRecord,
  signal?: AbortSignal,
): Promise<WatchlistCoin> {
  try {
    if (favorite.targetType === "USER_LISTING") {
      const listing = await userListingsService.getPublicListing(
        favorite.targetId,
        signal,
      );
      if (listing && typeof listing === "object") {
        const coin = mapApiCoinItemsToMockLikeCoins([
          mapUserListingToApiCoinItem(listing as AllUserListings),
        ])[0];
        if (coin) return { ...coin, favoriteId: favorite.id };
      }
    } else if (favorite.targetType === "TOKEN") {
      const item = await fetchPublicListingCoin(
        tokenAddressFromFavorite(favorite),
        signal,
      );
      const coin = mapApiCoinItemsToMockLikeCoins([item])[0];
      if (coin) return { ...coin, favoriteId: favorite.id };
    }
  } catch {
    // Keep the compact row visible even if metadata is missing.
  }
  return placeholderFromFavorite(favorite);
}

export function useWatchlistCoins(options?: { limit?: number; enabled?: boolean }) {
  const favorites = useFavorites();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const limit = options?.limit;
  const enabled = options?.enabled ?? true;

  const listingFavorites = useMemo(
    () =>
      favorites.items.filter(
        (item) =>
          item.targetType === "TOKEN" || item.targetType === "USER_LISTING",
      ),
    [favorites.items],
  );

  const sourcesQuery = useQuery({
    queryKey: listingKeys.tableSources(null),
    queryFn: ({ signal }) => fetchListingTableSources(null, signal),
    enabled: enabled && !!backendUrl && listingFavorites.length > 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const listingCoins = useMemo(() => {
    const page = buildCombinedListingPage(
      sourcesQuery.data,
      1,
      Number.MAX_SAFE_INTEGER,
      null,
    );
    return mapApiCoinItemsToMockLikeCoins(page.items);
  }, [sourcesQuery.data]);

  const matched = useMemo(() => {
    const index = indexListingCoins(listingCoins);
    return listingFavorites.map((favorite) => {
      const coin = matchFavorite(favorite, index);
      if (coin) return { ...coin, favoriteId: favorite.id } satisfies WatchlistCoin;
      return placeholderFromFavorite(favorite);
    });
  }, [listingFavorites, listingCoins]);

  const hydrateTargets = useMemo(() => {
    const placeholders = matched.filter((coin) => coin.placeholder);
    const windowed = typeof limit === "number" ? placeholders.slice(0, limit) : placeholders.slice(0, 40);
    return windowed
      .map((coin) => listingFavorites.find((item) => item.id === coin.favoriteId))
      .filter((item): item is FavoriteRecord => Boolean(item));
  }, [matched, listingFavorites, limit]);

  const hydrateQuery = useQuery({
    queryKey: [
      "watchlist-hydrate",
      hydrateTargets.map((item) => item.id).join(","),
    ],
    queryFn: async ({ signal }) => {
      const rows = await Promise.all(
        hydrateTargets.map((favorite) => hydrateFavorite(favorite, signal)),
      );
      return Object.fromEntries(rows.map((row) => [row.favoriteId, row]));
    },
    enabled: enabled && hydrateTargets.length > 0,
    staleTime: 60_000,
  });

  const coins = useMemo(() => {
    const extra = hydrateQuery.data;
    if (!extra) return matched;
    return matched.map((coin) => extra[coin.favoriteId] ?? coin);
  }, [matched, hydrateQuery.data]);

  return {
    favorites,
    coins,
    loading:
      favorites.loading ||
      (listingFavorites.length > 0 && sourcesQuery.isPending && !sourcesQuery.data),
  };
}
