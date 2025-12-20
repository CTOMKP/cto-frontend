import Link from "next/link";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { shortenAddress } from "@/utils/helper/shortenAddress";
import { compactNumber } from "@/utils/helper/compactNumber";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MockLikeCoin } from "./types/listing";
import { getChainImage } from "./utils/listingUtils";
import ListingEngagement from "./ListingEngagement";
import FallbackImage from "@/components/FallbackImage";

interface ListingTableRowProps {
  coin: MockLikeCoin;
  onProjectClick: (address: string) => void;
}

export default function ListingTableRow({ coin, onProjectClick }: ListingTableRowProps) {
  return (
    <TableRow
      className="border-none rounded-lg bg-[#FFFFFF]/5 h-13 hover:!bg-[#FFFFFF1A] cursor-pointer"
      onClick={() => onProjectClick(coin.address)}
    >
      <TableCell>
        <div>
          <Button 
            className="p-1"
            onClick={(e) => {
              e.stopPropagation();
              // Add your watchlist logic here
              console.log('Watchlist clicked for:', coin.name);
            }}
          >
            <Image
              loading="lazy"
              src="/white-watchlist.svg"
              alt="watchlist"
              className="bg-transparent size-4 min-w-fit"
              width={16}
              height={16}
            />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-between">
          <div className="flex items-center h-full gap-1">
            <div className="relative">
              <FallbackImage
                src={coin.image && coin.image.trim() !== "" ? coin.image : undefined}
                alt={coin.name || "token"}
                className="size-7 min-w-fit rounded-full border-[0.36px] border-white"
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
                <span className="font-medium capitalize max-w-[120px] truncate" title={coin.name}>
                  {coin.name.length > 15 ? `${coin.name.substring(0, 15)}...` : coin.name}
                </span>
                {/* Tier Badge */}
                {(() => {
                  const rawTier = coin.tier;
                  const tierStr = rawTier ? String(rawTier).trim().toLowerCase() : '';
                  if (!rawTier || rawTier === null || rawTier === undefined || 
                      tierStr === 'none' || tierStr === 'null' || tierStr === 'undefined' || 
                      tierStr === '' || tierStr === '—' || tierStr === '----' || tierStr === '------' ||
                      tierStr.startsWith('---') || tierStr === 'n/a' || tierStr === 'na') {
                    return null;
                  }
                  
                  const tier = String(rawTier).trim().toLowerCase();
                  const tierIcons: Record<string, string> = {
                    stellar: "/project-categories/stellar.svg",
                    bloom: "/project-categories/bloom.svg",
                    sprout: "/project-categories/sprout.svg",
                    seed: "/project-categories/seed.svg",
                  };
                  
                  const iconPath = tierIcons[tier] || "/project-categories/bloom.svg";
                  
                  return (
                    <span className={`bg-[#15FF00]/20 rounded-[4px] p-[3px]`}>
                      <Image
                        loading="lazy"
                        src={iconPath}
                        width={8.36}
                        height={8.36}
                        alt={tier}
                      />
                    </span>
                  );
                })()}
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[#FFFFFF]/50 text-xs uppercase">
                  {shortenAddress(coin.address)}
                </span>
                <Button 
                  className="p-0 h-fit w-fit"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(coin.address);
                  }}
                >
                  <Image
                    loading="lazy"
                    src="/copy.svg"
                    alt="copy"
                    width={7.85}
                    height={8.38}
                  />
                </Button>
                <Link 
                  href={coin.website || "#"}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    loading="lazy"
                    src="/x.svg"
                    alt="x"
                    height={8}
                    width={8}
                  />
                </Link>
                <Link 
                  href={coin.website || "#"}
                  onClick={(e) => e.stopPropagation()}
                >
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

          <Button 
            className="bg-[#FF4A15]/21 text-[#FF4A15] p-0 h-fit px-1 py-1 ml-5 rounded-[5.5px] font-bold"
            onClick={(e) => {
              e.stopPropagation();
              // Add your buy logic here
              console.log('Buy clicked for:', coin.name);
            }}
          >
            Buy
          </Button>
        </div>
      </TableCell>

      {/* MC / Liq */}
      <TableCell className="flex justify-center">
        <div>
          <span className={`font-medium`}>
            ${compactNumber(coin.marketCap)}
          </span>
          <span className="flex gap-1 font-medium items-center text-xs">
            <span>${compactNumber(coin.liquidity)}</span>
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

      {/* Holders */}
      <TableCell>
        <div className="flex justify-center">
          <div className="flex flex-col items-start w-fit">
            <span className={`font-medium w-full text-right`}>
              {coin.holders && coin.holders > 0 ? compactNumber(coin.holders) : <span className="text-[#FFFFFF]/50 italic">N/A</span>}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Age */}
      <TableCell className="font-medium text-center">{coin.age}</TableCell>

      {/* Price / 24% */}
      <TableCell className="flex justify-center">
        <div className="flex flex-col items-center">
          <span className={`font-medium`}>
            ${coin.price.amount}
          </span>
          <span
            className={`flex font-medium items-center text-xs ${
              coin.price.change["24h"] < 0
                ? "text-[#C71624]"
                : "text-[#16C784]"
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
            <span className="font-medium">
              {coin.price.change["24h"]}%
            </span>
          </span>
        </div>
      </TableCell>

      {/* 1m% */}
      <TableCell>
        <span className={`flex font-medium items-center justify-center ${
          coin.price.change["1m"] < 0
            ? "text-[#C71624]"
            : "text-[#16C784]"
        }`}>
          {coin.price.change["1h"] < 0 ? (
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
          <span className="font-medium">
            {coin.price.change["1m"]}%
          </span>
        </span>
      </TableCell>

      {/* 5m% */}
      <TableCell>
        <span className={`flex font-medium items-center justify-center ${
          coin.price.change["1m"] < 0
            ? "text-[#C71624]"
            : "text-[#16C784]"
        }`}>
          {coin.price.change["1h"] < 0 ? (
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
          <span className="font-medium">
            {coin.price.change["1m"]}%
          </span>
        </span>
      </TableCell>

      {/* 1h% */}
      <TableCell>
        <span className={`flex font-medium items-center justify-center ${
          coin.price.change["1m"] < 0
            ? "text-[#C71624]"
            : "text-[#16C784]"
        }`}>
          {coin.price.change["1h"] < 0 ? (
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
          <span className="font-medium">
            {coin.price.change["1m"]}%
          </span>
        </span>
      </TableCell>

      {/* Community */}
      <TableCell className="text-center">
        <div className="flex justify-center gap-1">
          {/* Always show 0% with bad-red gauge (community score not calculated yet) */}
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

      {/* Risk Score */}
      <TableCell className="text-right">
        <span
          className={`flex items-center justify-center gap-1 text-right`}
        >
          {coin.degenAudit !== null && coin.degenAudit !== undefined && coin.degenAudit > 0 ? (
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
                // Check if token is too young (< 14 days)
                if (coin.age) {
                  // Parse age string (e.g., "5d", "13d", "14d", "365d", "1y 2mo 3d")
                  const ageStr = coin.age.toLowerCase().trim();
                  
                  // Extract days from age string
                  let days = 0;
                  
                  // Check for years (y)
                  const yearMatch = ageStr.match(/(\d+)\s*y/);
                  if (yearMatch) {
                    days += parseInt(yearMatch[1]) * 365;
                  }
                  
                  // Check for months (mo or m)
                  const monthMatch = ageStr.match(/(\d+)\s*mo/);
                  if (monthMatch) {
                    days += parseInt(monthMatch[1]) * 30;
                  }
                  
                  // Check for days (d)
                  const dayMatch = ageStr.match(/(\d+)\s*d/);
                  if (dayMatch) {
                    days += parseInt(dayMatch[1]);
                  }
                  
                  // Check for hours (h) - treat as < 1 day
                  const hourMatch = ageStr.match(/(\d+)\s*h/);
                  if (hourMatch && days === 0) {
                    return "Too Young";
                  }
                  
                  // If we have days and it's < 14, show "Too Young"
                  if (days > 0 && days < 14) {
                    return "Too Young";
                  }
                }
                
                // Default message for tokens without risk score
                return "Not Scanned";
              })()}
            </span>
          )}
        </span>
      </TableCell>
      {/* Tier */}
      <TableCell className="text-center">
        {(() => {
          const rawTier = coin.tier;
          
          // Normalize tier - handle all invalid formats
          if (!rawTier || rawTier === null || rawTier === undefined) {
            return <span className="text-[#FFFFFF]/50">—</span>;
          }
          
          const tierStr = String(rawTier).trim().toLowerCase();
          
          // Check for all invalid tier values (including dash variations)
          if (tierStr === 'none' || tierStr === 'null' || tierStr === 'undefined' || 
              tierStr === '' || tierStr === '—' || tierStr === '----' || tierStr === '------' ||
              tierStr.startsWith('---') || tierStr === 'n/a' || tierStr === 'na' ||
              /^[-—]+$/.test(tierStr)) { // Match any string that's only dashes/em-dashes
            return <span className="text-[#FFFFFF]/50">—</span>;
          }
          
          const tier = tierStr;
          const tierColors: Record<string, { bg: string; text: string }> = {
            stellar: { bg: 'bg-purple-900/30', text: 'text-purple-200' },
            bloom: { bg: 'bg-blue-900/30', text: 'text-blue-200' },
            sprout: { bg: 'bg-green-900/30', text: 'text-green-200' },
            seed: { bg: 'bg-yellow-900/30', text: 'text-yellow-200' },
          };
          
          const colors = tierColors[tier] || { bg: 'bg-gray-700/30', text: 'text-gray-300' };
          
          return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors.bg} ${colors.text}`}>
              {tier.toUpperCase()}
            </span>
          );
        })()}
      </TableCell>
      <TableCell>
        <ListingEngagement />
      </TableCell>
    </TableRow>
  );
}

