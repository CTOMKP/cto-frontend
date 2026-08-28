"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { listingKeys, type ListingTableFilters } from "@/lib/queryKeys";
import {
  buildCombinedListingPage,
  fetchListingTable,
  fetchListingTableSources,
  LISTING_TABLE_PAGE_SIZE,
} from "@/services/listingPublicService";
import { Category } from "../../../components/ListingsCategoryFilter";
import { MemeCategory } from "../../../components/MemeCategoryFilter";
import { Network } from "../../../components/NetworkFilter";
import type { ApiCoinItem } from "@/types/api";
import { SortField, SortDirection, MockLikeCoin } from "./types/listing";
import { mapApiCoinItemsToMockLikeCoins } from "./utils/listingUtils";
import ListingTableSkeleton from "./ListingTableSkeleton";
import ListingTableHeader from "./ListingTableHeader";
import ListingTableRow from "./ListingTableRow";
import ListingFilters from "./ListingFilters";
import ListingPagination from "./ListingPagination";
import { buildProjectHref } from "@/lib/utils/slugify";
import dynamic from "next/dynamic";

const TokenSwapCard = dynamic(() => import("@/components/TokenSwapCard"), {
  ssr: false,
});


export default function TopListings() {
  const { t } = useTranslation();
  const router = useRouter();
  const [category, setCategory] = useState<Category>("new");
  const [memeCategory, setMemeCategory] = useState<MemeCategory>("all");
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [page, setPage] = useState<number>(1);
  const limit = LISTING_TABLE_PAGE_SIZE;
  const [liveItems, setLiveItems] = useState<MockLikeCoin[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapCoin, setSwapCoin] = useState<MockLikeCoin | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const tableFilters = useMemo<ListingTableFilters>(
    () => ({
      page,
      limit,
      chain: selectedNetwork ? selectedNetwork.toUpperCase() : null,
    }),
    [page, limit, selectedNetwork],
  );

  const sourcesQuery = useQuery({
    queryKey: listingKeys.tableSources(tableFilters.chain),
    queryFn: ({ signal }) => fetchListingTableSources(tableFilters.chain, signal),
    enabled: !!backendUrl,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const combinedPage = useMemo(
    () =>
      buildCombinedListingPage(
        sourcesQuery.data,
        page,
        limit,
        tableFilters.chain,
      ),
    [sourcesQuery.data, page, limit, tableFilters.chain],
  );

  const needsRemotePage =
    sourcesQuery.isSuccess &&
    !combinedPage.fullyLoaded &&
    combinedPage.loadedCount < Math.min(combinedPage.total, page * limit);

  const remotePageQuery = useQuery({
    queryKey: listingKeys.table(tableFilters),
    queryFn: ({ signal }) => fetchListingTable(tableFilters, signal),
    enabled: !!backendUrl && needsRemotePage,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const data = needsRemotePage ? remotePageQuery.data : combinedPage;
  const isError = sourcesQuery.isError || (needsRemotePage && remotePageQuery.isError);
  const refetch = () => {
    void sourcesQuery.refetch();
    if (needsRemotePage) void remotePageQuery.refetch();
  };

  const total = data?.total ?? 0;
  const rawApiItems: ApiCoinItem[] = data?.items ?? [];

  const totalPages = useMemo(() => (total && limit ? Math.max(1, Math.ceil(total / limit)) : 1), [total, limit]);

  // Reset page to 1 when network changes
  useEffect(() => {
    setPage(1);
  }, [selectedNetwork]);

  useEffect(() => {
    if (!data?.items) return;
    setLiveItems(mapApiCoinItemsToMockLikeCoins(data.items));
  }, [data]);

  // Sorting function
  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc';
    
    if (sortField === field) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }

    setSortField(newDirection ? field : null);
    setSortDirection(newDirection);
  };


  const listings = useMemo(() => {
    const items = liveItems;
    
    let filteredItems = items;
    
    // Apply category filtering
    if (category === 'gainers') {
      filteredItems = items.filter((coin) => coin.price.change["24h"] > 0);
    } else if (category === 'losers') {
      filteredItems = items.filter((coin) => coin.price.change["24h"] < 0);
    }
    
    // Apply meme category filtering
    if (memeCategory === 'meme') {
      filteredItems = filteredItems.filter((coin) => {
        // Use category from API if available, otherwise fall back to name matching
        if (coin.category) {
          return coin.category.toLowerCase() === 'meme';
        }
        // Fallback to name matching for backward compatibility
        const name = coin.name.toLowerCase();
        return name.includes('meme') || name.includes('dog') || name.includes('cat') || 
               name.includes('pepe') || name.includes('doge') || name.includes('shib');
      });
    } else if (memeCategory === 'emoji') {
      filteredItems = filteredItems.filter((coin) => {
        // Use category from API if available, otherwise fall back to name matching
        if (coin.category) {
          return coin.category.toLowerCase() === 'emoji';
        }
        // Fallback to name matching for backward compatibility
        const name = coin.name.toLowerCase();
        return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(coin.name) ||
               name.includes('emoji') || name.includes('smile') || name.includes('happy');
      });
    }
    // If memeCategory is 'all', show all items without additional filtering
    
    // Apply sorting if active
    if (sortField && sortDirection) {
      filteredItems = [...filteredItems].sort((a, b) => {
        let aValue: number | string, bValue: number | string;
        
        switch (sortField) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'marketCap':
            aValue = a.marketCap;
            bValue = b.marketCap;
            break;
          case 'liquidity':
            aValue = a.liquidity;
            bValue = b.liquidity;
            break;
          case 'holders':
            aValue = a.holders;
            bValue = b.holders;
            break;
          case 'age':
            // Convert age to minutes for sorting
            const aAge = a.age ? parseInt(a.age.replace(/[^\d]/g, '')) : 0;
            const bAge = b.age ? parseInt(b.age.replace(/[^\d]/g, '')) : 0;
            aValue = aAge;
            bValue = bAge;
            break;
          case 'price':
            aValue = a.price.amount;
            bValue = b.price.amount;
            break;
          case 'change24h':
            aValue = a.price.change["24h"];
            bValue = b.price.change["24h"];
            break;
          case 'change1m':
            aValue = a.price.change["1m"];
            bValue = b.price.change["1m"];
            break;
          case 'change5m':
            aValue = a.price.change["5m"];
            bValue = b.price.change["5m"];
            break;
          case 'change1h':
            aValue = a.price.change["1h"];
            bValue = b.price.change["1h"];
            break;
          case 'communityScore':
            aValue = a.communityScore;
            bValue = b.communityScore;
            break;
          case 'degenAudit':
            aValue = a.degenAudit;
            bValue = b.degenAudit;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    const result = {
      gainers: category === 'gainers' ? filteredItems : items.filter((coin) => coin.price.change["24h"] > 0).sort((a, b) => b.price.change["24h"] - a.price.change["24h"]),
      losers: category === 'losers' ? filteredItems : items.filter((coin) => coin.price.change["24h"] < 0).sort((a, b) => a.price.change["24h"] - b.price.change["24h"]),
      new: category === 'new' ? filteredItems : items,
    };
    
    return result;
  }, [liveItems, category, memeCategory, sortField, sortDirection]);

  const filteredData = listings[category];

  const showTableSkeleton =
    !!backendUrl &&
    ((!sourcesQuery.data && sourcesQuery.isPending) ||
      (needsRemotePage && !remotePageQuery.data && remotePageQuery.isPending));

  const handleProjectClick = (
    projectName: string,
    projectAddress: string,
    projectChain?: string,
    userListingId?: string,
  ) => {
    router.push(
      buildProjectHref({
        name: projectName,
        address: projectAddress,
        chain: projectChain,
        userListingId: userListingId || null,
      }),
    );
  };

  const handleFilterChange = (filteredItems: ApiCoinItem[]) => {
    setLiveItems(mapApiCoinItemsToMockLikeCoins(filteredItems));
  };

  const handleBuyClick = (coin: MockLikeCoin) => {
    setSwapCoin(coin);
    setSwapOpen(true);
  };

  return (
    <div>
      <div className="h-px w-full bg-[#FF007510] mt-7 mb-4.5"></div>
      <div className="w-[87%] mx-auto">
        {isError && (
          <div
            className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
            role="alert"
          >
            <span>Could not load listings. Check your connection and try again.</span>
            <button
              type="button"
              className="shrink-0 rounded-md border border-amber-400/50 px-2 py-1 text-xs font-medium hover:bg-amber-500/20"
              onClick={() => refetch()}
            >
              {t("common.retry")}
            </button>
          </div>
        )}
        <Card className="w-full p-3 border-none border-[#FF007510] text-white">
          <CardHeader className="flex flex-wrap justify-between items-center px-0">
            <CardTitle className="hidden">
              <Image
                src="/emoji-icons/trophy.svg"
                alt="listings"
                width={16}
                height={16}
              />
              {category === "gainers"
                ? t("listings.topGainers")
                : category === "losers"
                ? t("listings.topLosers")
                : t("listings.newListings")}
              <Image
                className="mt-0.5"
                src="/info.svg"
                alt="info"
                width={13}
                height={13}
              />
            </CardTitle>
            <ListingFilters
              category={category}
              setCategory={setCategory}
              memeCategory={memeCategory}
              setMemeCategory={setMemeCategory}
              selectedNetwork={selectedNetwork}
              setSelectedNetwork={setSelectedNetwork}
              rawApiItems={rawApiItems}
              onFilterChange={handleFilterChange}
            />
          </CardHeader>

          <CardContent className="px-0 h-[690px] overflow-auto hover-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-separate border-spacing-y-2">
                <ListingTableHeader
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <tbody>
                  {showTableSkeleton ? (
                    <ListingTableSkeleton />
                  ) : (
                    (filteredData ?? []).map((coin, index) => (
                      <ListingTableRow
                        key={coin.listingId ?? `${coin.address}-${index}`}
                        coin={coin}
                        onProjectClick={handleProjectClick}
                        onBuyClick={handleBuyClick}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <ListingPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>
      <TokenSwapCard
        open={swapOpen}
        onOpenChange={setSwapOpen}
        hideFloatingTrigger
        pairPreview={
          swapCoin
            ? {
                fromSymbol: (swapCoin.name || "TOKEN").toUpperCase(),
                fromImage: swapCoin.image || null,
                toSymbol: "USDC",
                toImage: null,
              }
            : null
        }
      />
    </div>
  );
}
