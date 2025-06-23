'use client'

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
import { ChevronUp } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import TimeframeFilterBar, { Timeframe } from "../TimeframeFilterBar";

const mockData = [
  {
    name: "$ROGERS",
    whale: true,
    age: "1hr",
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
    "24h": 0.9
  }
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
      }
},
    holders: 4500,
  },
  {
    name: "$ROGERS",
    whale: true,
    age: "1hr",
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
    "24h": 0.9
  }
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
      }
},
    holders: 4500,
  },
  {
    name: "$ROGERS",
    whale: true,
    age: "1hr",
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
    "24h": 0.9
  }
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
      }
},
    holders: 4500,
  },
  {
    name: "$ROGERS",
    whale: true,
    age: "1hr",
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
    "24h": 0.9
  }
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
      }
},
    holders: 4500,
  },
  {
    name: "$ROGERS",
    whale: true,
    age: "1hr",
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
    "24h": 0.9
  }
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
      }
},
    holders: 4500,
  },
];



export default function TrendingCoins() {
  const [timeframe, setTimeframe] = useState<Timeframe>("1h");
  
  return (
    <Card className="w-fit p-3 border border-[#FF007510]">
      <CardHeader className="flex justify-between items-center px-0">
        <CardTitle className="flex gap-1">
          <img
            src="/emoji-icons/gaining-traction.svg"
            alt="gaining-traction"
            width={16}
            height={16}
          />
          Trending{" "}
          <img
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
          <TableHeader className="text-xs text-[#FFFFFF80]">
            <TableRow className="border-none">
              <TableHead className="!font-bold">Name</TableHead>
              <TableHead className="!font-bold">Price</TableHead>
              <TableHead className="!font-bold">MC/Liq</TableHead>
              <TableHead className="!font-bold">Volume</TableHead>
              <TableHead className="!font-bold text-right">Holders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((data, index) => (
              <TableRow key={index} className="border-none">
                <TableCell className="!py-1">
                  <div className="flex items-center gap-1">
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
                        {data.name}
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
                        {shortenAddress(data.address)}
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
                <TableCell className="!py-1">
                  <div>
                    <span className={`text-xs font-medium`}>
                      ${data.price.amount}
                    </span>
                    <span className="flex font-medium items-end text-[10px] text-[#16C784]">
                      <ChevronUp
                        size={16}
                        stroke="false"
                        className="border-none p-0 -mb-0.5"
                        fill="#16C784"
                      />{" "}
                      <span>{data.price.change[timeframe]}%</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="!py-1">
                  <div>
                    <span className={`text-xs font-medium`}>
                      ${compactNumber(data.marketCap)}
                    </span>
                    <span className="flex font-medium items-center text-[10px] text-[#FF9631]">
                      <span>${compactNumber(data.liquidity)}</span>
                      <img
                        src="/emoji-icons/gaining-traction.svg"
                        alt="gaining-traction"
                        width={8}
                        height={8}
                      />
                    </span>
                  </div>
                </TableCell>
                <TableCell className="!py-1">
                  <div>
                    <span className={`text-xs font-medium`}>
                      ${compactNumber(data.volume.amount)}
                    </span>
                    <span className="flex font-medium items-center text-[10px] text-[#16C784]">
                      <ChevronUp
                        size={16}
                        stroke="false"
                        className="border-none p-0 -mb-0.5"
                        fill="#16C784"
                      />{" "}
                      <span>{data.volume.timeframe[timeframe]}%</span>
                      <img
                        src="/emoji-icons/gaining-traction.svg"
                        alt="gaining-traction"
                        width={8}
                        height={8}
                      />
                    </span>
                  </div>
                </TableCell>
                <TableCell className="!py-1">
                  <div className="flex flex-col items-end">
                    <span className={`text-xs font-medium`}>
                      ${compactNumber(data.holders)}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
