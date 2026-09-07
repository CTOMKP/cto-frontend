"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FiatText from "@/components/FiatText";
import FallbackImage from "@/components/FallbackImage";
import { compactNumber } from "@/utils/helper/compactNumber";
import { getChainImage } from "@/app/listings/features/utils/listingUtils";
import { listingFavoriteKeys } from "@/services/favoritesService";
import type { WatchlistCoin } from "@/hooks/useWatchlistCoins";

function shortenAddressForWatchlist(address: string) {
  if (!address) return "";
  if (address.length <= 8) return address;
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
}

function riskIcon(score: number) {
  if (score >= 70) return "/risk-score/good.svg";
  if (score >= 50) return "/risk-score/average.svg";
  return "/risk-score/bad.svg";
}

export function WatchlistCompactTableSkeleton() {
  return (
    <Table className="w-full min-w-[640px]">
      <TableHeader className="!text-[#FFFFFF]/50">
        <TableRow className="border-none">
          <TableHead className="w-8" />
          <TableHead />
          <TableHead />
          <TableHead />
          <TableHead />
          <TableHead />
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 4 }).map((_, index) => (
          <TableRow key={index} className="border-none">
            <TableCell className="w-8">
              <div className="size-4 rounded-sm bg-white/10 animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-white/10 animate-pulse" />
                <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
              </div>
            </TableCell>
            <TableCell>
              <div className="mx-auto h-3 w-12 rounded bg-white/10 animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="mx-auto h-3 w-12 rounded bg-white/10 animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="mx-auto h-3 w-10 rounded bg-white/10 animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="mx-auto h-3 w-8 rounded bg-white/10 animate-pulse" />
            </TableCell>
            <TableCell>
              <div className="ml-auto h-3 w-10 rounded bg-white/10 animate-pulse" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function WatchlistCompactTable({
  coins,
  pendingKeys,
  onProjectClick,
  onWatchlistToggle,
}: {
  coins: WatchlistCoin[];
  pendingKeys: Set<string>;
  onProjectClick: (coin: WatchlistCoin) => void;
  onWatchlistToggle: (coin: WatchlistCoin) => void;
}) {
  const { t } = useTranslation();

  return (
    <Table className="w-full min-w-[640px]">
      <TableHeader className="!text-[#FFFFFF]/50">
        <TableRow className="border-none">
          <TableHead className="!font-bold w-8">
            <span className="hidden">Watchlist</span>
          </TableHead>
          <TableHead className="!font-bold">{t("common.name")}</TableHead>
          <TableHead className="!font-bold text-center">{t("listings.mcLiq")}</TableHead>
          <TableHead className="!font-bold text-center">{t("listings.price24")}</TableHead>
          <TableHead className="!font-bold text-center">{t("common.age")}</TableHead>
          <TableHead className="!font-bold text-center">{t("common.riskScore")}</TableHead>
          <TableHead className="!font-bold text-right">{t("common.holders")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coins.map((coin) => {
          const pending = listingFavoriteKeys(coin).some((key) => pendingKeys.has(key));
          const change = coin.price.change["24h"] ?? 0;
          return (
            <TableRow
              key={coin.favoriteId}
              className="border-none cursor-pointer hover:!bg-[#FFFFFF1A]"
              onClick={() => onProjectClick(coin)}
            >
              <TableCell className="w-8">
                <Button
                  type="button"
                  className="p-0 size-4 min-w-4 shrink-0"
                  disabled={pending}
                  title="Remove from watchlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWatchlistToggle(coin);
                  }}
                >
                  <Image
                    src="/watchlist-active.svg"
                    alt="watchlist"
                    className="size-4 min-w-4 shrink-0 bg-transparent"
                    width={16}
                    height={16}
                  />
                </Button>
              </TableCell>
              <TableCell className="!py-1">
                <div className="flex items-center gap-1">
                  <div className="relative size-7 shrink-0">
                    <FallbackImage
                      className="size-7 rounded-full border-[0.36px] border-white object-cover"
                      src={coin.image && coin.image.trim() !== "" ? coin.image : undefined}
                      alt={coin.name || "token"}
                      width={28}
                      height={28}
                    />
                    <Image
                      className="absolute bottom-0 left-0 size-[14px] rounded-full"
                      src={getChainImage(coin.chain || "solana")}
                      alt={`${coin.chain || "solana"}-chain`}
                      width={14}
                      height={14}
                    />
                  </div>
                  <div>
                    <span className="font-medium capitalize max-w-[80px] truncate block" title={coin.name}>
                      {coin.name.length > 10 ? `${coin.name.substring(0, 10)}...` : coin.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[#FFFFFF]/50 text-xs uppercase">
                        {shortenAddressForWatchlist(coin.address)}
                      </span>
                      <Button
                        type="button"
                        className="p-0 size-3 min-w-3 h-3 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (coin.address) navigator.clipboard.writeText(coin.address);
                        }}
                      >
                        <Image src="/copy.svg" alt="copy" className="size-3" width={12} height={12} />
                      </Button>
                      <Link href={coin.website || "#"} className="inline-flex size-3" onClick={(e) => e.stopPropagation()}>
                        <Image src="/x.svg" alt="x" className="size-3" width={12} height={12} />
                      </Link>
                      <Link href={coin.website || "#"} className="inline-flex size-3" onClick={(e) => e.stopPropagation()}>
                        <Image src="/globe.svg" alt="website" className="size-3" width={12} height={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="!py-1">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium">
                    <FiatText usd={coin.marketCap} />
                  </span>
                  <span className="flex font-medium items-center text-[10px] gap-0.5">
                    <FiatText usd={coin.liquidity} />
                    <Image src="/lock.svg" alt="locked" width={8} height={8} />
                  </span>
                </div>
              </TableCell>
              <TableCell className="!py-1">
                <div className="flex flex-col items-center">
                  <span className="font-medium text-xs">
                    <FiatText usd={coin.price.amount} compact={false} />
                  </span>
                  <span
                    className={`flex font-medium items-center text-[10px] ${
                      change < 0 ? "text-[#C71624]" : "text-[#16C784]"
                    }`}
                  >
                    {change < 0 ? (
                      <ChevronDown size={16} className="border-none p-0 -mb-0.5" fill="#C71624" />
                    ) : (
                      <ChevronUp size={16} className="border-none p-0 -mb-0.5" fill="#16C784" />
                    )}
                    {Math.abs(change)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="!py-1 text-center font-medium">{coin.age || t("common.na")}</TableCell>
              <TableCell className="!py-1">
                <div className="flex justify-center items-center gap-[2px]">
                  {coin.degenAudit > 0 ? (
                    <>
                      <span>{Number.isInteger(coin.degenAudit) ? coin.degenAudit : coin.degenAudit.toFixed(1)}</span>
                      <Image src={riskIcon(coin.degenAudit)} alt="risk" width={10} height={13} />
                    </>
                  ) : (
                    <span className="text-white/40 italic">{t("common.na")}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="!py-1 text-right font-medium">
                {coin.holders > 0 ? compactNumber(coin.holders) : t("common.na")}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
