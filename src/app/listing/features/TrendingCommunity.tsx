import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/utils/helper/shortenAddress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    communityScore: 0.7,
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
    communityScore: 0.7,
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
    communityScore: 0.7,
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
    communityScore: 0.7,
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
    communityScore: 0.7,
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
    communityScore: 0.7,
  },
];

export default function TrendingCommunity() {
  return (
    <div className="bg-gradient-to-r from-pink-500 to-yellow-400 p-[0.7px] w-full rounded-xl">
      <Card className="border-none  p-3 bg-[#010101]">
        <CardHeader className="px-0">
          <CardTitle className="flex items-center gap-1 text-base font-bold">
            Community trending{" "}
            <Image
              className="mt-0.5"
              src="/info.svg"
              alt="info"
              width={13}
              height={13}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 -mt-4">
          <Table>
            <TableHeader className="!text-[#FFFFFF]/50">
              <TableRow className="border-none">
                <TableHead className="!font-bold">Name</TableHead>
                <TableHead className="!font-bold">
                  <span className="flex justify-end items-center gap-1">
                    Community score
                  <Image
                    className="mt-0.5"
                    src="/info.svg"
                    alt="info"
                    width={11}
                    height={11}
                  />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((data, index) => (
                <TableRow key={index} className="border-none">
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
                  <TableCell className="!py-1">
                    <div className="flex items-center justify-end gap-1">
                      <Image
                        src="/communitry-score-icons/bad-red.svg"
                        alt="bad-red"
                        width={16}
                        height={16}
                      />{" "}
                      <p className="text-[#FFFFFF80]">{data.communityScore}%</p>
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
