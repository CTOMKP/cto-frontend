"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { shortenAddress } from "@/utils/helper/shortenAddress";
import { compactNumber } from "@/utils/helper/compactNumber";
import FiatText from "@/components/FiatText";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MockLikeCoin } from "@/app/listings/features/types/listing";
import { getChainImage } from "@/app/listings/features/utils/listingUtils";
import FallbackImage from "@/components/FallbackImage";
import ProjectTierBadge from "@/components/ProjectTierBadge";
import CopyAddressButton from "@/components/CopyAddressButton";
import { useTranslation } from "react-i18next";

interface UserListingsTableRowProps {
  coin: MockLikeCoin;
  onListingRowClick: (coin: MockLikeCoin) => void;
}

export default function UserListingsTableRow({
  coin,
  onListingRowClick,
}: UserListingsTableRowProps) {
  const { t } = useTranslation();
  return (
    <TableRow
      className="border-none rounded-lg bg-[#FFFFFF]/5 h-13 hover:!bg-[#FFFFFF1A] cursor-pointer"
      onClick={() => onListingRowClick(coin)}
    >
      <TableCell>
        <div>
          <Button
            className="p-1"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Image
              loading="lazy"
              src="/watchlist-active.svg"
              alt="watchlist"
              className="bg-transparent size-4 min-w-fit"
              width={16}
              height={16}
            />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center h-full gap-1">
            <div className="relative size-7 shrink-0">
              <FallbackImage
                src={coin.image && coin.image.trim() !== "" ? coin.image : undefined}
                alt={coin.name || "token"}
                className="size-7 rounded-full object-cover border-[0.36px] border-white"
                width={28}
                height={28}
              />
              <Image
                loading="lazy"
                className="absolute bottom-0 left-0 size-[14px] rounded-full"
                src={getChainImage(coin.chain || "solana")}
                alt={`${coin.chain || "solana"}-chain`}
                width={14}
                height={14}
              />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span
                  className="font-medium capitalize max-w-[120px] truncate"
                  title={coin.name}
                >
                  {coin.name.length > 15 ? `${coin.name.substring(0, 15)}...` : coin.name}
                </span>
                <ProjectTierBadge tier={coin.tier} />
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[#FFFFFF]/50 text-xs uppercase">
                  {shortenAddress(coin.address)}
                </span>
                <CopyAddressButton
                  address={coin.address}
                  iconSize={8}
                  className="p-0 h-fit w-fit bg-transparent hover:bg-transparent shadow-none"
                />
                <Link href={coin.links?.twitter || "#"} onClick={(e) => e.stopPropagation()}>
                  <Image loading="lazy" src="/x.svg" alt="x" height={8} width={8} />
                </Link>
                <Link href={coin?.links?.website || "#"} onClick={(e) => e.stopPropagation()}>
                  <Image
                    loading="lazy"
                    src="/globe.svg"
                    alt="website"
                    width={7.5}
                    height={7.5}
                  />
                </Link>
              </div>
            </div>
          </div>
      </TableCell>

      <TableCell className="text-center">
        <span className="text-sm font-medium text-white/80 capitalize">
          {coin.status ?? "—"}
        </span>
      </TableCell>

      <TableCell className="flex justify-center">
        <div>
          <span className="font-medium"><FiatText usd={coin.marketCap} /></span>
          <span className="flex gap-1 font-medium items-center text-xs">
            <FiatText usd={coin.liquidity} />
            <Image
              loading="lazy"
              src="/lock.svg"
              alt="gaining-traction"
              width={9}
              height={9}
            />
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex justify-center">
          <div className="flex flex-col items-start w-fit">
            <span className="font-medium w-full text-right">
              {coin.holders != null && coin.holders > 0 ? (
                compactNumber(coin.holders)
              ) : (
                <span className="text-[#FFFFFF]/50 italic">{t("common.na")}</span>
              )}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="font-medium text-center">{coin.age ?? "—"}</TableCell>

      <TableCell className="flex justify-center">
        <div className="flex flex-col items-center">
          <span className="font-medium"><FiatText usd={coin.price.amount} compact={false} /></span>
          <span
            className={`flex font-medium items-center text-xs ${
              coin.price.change["24h"] < 0 ? "text-[#C71624]" : "text-[#16C784]"
            }`}
          >
            {coin.price.change["24h"] < 0 ? (
              <ChevronDown
                size={16}
                stroke="false"
                className="border-none p-0 -mb-0.5"
                fill="#C71624"
              />
            ) : (
              <ChevronUp
                size={16}
                stroke="false"
                className="border-none p-0 -mb-0.5"
                fill="#16C784"
              />
            )}
            <span className="font-medium">{coin.price.change["24h"]}%</span>
          </span>
        </div>
      </TableCell>

      <TableCell className="text-center">
        <div className="flex justify-center gap-1">
          <Image
            loading="lazy"
            src="/communitry-score-icons/bad-red.svg"
            alt="community-score"
            width={16}
            height={16}
          />
          <span>0%</span>
        </div>
      </TableCell>

      <TableCell className="text-right">
        <span className="flex items-center justify-center gap-1 text-right">
          {coin.degenAudit != null && coin.degenAudit > 0 ? (
            <>
              {coin.degenAudit.toFixed(1)}
              <span>
                <Image
                  loading="lazy"
                  src={`${
                    coin.degenAudit >= 70
                      ? "/risk-score/good.svg"
                      : coin.degenAudit >= 50
                        ? "/risk-score/average.svg"
                        : "/risk-score/bad.svg"
                  }`}
                  alt="risk-score"
                  width={10}
                  height={13}
                />
              </span>
            </>
          ) : (
            <span className="text-[#FFFFFF]/50 italic">
              {(() => {
                if (!coin.age) return "Not Scanned";
                const ageStr = coin.age.toLowerCase().trim();
                let days = 0;
                const yearMatch = ageStr.match(/(\d+)\s*y/);
                if (yearMatch) days += parseInt(yearMatch[1]) * 365;
                const monthMatch = ageStr.match(/(\d+)\s*mo/);
                if (monthMatch) days += parseInt(monthMatch[1]) * 30;
                const dayMatch = ageStr.match(/(\d+)\s*d/);
                if (dayMatch) days += parseInt(dayMatch[1]);
                const hourMatch = ageStr.match(/(\d+)\s*h/);
                if (hourMatch && days === 0) return "Too Young";
                if (days > 0 && days < 14) return "Too Young";
                return "Not Scanned";
              })()}
            </span>
          )}
        </span>
      </TableCell>
    </TableRow>
  );
}
