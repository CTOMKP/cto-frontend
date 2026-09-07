"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MemeCategoryFilter, { type MemeCategory } from "@/components/MemeCategoryFilter";
import ListingTableHeader from "@/app/listings/features/ListingTableHeader";
import ListingTableRow from "@/app/listings/features/ListingTableRow";
import ListingTableSkeleton from "@/app/listings/features/ListingTableSkeleton";
import ListingPagination from "@/app/listings/features/ListingPagination";
import type { MockLikeCoin, SortDirection, SortField } from "@/app/listings/features/types/listing";
import { buildProjectHref } from "@/lib/utils/slugify";
import {
  filterCoinsByMemeCategory,
  useWatchlistCoins,
} from "@/hooks/useWatchlistCoins";

const TokenSwapCard = dynamic(() => import("@/components/TokenSwapCard"), {
  ssr: false,
});

const PAGE_SIZE = 15;

function sortCoins(
  items: MockLikeCoin[],
  sortField: SortField | null,
  sortDirection: SortDirection,
) {
  if (!sortField || !sortDirection) return items;
  return [...items].sort((a, b) => {
    let aValue: number | string = 0;
    let bValue: number | string = 0;
    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "marketCap":
        aValue = a.marketCap;
        bValue = b.marketCap;
        break;
      case "liquidity":
        aValue = a.liquidity;
        bValue = b.liquidity;
        break;
      case "holders":
        aValue = a.holders;
        bValue = b.holders;
        break;
      case "age":
        aValue = a.age || "";
        bValue = b.age || "";
        break;
      case "price":
        aValue = a.price.amount;
        bValue = b.price.amount;
        break;
      case "change24h":
        aValue = a.price.change["24h"];
        bValue = b.price.change["24h"];
        break;
      case "change1m":
        aValue = a.price.change["1m"];
        bValue = b.price.change["1m"];
        break;
      case "change5m":
        aValue = a.price.change["5m"];
        bValue = b.price.change["5m"];
        break;
      case "change1h":
        aValue = a.price.change["1h"];
        bValue = b.price.change["1h"];
        break;
      case "communityScore":
        aValue = a.communityScore;
        bValue = b.communityScore;
        break;
      case "degenAudit":
        aValue = a.degenAudit;
        bValue = b.degenAudit;
        break;
      default:
        return 0;
    }
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}

export default function WatchlistPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { favorites, coins, loading } = useWatchlistCoins();
  const [memeCategory, setMemeCategory] = useState<MemeCategory>("all");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapCoin, setSwapCoin] = useState<MockLikeCoin | null>(null);

  const filtered = useMemo(() => {
    const next = filterCoinsByMemeCategory(coins, memeCategory);
    return sortCoins(next, sortField, sortDirection);
  }, [coins, memeCategory, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = "asc";
    if (sortField === field) {
      if (sortDirection === "asc") newDirection = "desc";
      else if (sortDirection === "desc") newDirection = null;
    }
    setSortField(newDirection ? field : null);
    setSortDirection(newDirection);
  };

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

  return (
    <div>
      <div className="h-px w-full bg-[#FF007510] mt-7 mb-4.5" />
      <div className="w-[87%] mx-auto">
        <Card className="w-full p-3 border-none text-white">
          <CardHeader className="flex flex-wrap justify-between items-center px-0 gap-3">
            <CardTitle className="text-2xl font-bold">{t("common.watchlist")}</CardTitle>
            <MemeCategoryFilter
              selected={memeCategory}
              onChange={(category) => {
                setMemeCategory(category);
                setPage(1);
              }}
            />
          </CardHeader>
          <CardContent className="px-0 min-h-[420px] overflow-auto hover-scrollbar">
            {loading ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] border-separate border-spacing-y-2">
                  <ListingTableHeader
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <tbody>
                    <ListingTableSkeleton />
                  </tbody>
                </table>
              </div>
            ) : pageItems.length === 0 ? (
              <div className="text-sm text-white/50 py-16 text-center">
                {t("common.watchlistEmpty")}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px] border-separate border-spacing-y-2">
                    <ListingTableHeader
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <tbody>
                      {pageItems.map((coin, index) => (
                        <ListingTableRow
                          key={coin.listingId ?? `${coin.address}-${index}`}
                          coin={coin}
                          onProjectClick={handleProjectClick}
                          onBuyClick={(item) => {
                            setSwapCoin(item);
                            setSwapOpen(true);
                          }}
                          isWatchlisted={favorites.isCoinFavorited(coin)}
                          watchlistPending={favorites.isCoinPending(coin)}
                          onWatchlistToggle={(item) => {
                            void favorites.toggleCoin(item);
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <ListingPagination
                  page={Math.min(page, totalPages)}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
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
