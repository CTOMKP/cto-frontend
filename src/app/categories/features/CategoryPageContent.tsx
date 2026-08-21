"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FilterButton from "@/components/FilterButton";
import NetworkFilter, { Network } from "@/components/NetworkFilter";
import ListingTableHeader from "@/app/listings/features/ListingTableHeader";
import ListingTableRow from "@/app/listings/features/ListingTableRow";
import dynamic from "next/dynamic";
import type { ApiCoinItem } from "@/types/api";

const TokenSwapCard = dynamic(() => import("@/components/TokenSwapCard"), {
  ssr: false,
});
import type { MockLikeCoin, SortField, SortDirection } from "@/app/listings/features/types/listing";
import { buildProjectHref } from "@/lib/utils/slugify";
import { CATEGORY_MOCK_LISTINGS } from "./categoryMockData";

type CategoryPageContentProps = {
  categoryName: string;
};

export default function CategoryPageContent({ categoryName }: CategoryPageContentProps) {
  const router = useRouter();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapCoin, setSwapCoin] = useState<MockLikeCoin | null>(null);
  const [filteredMockItems, setFilteredMockItems] = useState<ApiCoinItem[]>([]);

  const rows = useMemo(() => {
    let items = [...CATEGORY_MOCK_LISTINGS];
    if (selectedNetwork) {
      items = items.filter(
        (coin) => (coin.chain || "").toLowerCase() === selectedNetwork,
      );
    }
    return items;
  }, [selectedNetwork]);

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = "asc";
    if (sortField === field) {
      if (sortDirection === "asc") newDirection = "desc";
      else if (sortDirection === "desc") newDirection = null;
    }
    setSortField(newDirection ? field : null);
    setSortDirection(newDirection);
  };

  const handleProjectClick = (
    projectName: string,
    projectAddress: string,
    projectChain?: string,
  ) => {
    router.push(
      buildProjectHref({
        name: projectName,
        address: projectAddress,
        chain: projectChain,
      }),
    );
  };

  const handleBuyClick = (coin: MockLikeCoin) => {
    setSwapCoin(coin);
    setSwapOpen(true);
  };

  const handleFilterChange = (_filtered: ApiCoinItem[]) => {
    setFilteredMockItems(_filtered);
  };

  return (
    <div className="text-white pb-16">
      {/* Hero banner */}
      <div className="relative w-[87%] mt-[54px] mx-auto h-[220px] sm:h-[280px] lg:h-[372px] overflow-hidden">
        <Image
          src="/category-default.png"
          alt={`${categoryName} category`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="w-[87%] mx-auto">
        {/* Title + toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold">{categoryName}</h1>

          <div className="flex flex-wrap items-center gap-2">
            <FilterButton
              items={filteredMockItems}
              onFilterChange={handleFilterChange}
            />
            <div className="relative flex items-center">
              <Input
                className="border-[0.2px] pl-7 w-[200px] sm:w-[240px] placeholder:font-medium border-[#FFFFFF20] text-white placeholder:text-[#FFFFFF80] focus:!border-[0.2px] focus:!border-white focus-visible:ring-0 h-9"
                placeholder="Ask Baws anything"
              />
              <Search size={16} color="#FFFFFF50" className="absolute left-2" />
            </div>
            <NetworkFilter
              selectedNetwork={selectedNetwork}
              onChange={setSelectedNetwork}
            />
          </div>
        </div>

        <div className="h-px w-full bg-[#FF007510] mb-4" />

        {/* Listings table — same structure as /listings */}
        <Card className="w-full p-3 border-none text-white bg-transparent">
          <CardHeader className="hidden px-0" />
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-separate border-spacing-y-2">
                <ListingTableHeader
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <tbody>
                  {rows.map((coin, index) => (
                    <ListingTableRow
                      key={`${coin.address}-${index}`}
                      coin={coin}
                      onProjectClick={handleProjectClick}
                      onBuyClick={handleBuyClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Link
          href="/categories"
          className="inline-block mt-8 text-sm text-white/60 hover:text-white"
        >
          ← Back to Discovery Hub
        </Link>
      </div>

      <TokenSwapCard
        open={swapOpen}
        onOpenChange={setSwapOpen}
        hideFloatingTrigger
        pairPreview={
          swapCoin
            ? {
                fromSymbol: (swapCoin.name || "TOKEN").toUpperCase(),
                fromImage: swapCoin.image || null,
                toSymbol: "USDC",
                toImage: null,
              }
            : null
        }
      />
    </div>
  );
}
