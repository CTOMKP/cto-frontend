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
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { shortenAddress } from "@/utils/helper/shortenAddress";
import { compactNumber } from "@/utils/helper/compactNumber";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import TimeframeFilterBar, {
  Timeframe,
} from "../../../components/TimeframeFilterBar";

const mockData = [
  {
    name: "$ROGERS",
    whale: true,
    age: "1h",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    x: "https://example.com/rogers",
    website: "https://rogers.com",
    image: "/default-trending-coin-img.png",
    mindshare: {
      mentions: 4.5,
      sentiment: "positive",
      volume: 1000,
    },
    price: {
      amount: 0.0254,
      change: {
        "1m": 0.1,
        "5m": 0.2,
        "1h": 0.3,
        "5h": 0.6,
        "24h": 0.9,
      },
    },
    marketCap: 360700,
    liquidity: 61900,
    volume: {
      amount: 100600,
      timeframe: {
        "1m": 9.31,
        "5m": 0.05,
        "1h": 4.5,
        "5h": 0.08,
        "24h": 0.07,
      },
    },
    holders: 4500,
    riskScore: 85,
  },
  {
    name: "$ROGERS",
    whale: true,
    age: "1h",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    x: "https://example.com/rogers",
    website: "https://rogers.com",
    image: "/default-trending-coin-img.png",
    mindshare: {
      mentions: 4.5,
      sentiment: "positive",
      volume: 1000,
    },
    price: {
      amount: 0.0254,
      change: {
        "1m": 0.1,
        "5m": 0.2,
        "1h": 0.3,
        "5h": 0.6,
        "24h": 0.9,
      },
    },
    marketCap: 360700,
    liquidity: 61900,
    volume: {
      amount: 100600,
      timeframe: {
        "1m": 9.31,
        "5m": 0.05,
        "1h": 4.5,
        "5h": 0.08,
        "24h": 0.07,
      },
    },
    holders: 4500,
    riskScore: 85,
  },
  {
    name: "$ROGERS",
    whale: true,
    age: "1h",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    x: "https://example.com/rogers",
    website: "https://rogers.com",
    image: "/default-trending-coin-img.png",
    mindshare: {
      mentions: 4.5,
      sentiment: "positive",
      volume: 1000,
    },
    price: {
      amount: 0.0254,
      change: {
        "1m": 0.1,
        "5m": 0.2,
        "1h": 0.3,
        "5h": 0.6,
        "24h": 0.9,
      },
    },
    marketCap: 360700,
    liquidity: 61900,
    volume: {
      amount: 100600,
      timeframe: {
        "1m": 9.31,
        "5m": 0.05,
        "1h": 4.5,
        "5h": 0.08,
        "24h": 0.07,
      },
    },
    holders: 4500,
    riskScore: 85,
  },
  {
    name: "$ROGERS",
    whale: true,
    age: "1h",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    x: "https://example.com/rogers",
    website: "https://rogers.com",
    image: "/default-trending-coin-img.png",
    mindshare: {
      mentions: 4.5,
      sentiment: "positive",
      volume: 1000,
    },
    price: {
      amount: 0.0254,
      change: {
        "1m": 0.1,
        "5m": 0.2,
        "1h": 0.3,
        "5h": 0.6,
        "24h": 0.9,
      },
    },
    marketCap: 360700,
    liquidity: 61900,
    volume: {
      amount: 100600,
      timeframe: {
        "1m": 9.31,
        "5m": 0.05,
        "1h": 4.5,
        "5h": 0.08,
        "24h": 0.07,
      },
    },
    holders: 4500,
    riskScore: 85,
  },
  {
    name: "$ROGERS",
    whale: true,
    age: "1h",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    x: "https://example.com/rogers",
    website: "https://rogers.com",
    image: "/default-trending-coin-img.png",
    mindshare: {
      mentions: 4.5,
      sentiment: "positive",
      volume: 1000,
    },
    price: {
      amount: 0.0254,
      change: {
        "1m": 0.1,
        "5m": 0.2,
        "1h": 0.3,
        "5h": 0.6,
        "24h": 0.9,
      },
    },
    marketCap: 360700,
    liquidity: 61900,
    volume: {
      amount: 100600,
      timeframe: {
        "1m": 9.31,
        "5m": 0.05,
        "1h": 4.5,
        "5h": 0.08,
        "24h": 0.07,
      },
    },
    holders: 4500,
    riskScore: 85,
  },
  {
    name: "$ROGERS",
    whale: true,
    age: "1h",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    x: "https://example.com/rogers",
    website: "https://rogers.com",
    image: "/default-trending-coin-img.png",
    mindshare: {
      mentions: 4.5,
      sentiment: "positive",
      volume: 1000,
    },
    price: {
      amount: 0.0254,
      change: {
        "1m": 0.1,
        "5m": 0.2,
        "1h": 0.3,
        "5h": 0.6,
        "24h": 0.9,
      },
    },
    marketCap: 360700,
    liquidity: 61900,
    volume: {
      amount: 100600,
      timeframe: {
        "1m": 9.31,
        "5m": 0.05,
        "1h": 4.5,
        "5h": 0.08,
        "24h": 0.07,
      },
    },
    holders: 4500,
    riskScore: 85,
  },
];

export default function TrendingCoins() {
  const [timeframe, setTimeframe] = useState<Timeframe>("1h");

  return (
    <div className="bg-gradient-to-r from-pink-500 to-yellow-400 p-[0.7px] rounded-xl inline-block">
      <Card className="w-fit p-3 border-none bg-[#010101]">
        <CardHeader className="flex justify-between items-center px-0">
          <CardTitle className="flex items-center gap-1 text-base">
            <span>What&apos;s Hot?</span>
            <Image
              className="mt-0.5"
              src="/info.svg"
              alt="info"
              width={13}
              height={13}
            />
          </CardTitle>
          <CardAction>
            <TimeframeFilterBar
              selected={timeframe}
              onChange={(t: string) => setTimeframe(t as Timeframe)}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="px-0 -mt-5">
          <Table className="w-[422px]">
            <TableHeader className="!text-[#FFFFFF]/50">
              <TableRow className="border-none">
                <TableHead className="!font-bold">Name</TableHead>
                <TableHead className="!font-bold">MC/Liq</TableHead>
                <TableHead className="!font-bold">Age</TableHead>
                <TableHead className="!font-bold">Risk score</TableHead>
                <TableHead className="!font-bold text-right">Holders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((data, index) => (
                <TableRow key={index} className="border-none">
                  {/* name */}
                  <TableCell className="!py-1">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <Image
                          className="size-7 rounded-full border-[0.36px] border-white"
                          src="/homepage/trending-coins/default-coin.png"
                          alt="default-coin"
                          width={28}
                          height={28}
                        />
                        <Image
                          className="absolute bottom-0 left-0 size-[14px]"
                          src="/homepage/trending-coins/default-chain.png"
                          alt="trending-coins"
                          width={14}
                          height={14}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium capitalize">
                            {data.name}
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
                            {shortenAddress(data.address)}
                          </span>
                          <Button className="p-0 h-fit w-fit text-white">
                            <Image
                              src="/copy.svg"
                              alt="copy"
                              className="text-white fill-white"
                              width={7.85}
                              height={8.38}
                            />
                          </Button>
                          <Link href="#">
                            <Image src="/x.svg" alt="x" height={8} width={8} />
                          </Link>
                          <Link href="#">
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
                  </TableCell>
                  {/* mc/liq */}
                  <TableCell className="!py-1">
                    <div>
                      <span className={`text-xs font-medium`}>
                        ${compactNumber(data.marketCap)}
                      </span>
                      <span className="flex font-medium items-center text-[10px] text-[#FF9631]">
                        <span>${compactNumber(data.liquidity)}</span>
                        <Image
                          src="/emoji-icons/gaining-traction.svg"
                          alt="gaining-traction"
                          width={8}
                          height={8}
                        />
                      </span>
                    </div>
                  </TableCell>
                  {/* age */}
                  <TableCell className="!py-1">
                    <div>
                      <span className={`font-medium flex justify-center`}>
                        {data.age}
                      </span>
                    </div>
                  </TableCell>
                  {/* risk score */}
                  <TableCell className="!py-1">
                    <div className="flex justify-center items-center gap-[2px]">
                      <span>{data.riskScore}</span>
                      <Image
                        src="/risk-score-green.svg"
                        alt="risk-badge"
                        width={10}
                        height={13}
                      />
                    </div>
                  </TableCell>
                  {/* holders */}
                  <TableCell className="!py-1">
                    <div className="flex flex-col items-end">
                      <span className={`font-medium`}>
                        {compactNumber(data.holders)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
