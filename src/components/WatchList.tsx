"use client";

import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MemeCategoryFilter, { type MemeCategory } from "@/components/MemeCategoryFilter";
import { buildProjectHref } from "@/lib/utils/slugify";
import {
  WATCHLIST_DROPDOWN_LIMIT,
  filterCoinsByMemeCategory,
  useWatchlistCoins,
  type WatchlistCoin,
} from "@/hooks/useWatchlistCoins";
import WatchlistCompactTable, {
  WatchlistCompactTableSkeleton,
} from "@/app/listings/features/WatchlistCompactTable";

export default function WatchList() {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [memeCategory, setMemeCategory] = useState<MemeCategory>("all");
  const { favorites, coins, loading } = useWatchlistCoins({
    limit: WATCHLIST_DROPDOWN_LIMIT,
    enabled: open,
  });

  const visibleCoins = useMemo(
    () =>
      filterCoinsByMemeCategory(coins, memeCategory).slice(
        0,
        WATCHLIST_DROPDOWN_LIMIT,
      ),
    [coins, memeCategory],
  );

  const pendingKeys = favorites.pending;

  const handleProjectClick = (coin: WatchlistCoin) => {
    setOpen(false);
    router.push(
      buildProjectHref({
        name: coin.name,
        address: coin.address,
        chain: coin.chain,
        userListingId: coin.listingId || null,
      }),
    );
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void favorites.refresh();
      }}
    >
      <DropdownMenuTrigger className="flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20]">
        <span className="bg-[#FFFFFF0D] rounded-sm size-7 flex items-center justify-center">
          <Image loading="lazy" src="/watchlist.svg" alt="watchlist" width={15} height={15} />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="bg-[#010101] text-white p-4 w-[min(860px,calc(100vw-24px))] border-2 border-[#868686]/20 overflow-x-auto overflow-y-auto"
      >
        <div className="text-2xl font-bold mb-3">{t("common.watchlist")}</div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <MemeCategoryFilter selected={memeCategory} onChange={setMemeCategory} />
          <Link
            href="/watchlist"
            onClick={() => setOpen(false)}
            className="border-[0.2px] gap-1 min-w-[85px] px-2 text-[#A1A1AA] border-[#FFFFFF20] rounded-lg h-9 font-medium text-sm flex items-center justify-center"
          >
            {t("common.fullView")} <ChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <WatchlistCompactTableSkeleton />
        ) : visibleCoins.length === 0 ? (
          <div className="text-sm text-white/50 py-6">
            {t("common.watchlistEmpty")}
          </div>
        ) : (
          <WatchlistCompactTable
            coins={visibleCoins}
            pendingKeys={pendingKeys}
            onProjectClick={handleProjectClick}
            onWatchlistToggle={(coin) => {
              void favorites.toggleCoin(coin);
            }}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
