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
              src="/white-watchlist.svg"
              alt="watchlist"
              className="bg-transparent"
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
              <Image
                className="size-7 rounded-full border-[0.36px] border-white"
                src={coin.image && coin.image.trim() !== "" ? coin.image : "/homepage/trending-coins/default-coin.png"}
                alt="default-coin"
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
              <div className="flex items-center gap-1">
                <span className="font-medium capitalize max-w-[120px] truncate" title={coin.name}>
                  {coin.name.length > 15 ? `${coin.name.substring(0, 15)}...` : coin.name}
                </span>
                <span
                  className={`bg-[#15FF00]/20 rounded-[4px] p-[3px]`}
                >
                  <Image
                    src="/project-categories/bloom.svg"
                    width={8.36}
                    height={8.36}
                    alt="green"
                  />
                </span>
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
            className="bg-[#FF4A15]/21 p-0 h-fit px-1 py-1 ml-5 rounded-[5.5px] font-bold"
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
          <span className="flex font-medium items-center text-xs text-[#FF9631]">
            <span>${compactNumber(coin.liquidity)}</span>
            <Image
              src="/emoji-icons/gaining-traction.svg"
              alt="gaining-traction"
              width={8}
              height={8}
            />
          </span>
        </div>
      </TableCell>

      {/* Holders */}
      <TableCell>
        <div className="flex justify-center">
          <div className="flex flex-col items-start w-fit">
            <span className={`font-medium w-full text-right`}>
              {compactNumber(coin.holders)}
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
          <Image
            src={
              coin.communityScore < 50
                ? "/communitry-score-icons/bad-red.svg"
                : coin.communityScore >= 50 && coin.communityScore < 70
                ? "/communitry-score-icons/average-yellow.svg"
                : "/communitry-score-icons/good-green.svg"
            }
            alt={
              coin.communityScore < 50
                ? "bad-red"
                : coin.communityScore >= 50 && coin.communityScore < 70
                ? "average-yellow"
                : "good-green"
            }
            width={16}
            height={16}
          />{" "}
          <span>{coin.communityScore}%</span>
        </div>
      </TableCell>

      {/* Audit */}
      <TableCell className="text-right">
        <span
          className={`flex items-center justify-center gap-1 text-right`}
        >
          {coin.degenAudit}
          <span>
            <Image
              src={`${
                coin.degenAudit >= 70
                  ? "/risk-score/good.svg"
                  : coin.degenAudit >= 50
                  ? "/risk-score/average.svg"
                  : "/risk-score/bad.svg"
              }`}
              alt="degen-audit"
              width={10}
              height={13}
            />
          </span>
        </span>
      </TableCell>
      <TableCell>
        <ListingEngagement />
      </TableCell>
    </TableRow>
  );
}

