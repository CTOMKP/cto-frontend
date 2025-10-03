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
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ListingsCategoryFilter, { Category } from "../../../components/ListingsCategoryFilter";
import ListingEngagement from "./ListingEngagement";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "../../../components/ui/input";
import { mockData } from "@/lib/mockData";
import FilterButton from "../../../components/FilterButton";

const networks = [
  {
    name: "Aptos",
    src: "/listings-chains/aptos.png",
  },
  // {
  //   name: "Ethereum",
  //   src: "/listings-chains/ethereum.png",
  // },
  {
    name: "Solana",
    src: "/listings-chains/solana.png",
  },
  {
    name: "BNB",
    src: "/listings-chains/bnb.png",
  },
  {
    name: "Movement",
    src: "/listings-chains/movement.png",
  },
  {
    name: "Base",
    src: "/listings-chains/base.png",
  },
  {
    name: "Monad",
    src: "/listings-chains/monad.png",
  },
];

export default function TopListings() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("new");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("aptos");
  const [networkDialogueOpen, setNetworkDialogueOpen] = useState(false);

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

  const handleProjectClick = (projectAddress: string) => {
    router.push(`/projectProfile/${projectAddress}`);
  };

  return (
    <div>
      <div className="h-px w-full bg-[#FF007510] mt-7 mb-4.5"></div>
      <div className="w-[87%] mx-auto">
        <Card className="w-full p-3 border-none border-[#FF007510] text-white">
          <CardHeader className="flex justify-between items-center px-0">
            <CardTitle className="hidden">
              <Image
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
              <Image
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
                <FilterButton />
                <div className="relative flex items-center">
                  <Input
                    className="border-[0.2px] pl-7 border-[#FFFFFF20] text-white placeholder:text-[#FFFFFF80] focus:!border-[0.2px] focus:!border-white focus-visible:ring-0"
                    placeholder="Ask Baws anything"
                  />
                  <Image
                    className="absolute size-4 rounded-full border-[0.3px] border-white left-2"
                    src="/cto-logo-small.png"
                    alt="cto-logo"
                    width={16}
                    height={16}
                  />
                  <Button className="absolute right-2.5 p-0">
                    <Image src="/send.svg" alt="send" width={16} height={16} />
                  </Button>
                </div>

                <Select
                  defaultOpen={networkDialogueOpen}
                  onOpenChange={(open) => setNetworkDialogueOpen(open)}
                  defaultValue={selectedNetwork}
                  onValueChange={(value) => setSelectedNetwork(value)}
                >
                  <SelectTrigger className="w-38 h-10 rounded-lg border-[0.2px] border-[#FFFFFF20]">
                    {/* <SelectValue /> */}
                    <div className="flex gap-1 ml-1">
                      {networks.map((network, index) => (
                        <div key={index} className="size-[24px] -m-1.5">
                          <Image
                            src={network.src}
                            alt={`${network.name}-img`}
                            className="w-full h-full rounded-full border-[0.3px] border-[#FFFFFF]"
                            width={24}
                            height={24}
                          />
                        </div>
                      ))}
                    </div>
                  </SelectTrigger>
                  <SelectContent
                    align="end"
                    // onChange={(e) => console.log("changed")}
                    className="bg-[#010101] text-white border-[0.2px] p-4 border-[#FFFFFF20]"
                  >
                    <div></div>
                    <div className="pb-2 mb-4 border-b-[0.5px] border-[#FFFFFF20]">
                      <span className="text-white font-bold">Network</span>
                    </div>
                    <SelectGroup className="grid grid-cols-2 gap-2.5">
                      {networks.map((network, index) => (
                        <SelectItem
                          className="p-2 rounded-lg border-[0.2px] border-[#FFFFFF20] w-[238px] flex items-center relative"
                          key={index}
                          value={network.name.toLowerCase()}
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              className="size-6 rounded-full border-[0.3px] border-[#FFFFFF]"
                              src={network.src}
                              alt={`${network.name}-img`}
                              width={24}
                              height={24}
                            />
                            {network.name}
                          </div>{" "}
                          {networkDialogueOpen && (
                            <Image
                              className="absolute right-2"
                              src={
                                selectedNetwork === network.name.toLowerCase()
                                  ? "/eye-open.svg"
                                  : "/eye-closed.svg"
                              }
                              alt={
                                selectedNetwork === network.name.toLowerCase()
                                  ? "eye-open"
                                  : "eye-closed"
                              }
                              width={16}
                              height={16}
                            />
                          )}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardAction>
          </CardHeader>

          <CardContent className="px-0 h-[690px] overflow-auto hide-scrollbar">
            <Table className="w-full border-separate border-spacing-y-2">
              <TableHeader className="!text-[#FFFFFF]/50">
                <TableRow className="border-none">
                  <TableHead className="!font-bold">
                    <span className="hidden">Watchlist button</span>
                  </TableHead>
                  <TableHead className="!font-bold">Name</TableHead>
                  <TableHead className="!font-bold text-center">MC / Liq</TableHead>
                  <TableHead className="!font-bold text-center">Holders</TableHead>
                  <TableHead className="!font-bold text-center">Age</TableHead>
                  <TableHead className="!font-bold text-center">Price / 24%</TableHead>
                  <TableHead className="!font-bold text-center">1m%</TableHead>
                  <TableHead className="!font-bold text-center">5m%</TableHead>
                  <TableHead className="!font-bold text-center">1h%</TableHead>
                  <TableHead className="!font-bold flex justify-center">
                    <span className="flex items-center gap-1">
                      Community score
                      <Image
                        className="mt-0.5"
                        src="/info.svg"
                        alt="info"
                        width={13}
                        height={13}
                      />
                    </span>
                  </TableHead>
                  <TableHead className="!font-bold text-center">
                    Risk score
                  </TableHead>
                  <TableHead>
                    <span className="hidden">Listing Engagement</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((coin, index) => (
                  <TableRow
                    key={index}
                    className="border-none bg-[#FFFFFF]/5 h-13 hover:!bg-[#FFFFFF1A] cursor-pointer"
                    onClick={() => handleProjectClick(coin.address)}
                  >
                    <TableCell>
                      <div>
                        <Button className="p-1">
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
                              {coin.name}
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
                            <Button className="p-0 h-fit w-fit">
                              <Image
                                src="/copy.svg"
                                alt="copy"
                                width={7.85}
                                height={8.38}
                              />
                            </Button>
                            <Link href="#">
                              <Image
                                src="/x.svg"
                                alt="x"
                                height={8}
                                width={8}
                              />
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


                        <Button className="bg-[#FF4A15]/21 p-0 h-fit px-1 py-1 ml-5 rounded-[5.5px] font-bold">
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
                          ${compactNumber(coin.holders)}
                        </span>
                      </div>
                      </div>
                    </TableCell>

                    {/* Age */}
                    <TableCell className="font-medium text-center">{coin.age}</TableCell>

                    {/* Price / 24% */}
                    <TableCell className="flex justify-center">
                      <div>
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
                    <TableCell>
                      <span className={`flex font-medium items-center justify-center ${
                        coin.price.change["5m"] < 0
                          ? "text-[#C71624]"
                          : "text-[#16C784]"
                      }`}>
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
                    <TableCell>
                      <span className={`flex font-medium items-center justify-center ${
                        coin.price.change["1h"] < 0
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
                          {coin.price.change["1h"]}%
                        </span>
                      </span>
                    </TableCell>

                    {/* Community */}
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Image
                          src="/communitry-score-icons/bad-red.svg"
                          alt="bad-red"
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
