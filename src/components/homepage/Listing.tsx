"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "../ui/button";
import { shortenAddress } from "@/utils/helper/shortenAddress";
import { compactNumber } from "@/utils/helper/compactNumber";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useMemo } from "react";
import TimeframeFilterBar, { Timeframe } from "../TimeframeFilterBar";
import ListingsCategoryFilter, { Category } from "../ListingsCategoryFilter";

export const mockData = [
  {
    name: "$DOGWIFTRUMP",
    whale: true,
    age: "0.5hr",
    address: "0xa3f1b9c0d12e1234aa56789a4bcd9effff1290ab",
    x: "https://twitter.com/dogwiftrump",
    website: "https://dogwiftrump.io",
    image: "/homepage/trending-coins/default-coin.png",
    communityScore: 91, // strong X/Telegram traction
    degenAudit: 3,
    mindshare: {
      mentions: 1223,
      sentiment: "very positive",
      volume: 25000,
    },
    price: {
      amount: 0.0000045,
      change: {
        "1m": 4.2,
        "5m": 8.6,
        "1h": 12.5,
        "5h": 58.4,
        "24h": 132.8,
      },
    },
    marketCap: 1420000,
    liquidity: 305000,
    volume: {
      amount: 890000,
      timeframe: {
        "1m": 25000,
        "5m": 72000,
        "1h": 210000,
        "5h": 350000,
        "24h": 890000,
      },
    },
    holders: 9784,
  },
  {
    name: "$PEPE2.69",
    whale: false,
    age: "12hr",
    address: "0xbeefc0ffee11223344556677889900aa112233bb",
    x: "https://twitter.com/pepe269",
    website: "https://pepe269.com",
    image: "/homepage/trending-coins/default-coin.png",
    communityScore: 78, // meme cult following
    degenAudit: 2,
    mindshare: {
      mentions: 728,
      sentiment: "mixed",
      volume: 13000,
    },
    price: {
      amount: 0.0000011,
      change: {
        "1m": -1.2,
        "5m": -3.8,
        "1h": -2.5,
        "5h": 4.1,
        "24h": 15.3,
      },
    },
    marketCap: 340000,
    liquidity: 120000,
    volume: {
      amount: 220000,
      timeframe: {
        "1m": 3000,
        "5m": 9000,
        "1h": 22000,
        "5h": 90000,
        "24h": 220000,
      },
    },
    holders: 1635,
  },
  {
    name: "$ZOGE",
    whale: true,
    age: "4hr",
    address: "0x4200420042004200420042004200420042004242",
    x: "https://x.com/zogeonbase",
    website: "https://zoge.net",
    image: "/homepage/trending-coins/default-coin.png",
    communityScore: 87,
    degenAudit: 1,
    mindshare: {
      mentions: 1560,
      sentiment: "positive",
      volume: 31000,
    },
    price: {
      amount: 0.0000098,
      change: {
        "1m": 0.5,
        "5m": 1.2,
        "1h": 5.9,
        "5h": 28.6,
        "24h": 97.3,
      },
    },
    marketCap: 920000,
    liquidity: 200000,
    volume: {
      amount: 510000,
      timeframe: {
        "1m": 4000,
        "5m": 16000,
        "1h": 90000,
        "5h": 175000,
        "24h": 510000,
      },
    },
    holders: 5500,
  },
  {
    name: "$STINKY",
    whale: false,
    age: "36hr",
    address: "0x1337133713371337133713371337133713371337",
    x: "https://twitter.com/stinkytoken",
    website: "https://stinky.gg",
    image: "/homepage/trending-coins/default-coin.png",
    communityScore: 55, // mid-tier community
    degenAudit: 0,
    mindshare: {
      mentions: 87,
      sentiment: "negative",
      volume: 1700,
    },
    price: {
      amount: 0.0000027,
      change: {
        "1m": -4.2,
        "5m": -7.1,
        "1h": -16.5,
        "5h": -35.6,
        "24h": -63.8,
      },
    },
    marketCap: 38000,
    liquidity: 6800,
    volume: {
      amount: 76000,
      timeframe: {
        "1m": 30,
        "5m": 120,
        "1h": 3000,
        "5h": 20000,
        "24h": 76000,
      },
    },
    holders: 215,
  },
  {
    name: "$BONEFIRE",
    whale: false,
    age: "18hr",
    address: "0xdeadd00ddeadbeefdeadbeefdeadbeefdeadbeef",
    x: "https://twitter.com/bonefireeth",
    website: "https://bonefire.fun",
    image: "/homepage/trending-coins/default-coin.png",
    communityScore: 69,
    degenAudit: 2,
    mindshare: {
      mentions: 341,
      sentiment: "neutral",
      volume: 4200,
    },
    price: {
      amount: 0.0000056,
      change: {
        "1m": 0.0,
        "5m": 0.2,
        "1h": -1.1,
        "5h": 2.4,
        "24h": 5.9,
      },
    },
    marketCap: 220000,
    liquidity: 100000,
    volume: {
      amount: 119000,
      timeframe: {
        "1m": 800,
        "5m": 1500,
        "1h": 4500,
        "5h": 40000,
        "24h": 119000,
      },
    },
    holders: 930,
  },
];

export default function TopListings() {
  const [category, setCategory] = useState<Category>("new");

  const listings = useMemo(() => {
    return {
      gainers: mockData
        .filter((coin) => coin.price.change["24h"] > 0)
        .sort((a, b) => b.price.change["24h"] - a.price.change["24h"]),
      losers: mockData
        .filter((coin) => coin.price.change["24h"] < 0)
        .sort((a, b) => a.price.change["24h"] - b.price.change["24h"]),
      new: mockData.filter((coin) => {
        const age = parseFloat(coin.age);
        return coin.age.includes("min") || (coin.age.includes("hr") && age < 1);
      }),
    };
  }, []);

  const filteredData = listings[category];

  return (
    <div>
      <div className='h-px w-full bg-[#FF007510] mt-7 mb-4.5'></div>
      <div className="w-[87%] mx-auto">
        <Card className="w-full p-3 border-none border-[#FF007510] text-white">
      <CardHeader className="flex justify-between items-center px-0">
        <CardTitle className="hidden">
          <img
            src="/emoji-icons/trophy.svg"
            alt="listings"
            width={16}
            height={16}
          />
          {category === "gainers"
            ? "Top Gainers"
            : category === "losers"
            ? "Top Losers"
            : "New Listings"}
          <img
            className="mt-0.5"
            src="/info.svg"
            alt="info"
            width={13}
            height={13}
          />
        </CardTitle>
        <CardAction>
          <ListingsCategoryFilter
            selected={category}
            onChange={(c: Category) => setCategory(c)}
          />
        </CardAction>
      </CardHeader>

      <CardContent className="px-0">
        <Table className="w-full">
          <TableHeader className="text-xs text-[#FFFFFF80]">
            <TableRow className="border-none">
              <TableHead className="!font-bold">Name</TableHead>
              <TableHead className="!font-bold">MC / Liq</TableHead>
              <TableHead className="!font-bold">Holders</TableHead>
              <TableHead className="!font-bold">Age</TableHead>
              <TableHead className="!font-bold">Price / 24%</TableHead>
              <TableHead className="!font-bold">1m%</TableHead>
              <TableHead className="!font-bold">5m%</TableHead>
              <TableHead className="!font-bold">1h%</TableHead>
              <TableHead className="!font-bold flex justify-center">
                <span className="flex items-center gap-1">
                  Community score 
                      <img
                      className="mt-0.5"
                      src="/info.svg"
                      alt="info"
                      width={13}
                      height={13}
                    />
                </span>
                </TableHead>
              <TableHead className="!font-bold text-center">Degen Audit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((coin, i) => (
              <TableRow key={i} className="border-none">
                <TableCell>
                  <div className="flex items-center h-full gap-1">
                    <div className="relative">
                    <img
                      className="size-7 rounded-full border-[0.36px] border-white"
                      src="/homepage/trending-coins/default-coin.png"
                      alt="default-coin"
                    />
                    <img
                      className="absolute bottom-0 left-0 size-[14px]"
                      src="/homepage/trending-coins/default-chain.png"
                      alt="trending-coins"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium capitalize">
                        {coin.name}
                      </span>
                      <img
                        src="/homepage/trending-coins/whale.svg"
                        alt="whale"
                        width={10}
                        height={8.5}
                      />
                      <img
                        src="/homepage/trending-coins/age.svg"
                        alt="age"
                        height={9.5}
                        width={9}
                      />
                      <img
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
                        <img
                          src="/copy.svg"
                          alt="copy"
                          width={7.85}
                          height={8.38}
                        />
                      </Button>
                      <Link href="#">
                        <img src="/x.svg" alt="x" height={8} width={8} />
                      </Link>
                      <Link href="#">
                        <img
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

                {/* MC / Liq */}
                <TableCell>
                  <div>
                    <span className={`text-xs font-medium`}>
                      ${compactNumber(coin.marketCap)}
                    </span>
                    <span className="flex font-medium items-center text-[10px] text-[#FF9631]">
                      <span>${compactNumber(coin.liquidity)}</span>
                      <img
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
                  <div className="flex flex-col items-start w-fit">
                    <span className={`text-xs font-medium w-full text-right`}>
                      ${compactNumber(coin.holders)}
                    </span>
                    <span>
                      <img
                        src="/up-trend-graph.png"
                        alt="up-trend-graph"
                        width={44}
                        className="h-[11px]"
                      />
                    </span>
                  </div>
                </TableCell>

                {/* Age */}
                <TableCell className="text-xs font-medium">{coin.age}</TableCell>

                {/* Price / 24% */}
                <TableCell>
                  <div>
                    <span className={`text-xs font-medium`}>
                      ${coin.price.amount}
                    </span>
                    <span className={`flex font-medium items-end text-[10px] ${coin.price.change["24h"] < 0 ? 'text-[#C71624]' : 'text-[#16C784]'}`}>
                      {coin.price.change["24h"] < 0 ?
                        <ChevronDown
                        size={16}
                        stroke="false"
                        className="border-none p-0 -mb-0.5"
                        fill="#C71624"
                      /> :
                      <ChevronUp
                        size={16}
                        stroke="false"
                        className="border-none p-0 -mb-0.5"
                        fill="#16C784"
                      />}
                      <span className="font-medium">{coin.price.change["24h"]}%</span>
                  </span>
                  </div>
                </TableCell>

                {/* 1m% */}
                <TableCell className={`text-[10px] ${coin.price.change["1m"] < 0 ? 'text-[#C71624]' : 'text-[#16C784]'}`}>
                  <span className="flex font-medium items-end text-[10px]">
                      {coin.price.change["1m"] < 0 ?
                        <ChevronDown
                        size={16}
                        stroke="false"
                        className="border-none p-0 -mb-0.5"
                        fill="#C71624"
                      /> :
                      <ChevronUp
                        size={16}
                        stroke="false"
                        className="border-none p-0 -mb-0.5"
                        fill="#16C784"
                      />}
                      <span className="font-medium">{coin.price.change["1m"]}%</span>
                  </span>
                </TableCell>

                {/* 5m% */}
                <TableCell className={`text-[10px] ${coin.price.change["5m"] < 0 ? 'text-[#C71624]' : 'text-[#16C784]'}`}>
                  <span className="flex font-medium items-end text-[10px]">
                      {coin.price.change["5m"] < 0 ?
                        <ChevronDown
                        size={16}
                        stroke="false"
                        className="border-none p-0 -mb-0.5"
                        fill="#C71624"
                      /> :
                      <ChevronUp
                        size={16}
                        stroke="false"
                        className="border-none p-0 -mb-0.5"
                        fill="#16C784"
                      />}
                      <span className="font-medium">{coin.price.change["5m"]}%</span>
                  </span>
                </TableCell>

                {/* 1h% */}
                <TableCell className={`text-[10px] ${coin.price.change["1h"] < 0 ? 'text-[#C71624]' : 'text-[#16C784]'}`}>
                  <span className="flex font-medium items-end text-[10px]">
                      {coin.price.change["1h"] < 0 ?
                        <ChevronDown
                        size={16}
                        stroke="false"
                        className="border-none p-0 -mb-0.5"
                        fill="#C71624"
                      /> :
                      <ChevronUp
                        size={16}
                        stroke="false"
                        className="border-none p-0 -mb-0.5"
                        fill="#16C784"
                      />}
                      <span className="font-medium">{coin.price.change["1h"]}%</span>
                  </span>
                </TableCell>

                {/* Community */}
                <TableCell className="text-[10px] text-center">
                  <div className="flex justify-center gap-1">
                    <img src="/communitry-score-icons/bad-red.svg" alt="bad-red" /> <span>{coin.communityScore}</span>
                  </div>
                </TableCell>

                {/* Audit */}
                <TableCell className="text-[10px] text-right">
                  <span
                    className={`flex items-center justify-center gap-1 text-right`}
                  >
                    {coin.degenAudit}/3
                    <span><img src={`${
                      coin.degenAudit === 3
                        ? "/degen-audit/3.svg"
                        : coin.degenAudit === 2
                        ? "/degen-audit/2.svg"
                        : coin.degenAudit === 1
                        ? "/degen-audit/1.svg"
                        : "/degen-audit/0.svg"
                    }`} alt="" />
                    </span>
                    </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
    </div>
  );
}
