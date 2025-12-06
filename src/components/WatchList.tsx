"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { compactNumber } from "@/utils/helper/compactNumber";
import Link from "next/link";
import Image from "next/image";
import { shortenAddress } from "@/utils/helper/shortenAddress";

export type Filter = "all" | "memecoins" | "emojicoins";

const watchListData = [
  {
    name: "$GAINER1",
    whale: true,
    age: "21hr",
    address: "0xgainer000026a81f1e1df288dc68e3c423a159",
    x: "https://twitter.com/gainer1",
    website: "https://gainer1.com",
    image: "/homepage/trending-coins/default-coin.png",
    communityScore: 40,
    degenAudit: 1,
    mindshare: {
      mentions: 1907,
      sentiment: "positive",
      volume: 34687,
    },
    price: {
      amount: 7.43e-6,
      change: {
        "1m": -3.95,
        "5m": 9.06,
        "1h": -7.01,
        "5h": 9.61,
        "24h": 193.05,
      },
    },
    marketCap: 512724,
    liquidity: 326048,
    volume: {
      amount: 708599,
      timeframe: {
        "1m": 8015,
        "5m": 4941,
        "1h": 15397,
        "5h": 117503,
        "24h": 485299,
      },
    },
    holders: 5687,
  },
  {
    name: "$GAINER1",
    whale: true,
    age: "21hr",
    address: "0xgainer000026a81f1e1df288dc68e3c423a159",
    x: "https://twitter.com/gainer1",
    website: "https://gainer1.com",
    image: "/homepage/trending-coins/default-coin.png",
    communityScore: 40,
    degenAudit: 1,
    mindshare: {
      mentions: 1907,
      sentiment: "positive",
      volume: 34687,
    },
    price: {
      amount: 7.43e-6,
      change: {
        "1m": -3.95,
        "5m": 9.06,
        "1h": -7.01,
        "5h": 9.61,
        "24h": 193.05,
      },
    },
    marketCap: 512724,
    liquidity: 326048,
    volume: {
      amount: 708599,
      timeframe: {
        "1m": 8015,
        "5m": 4941,
        "1h": 15397,
        "5h": 117503,
        "24h": 485299,
      },
    },
    holders: 5687,
  },
  {
    name: "$GAINER1",
    whale: true,
    age: "21hr",
    address: "0xgainer000026a81f1e1df288dc68e3c423a159",
    x: "https://twitter.com/gainer1",
    website: "https://gainer1.com",
    image: "/homepage/trending-coins/default-coin.png",
    communityScore: 40,
    degenAudit: 1,
    mindshare: {
      mentions: 1907,
      sentiment: "positive",
      volume: 34687,
    },
    price: {
      amount: 7.43e-6,
      change: {
        "1m": -3.95,
        "5m": 9.06,
        "1h": -7.01,
        "5h": 9.61,
        "24h": 193.05,
      },
    },
    marketCap: 512724,
    liquidity: 326048,
    volume: {
      amount: 708599,
      timeframe: {
        "1m": 8015,
        "5m": 4941,
        "1h": 15397,
        "5h": 117503,
        "24h": 485299,
      },
    },
    holders: 5687,
  },
  {
    name: "$GAINER1",
    whale: true,
    age: "21hr",
    address: "0xgainer000026a81f1e1df288dc68e3c423a159",
    x: "https://twitter.com/gainer1",
    website: "https://gainer1.com",
    image: "/homepage/trending-coins/default-coin.png",
    communityScore: 40,
    degenAudit: 1,
    mindshare: {
      mentions: 1907,
      sentiment: "positive",
      volume: 34687,
    },
    price: {
      amount: 7.43e-6,
      change: {
        "1m": -3.95,
        "5m": 9.06,
        "1h": -7.01,
        "5h": 9.61,
        "24h": 193.05,
      },
    },
    marketCap: 512724,
    liquidity: 326048,
    volume: {
      amount: 708599,
      timeframe: {
        "1m": 8015,
        "5m": 4941,
        "1h": 15397,
        "5h": 117503,
        "24h": 485299,
      },
    },
    holders: 5687,
  },
  {
    name: "$GAINER1",
    whale: true,
    age: "21hr",
    address: "0xgainer000026a81f1e1df288dc68e3c423a159",
    x: "https://twitter.com/gainer1",
    website: "https://gainer1.com",
    image: "/homepage/trending-coins/default-coin.png",
    communityScore: 40,
    degenAudit: 1,
    mindshare: {
      mentions: 1907,
      sentiment: "positive",
      volume: 34687,
    },
    price: {
      amount: 7.43e-6,
      change: {
        "1m": -3.95,
        "5m": 9.06,
        "1h": -7.01,
        "5h": 9.61,
        "24h": 193.05,
      },
    },
    marketCap: 512724,
    liquidity: 326048,
    volume: {
      amount: 708599,
      timeframe: {
        "1m": 8015,
        "5m": 4941,
        "1h": 15397,
        "5h": 117503,
        "24h": 485299,
      },
    },
    holders: 5687,
  },
];

export default function WatchList() {
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const filters: Filter[] = ["all", "memecoins", "emojicoins"];

  const labels: Record<Filter, string> = {
    all: "All",
    memecoins: "Memecoins",
    emojicoins: "Emojicoins",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20]">
        <span className="bg-[#FFFFFF0D] rounded-sm size-7 flex items-center justify-center">
          <Image loading="lazy" src="/watchlist.svg" alt="watchlist" width={15} height={15} />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#010101] text-white p-6 w-[534px] border-2 border-[#86868630]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF20] rounded-lg items-center px-1">
            {filters.map((filter) => (
              <Button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg ${
                  selectedFilter === filter
                    ? "bg-[#17171C] text-white"
                    : "bg-transparent text-[#A1A1AA]"
                }`}
              >
                {labels[filter]}
              </Button>
            ))}
          </div>

          <button className="border-[0.2px] gap-1 w-[85px] text-[#A1A1AA] !px-0 border-[#FFFFFF20] rounded-lg h-9 font-medium text-sm flex items-center justify-center">
            Full view <ChevronRight size={12} />
          </button>
        </div>

        <Table className="w-full border-separate border-spacing-y-2">
          <TableHeader className="text-xs text-[#FFFFFF80]">
            <TableRow className="border-none">
              <TableHead className="!font-bold">
                <span className="hidden">Watchlist button</span>
              </TableHead>
              <TableHead className="!font-bold w-70">Name</TableHead>
              <TableHead className="!font-bold">Price</TableHead>
              <TableHead className="!font-bold text-end">MC / Liq</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {watchListData.map((coin, i) => (
              <TableRow
                key={i}
                className="border-none rounded-lg h-13"
              >
                <TableCell className="!p-0">
                  <div className="flex justify-end">
                    <Button className="p-1">
                      <Image
                        loading="lazy"
                        src="/watchlist-active.svg"
                        alt="watchlist"
                        className="bg-transparent"
                        width={16}
                        height={16}
                      />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center h-full gap-1">
                    <div className="relative">
                      <Image
                        className="size-10 rounded-full border-[0.5px] border-white"
                        src="/homepage/trending-coins/default-coin.png"
                        alt="default-coin"
                        width={40}
                        height={40}
                        loading="lazy"
                      />
                      <Image
                        className="absolute bottom-0 left-0 size-[19px]"
                        loading="lazy"
                        src="/homepage/trending-coins/default-chain.png"
                        alt="trending-coins"
                        width={19}
                        height={19}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-base font-medium capitalize">
                          {coin.name}
                        </span>
                        <Image
                          loading="lazy"
                          src="/homepage/trending-coins/whale.svg"
                          alt="whale"
                          width={10}
                          height={8.5}
                        />
                        <Image
                          loading="lazy"
                          src="/homepage/trending-coins/age.svg"
                          alt="age"
                          height={9.5}
                          width={9}
                        />
                        <Image
                          loading="lazy"
                          src="/homepage/trending-coins/mindshare.svg"
                          alt="mindshare"
                          height={10.79}
                          width={10.5}
                        />
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[#343434] text-[9px] uppercase">
                          {shortenAddress(coin.address)}
                        </span>
                        <Button className="p-0 h-fit w-fit">
                          <Image
                            loading="lazy"
                            src="/copy.svg"
                            alt="copy"
                            width={7.85}
                            height={8.38}
                          />
                        </Button>
                        <Link href="#">
                          <Image loading="lazy"src="/x.svg" alt="x" height={8} width={8} />
                        </Link>
                        <Link href="#">
                          <Image
                            src="/globe.svg"
                            alt="website"
                            width={7.5}
                            height={7.5}
                            loading="lazy"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Price / 24% */}
                <TableCell>
                  <div>
                    <span className={`text-xs font-medium`}>
                      ${coin.price.amount}
                    </span>
                    <span
                      className={`flex font-medium items-end text-[10px] ${
                        coin.price.change["24h"] < 0
                          ? "text-[#C71624]"
                          : "text-[#16C784]"
                      }`}
                    >
                      <span className="text-[#FFFFFF50]">24h</span>
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

                {/* MC / Liq */}
                <TableCell>
                  <div className="flex justify-end">
                        <div>
                    <span className={`text-xs font-medium`}>
                      ${compactNumber(coin.marketCap)}
                    </span>
                    <span className="flex font-medium items-center text-[10px]">
                      <span>${compactNumber(coin.liquidity)}</span>
                      <Image
                        src="/lock.svg"
                        alt="gaining-traction"
                        width={8}
                        height={8}
                        loading="lazy"
                      />
                    </span>
                  </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
