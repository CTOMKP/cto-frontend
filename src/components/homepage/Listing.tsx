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
import ListingsCategoryFilter, { Category } from "../ListingsCategoryFilter";
import ListingEngagement from "./ListingEngagement";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { mockData } from "@/lib/mockData";

const images = [
  '/listings-chains/aptos.png',
  '/listings-chains/ethereum.png',
  '/listings-chains/solana.png',
  '/listings-chains/bsc.png',
  '/listings-chains/matic.png',
  '/listings-chains/optimism.png',
  '/listings-chains/monad.png',
]

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
      <div className="h-px w-full bg-[#FF007510] mt-7 mb-4.5"></div>
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

            <CardAction>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                      <Input className="border-[0.2px] pl-7 border-[#FFFFFF20] text-white placeholder:text-[#FFFFFF80] focus:!border-[0.2px] focus:!border-white focus-visible:ring-0" placeholder="Ask Baws anything" />
                      <img className="absolute size-4 rounded-full border-[0.3px] border-white left-2" src="/cto-logo-small.png" alt="cto-logo" />
                      <Button className="absolute right-2.5 p-0"><img src="/send.svg" alt="send" /></Button>
                </div>

                  <Select
                onValueChange={(value) => console.log("Selected:", value)}
              >
                <SelectTrigger className="w-38 h-10 rounded-lg border-[0.2px] border-[#FFFFFF20]">
                  <SelectValue />
                  <div className="flex gap-1">
                    {images.map((src, i) => (
                      <div
                        key={i}
                        className="size-[24px] -m-2"
                      >
                        <img
                          src={src}
                          alt={`img-${i}`}
                          className="w-full h-full rounded-full border-[0.3px] border-[#FFFFFF]"
                        />
                      </div>
                    ))}
                  </div>
                </SelectTrigger>
                <SelectContent onChange={(e) => console.log("changed")} className="bg-[#010101] text-white border-[0.2px] border-[#FFFFFF20]">
                  <SelectGroup>
                    <SelectLabel className="text-[#FFFFFF20]">Fruits</SelectLabel>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              </div>
            </CardAction>
          </CardHeader>

          <CardContent className="px-0 h-[690px] overflow-auto">
            <Table className="w-full border-separate border-spacing-y-2">
              <TableHeader className="text-xs text-[#FFFFFF80]">
                <TableRow className="border-none">
                  <TableHead className="!font-bold">
                    <span className="hidden">Watchlist button</span>
                  </TableHead>
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
                  <TableHead className="!font-bold text-center">
                    Degen Audit
                  </TableHead>
                  <TableHead>
                    <span className="hidden">Listing Engagement</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((coin, i) => (
                  <TableRow
                    key={i}
                    className="border-none bg-[#FFFFFF05] rounded-lg h-13"
                  >
                    <TableCell>
                      <div>
                        <Button className="p-1">
                          <img
                            src="/white-watchlist.svg"
                            alt="watchlist"
                            className="bg-transparent"
                          />
                        </Button>
                      </div>
                    </TableCell>
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
                        <span
                          className={`text-xs font-medium w-full text-right`}
                        >
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
                    <TableCell className="text-xs font-medium">
                      {coin.age}
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
                    <TableCell
                      className={`text-[10px] ${
                        coin.price.change["1m"] < 0
                          ? "text-[#C71624]"
                          : "text-[#16C784]"
                      }`}
                    >
                      <span className="flex font-medium items-end text-[10px]">
                        {coin.price.change["1m"] < 0 ? (
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
                    <TableCell
                      className={`text-[10px] ${
                        coin.price.change["5m"] < 0
                          ? "text-[#C71624]"
                          : "text-[#16C784]"
                      }`}
                    >
                      <span className="flex font-medium items-end text-[10px]">
                        {coin.price.change["5m"] < 0 ? (
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
                          {coin.price.change["5m"]}%
                        </span>
                      </span>
                    </TableCell>

                    {/* 1h% */}
                    <TableCell
                      className={`text-[10px] ${
                        coin.price.change["1h"] < 0
                          ? "text-[#C71624]"
                          : "text-[#16C784]"
                      }`}
                    >
                      <span className="flex font-medium items-end text-[10px]">
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
                          {coin.price.change["1h"]}%
                        </span>
                      </span>
                    </TableCell>

                    {/* Community */}
                    <TableCell className="text-[10px] text-center">
                      <div className="flex justify-center gap-1">
                        <img
                          src="/communitry-score-icons/bad-red.svg"
                          alt="bad-red"
                        />{" "}
                        <span>{coin.communityScore}</span>
                      </div>
                    </TableCell>

                    {/* Audit */}
                    <TableCell className="text-[10px] text-right">
                      <span
                        className={`flex items-center justify-center gap-1 text-right`}
                      >
                        {coin.degenAudit}/3
                        <span>
                          <img
                            src={`${
                              coin.degenAudit === 3
                                ? "/degen-audit/3.svg"
                                : coin.degenAudit === 2
                                ? "/degen-audit/2.svg"
                                : coin.degenAudit === 1
                                ? "/degen-audit/1.svg"
                                : "/degen-audit/0.svg"
                            }`}
                            alt=""
                          />
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <ListingEngagement />
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
