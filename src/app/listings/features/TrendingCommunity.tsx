"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiCoinItem } from "@/types/api";
import { useRouter } from "next/navigation";
import FallbackImage from "@/components/FallbackImage";

// Helper function to format relative age
function formatRelativeAge(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}hr`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

// Helper function to create shorter address for TrendingCommunity
function shortenAddressForTrending(address: string): string {
  if (!address) return "";
  if (address.length <= 6) return address;
  return `${address.substring(0, 3)}...${address.substring(address.length - 3)}`;
}

// Helper function to get chain image path
function getChainImage(chain: string): string {
  const chainMap: Record<string, string> = {
    'solana': '/listings-chains/solana.png',
    'ethereum': '/listings-chains/ethereum.png',
    'bsc': '/listings-chains/bnb.png',
    'sui': '/listings-chains/sui.jpg',
    'base': '/listings-chains/base.png',
    'aptos': '/listings-chains/aptos.png',
    'near': '/listings-chains/near.png',
    'osmosis': '/listings-chains/osmosis.jpg',
  };
  return chainMap[chain.toLowerCase()] || '/listings-chains/solana.png';
}

const TrendingCommunityTableSkeleton = () => (
  <div className="overflow-x-auto xl:overflow-visible">
    <Table className="w-full min-w-[322px] lg:w-full">
      <TableHeader className="!text-[#FFFFFF]/50">
        <TableRow className="border-none">
          <TableHead className="!font-bold">Name</TableHead>
          <TableHead className="!font-bold">
            <span className="flex justify-end items-center gap-1">
              Community score
              <div className="size-3 rounded-full bg-white/10 animate-pulse" />
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRow key={index} className="border-none">
            <TableCell className="!py-1">
              <div className="flex items-center gap-1">
                <div className="relative">
                  <div className="size-7 rounded-full bg-white/10 animate-pulse" />
                  <div className="absolute bottom-0 left-0 size-[14px] rounded-full border border-[#010101] bg-white/10 animate-pulse" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-[70px] rounded bg-white/20 animate-pulse" />
                    <div className="size-4 rounded bg-white/10 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
                    <div className="size-[10px] rounded-full bg-white/10 animate-pulse" />
                    <div className="size-[10px] rounded-full bg-white/10 animate-pulse" />
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="!py-1">
              <div className="flex items-center justify-end gap-1">
                <div className="size-4 rounded-full bg-white/10 animate-pulse" />
                <div className="h-3 w-12 rounded bg-white/10 animate-pulse" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default function TrendingCommunity({
  apiData,
  isLoading,
}: {
  apiData: ApiCoinItem[];
  isLoading: boolean;
}) {
  const router = useRouter();

  const handleRowClick = (address?: string) => {
    if (!address) return;
    router.push(`/projectProfile/${address}`);
  };

  // Convert API data to the format expected by the component
  const communityData = useMemo(() => {
    console.log('TrendingCommunity - apiData received:', apiData?.length || 0, 'items');
    if (!apiData || apiData.length === 0) {
      console.log('TrendingCommunity - No apiData, returning empty array');
      return [];
    }
    
    // Calculate community score for each coin
    // Since community scores are "Coming Soon" and mostly 0, we'll show top coins by other metrics
    const coinsWithCommunityScore = apiData
      .filter((item) => item.contractAddress) // Only include items with valid addresses
      .map((item) => {
        const communityScore = typeof item.communityScore === "number" 
          ? item.communityScore 
          : (item?.metadata?.market?.communityScore ?? 0);
        
        // If community score is 0, use risk score as a fallback for ranking
        // This ensures we still show coins even when community scores aren't available
        const fallbackScore = communityScore > 0 ? communityScore : (typeof item.riskScore === "number" ? item.riskScore : 0);
        
        return {
          item,
          communityScore,
          fallbackScore
        };
      });
    
    // Sort by community score first, then by fallback score, and take top 6
    // Don't filter out coins - show top 6 even if all scores are 0
    // This ensures we always show something if there's data
    const sortedCoins = coinsWithCommunityScore
      .sort((a, b) => {
        // Primary sort: community score
        if (a.communityScore !== b.communityScore) {
          return b.communityScore - a.communityScore;
        }
        // Secondary sort: fallback score (risk score)
        if (b.fallbackScore !== a.fallbackScore) {
          return b.fallbackScore - a.fallbackScore;
        }
        // Tertiary sort: volume (if available)
        const aVolume = Number(a.item.volume24h ?? a.item?.metadata?.market?.volume?.h24 ?? 0);
        const bVolume = Number(b.item.volume24h ?? b.item?.metadata?.market?.volume?.h24 ?? 0);
        return bVolume - aVolume;
      })
      .slice(0, 6);
    
    console.log('TrendingCommunity - Processed coins:', sortedCoins.length);
    
    return sortedCoins.map(({ item, communityScore }) => {
      const createdAt = item.createdAt ? new Date(item.createdAt) : null;
      const ageStr = createdAt ? formatRelativeAge(createdAt) : item.age || "1h";
      
      return {
        name: item.name || item.symbol || "Unknown",
        age: ageStr,
        address: item.contractAddress,
        chain: item.chain,
        image: item.logoUrl || item?.metadata?.market?.logoUrl,
        // Show "Coming Soon" for community score if it's 0, otherwise show the actual score
        communityScore: communityScore > 0 ? communityScore : 0
      };
    });
  }, [apiData]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] w-full rounded-xl lg:w-auto lg:flex-1">
        <Card className="border-none p-3 bg-[#010101] w-full">
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
            <TrendingCommunityTableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no data available, show empty state
  if (communityData.length === 0) {
    return (
      <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] w-full rounded-xl xl:w-auto xl:flex-1">
        <Card className="border-none p-3 bg-[#010101] w-full">
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
            <div className="w-full h-[200px] flex items-center justify-center text-white/50">
              No community data available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] w-full rounded-xl xl:w-auto xl:flex-1">
      <Card className="border-none p-3 bg-[#010101] w-full">
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
          <div className="overflow-x-auto xl:overflow-visible">
            <Table className="w-full min-w-[322px] lg:w-full">
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
              {communityData.map((data, index) => (
                <TableRow
                  key={index}
                  className="border-none cursor-pointer"
                  onClick={() => handleRowClick(data.address)}
                >
                  <TableCell className="!py-1">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <FallbackImage
                          className="size-7 rounded-full border-[0.36px] border-white object-cover"
                          src={data.image}
                          alt="coin-image"
                          width={28}
                          height={28}
                        />
                        {/* Chain image - using actual chain data */}
                        {data.chain && (
                          <Image
                            className="absolute bottom-0 left-0 size-[14px] rounded-full"
                            src={getChainImage(data.chain)}
                            alt={`${data.chain}-chain`}
                            width={14}
                            height={14}
                          />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium capitalize max-w-[60px] truncate" title={data.name}>
                            {data.name.length > 8 ? `${data.name.substring(0, 8)}...` : data.name}
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
                          <span className="text-[#FFFFFF]/50 text-xs uppercase" title={data.address}>
                            {shortenAddressForTrending(data.address)}
                          </span>
                          <Button
                            className="p-0 h-fit w-fit text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (data.address) navigator.clipboard.writeText(data.address);
                            }}
                          >
                            <Image
                              src="/copy.svg"
                              alt="copy"
                              className="text-white fill-white"
                              width={7.85}
                              height={8.38}
                            />
                          </Button>
                          <Link href="#" onClick={(e) => e.stopPropagation()}>
                            <Image loading="lazy" src="/x.svg" alt="x" height={8} width={8} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="!py-1">
                    <div className="flex items-center justify-end gap-1">
                      {/* Always show 0% with bad-red gauge (community score not calculated yet) */}
                      <Image
                        src="/communitry-score-icons/bad-red.svg"
                        alt="community-score"
                        width={16}
                        height={16}
                      />
                      <p className="text-[#FFFFFF80]">0%</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
