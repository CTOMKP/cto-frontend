"use client";

import { Input } from "./ui/input";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, ListFilter } from "lucide-react";
import { shortenAddress } from "@/utils/helper/shortenAddress";
import Link from "next/link";
import { compactNumber } from "@/utils/helper/compactNumber";
import Image from "next/image";

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

const history = [
  {
    coin: "$Rogers",
    img: '/default-trending-coin-img.png'
  },
  {
    coin: "$trump",
    img: '/default-trending-coin-img.png'
  },
  {
    coin: "$gork",
    img: '/default-trending-coin-img.png'
  }
]

export default function NavbarSearch() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
    const filters: Filter[] = ["all", "memecoins", "emojicoins"];
  
    const labels: Record<Filter, string> = {
      all: "All",
      memecoins: "Memecoins",
      emojicoins: "Emojicoins",
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(searchTerm);
  };
  return (
    <Dialog>
      <DialogTrigger>
        <div className="relative flex items-center">
          <Image
            loading="lazy"
            className="absolute left-2"
            src="/search.svg"
            alt="search"
            width={13.33}
            height={13.33}
          />
          <Input
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-[52px] w-[363px] rounded-[8px] text-base text-white placeholder:text-[#FFFFFF80] border-[0.2px] border-[#FFFFFF20] focus:!border-[0.2px] focus:!border-white focus-visible:ring-0"
            placeholder="Search Token, Contract or Users"
          />
          <span className="absolute right-2 bg-[#FFFFFF0D] text-[#FFFFFF80] rounded-[4px] flex justify-center items-center text-xs w-[39px] h-[24px]">
            Ctrl k
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-black text-sm border-[2px] p-5 border-[#86868630] text-white max-w-5xl overflow-hidden rounded-xl">
        <DialogHeader className="hidden !flex-row justify-between items-center pb-2 border-b-[0.5px] border-[#FFFFFF20]">
          <div>
            <DialogTitle className="font-bold text-white text-base">
              Search
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <form className="flex-1" onSubmit={handleSubmit}>
          <div className="relative w-full flex items-center">
            <Image
              loading="lazy"
              className="absolute left-2"
              src="/search.svg"
              alt="search"
              width={13.33}
              height={13.33}
            />
            <Input
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-12 w-full rounded-[8px] text-base text-white placeholder:text-[#FFFFFF80] border-[0.2px] border-[#FFFFFF20] focus:!border-[0.2px] focus:!border-white focus-visible:ring-0"
              placeholder="Search Token, Contract or Users"
            />
            <span className="absolute right-2 bg-[#FFFFFF0D] text-[#FFFFFF80] rounded-[4px] flex justify-center items-center text-xs w-[39px] h-[24px]">
              Ctrl k
            </span>
          </div>
        </form>
        <Button className="p-3 size-12 rounded-xl border-[0.3px] border-[#FFFFFF20]"><ListFilter size={24} color="#FFFFFF80" /></Button>
        </div>

        <div className="flex gap-2 items-center my-6">
          <span className="mr-3 text-sm text-[#FFFFFFB2]">History:</span>
          {history.map((history, index) => (
            <span className="py-1 uppercase flex items-center rounded-lg text-base font-medium text-white gap-1 px-2 bg-[#17171C]" key={index}><Image loading="lazy" className="size-4 border-[0.2px] border-[#FFFFFF] rounded-full" src={history.img} alt={history.coin} width={16} height={16} />{history.coin}</span>
          ))}
        </div>

        <div>
          <div className="flex w-fit gap-1.5 h-9 border-[0.2px] border-[#FFFFFF20] rounded-lg items-center px-1">
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
        </div>

        <Table className="w-full border-separate border-spacing-y-2">
          <TableHeader className="text-xs h-6 text-[#FFFFFF80]">
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
                  <div className="flex items-center h-full gap-1">
                    <div className="relative">
                      <Image
                        loading="lazy"
                        className="size-10 rounded-full border-[0.5px] border-white"
                        src="/homepage/trending-coins/default-coin.png"
                        alt="default-coin"
                        width={40}
                        height={40}
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
                          <Image loading="lazy" src="/x.svg" alt="x" height={8} width={8} />
                        </Link>
                        <Link href="#">
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
                        loading="lazy"
                        src="/lock.svg"
                        alt="gaining-traction"
                        width={8}
                        height={8}
                      />
                    </span>
                  </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
