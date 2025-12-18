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
import { compactNumber } from "@/utils/helper/compactNumber";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import TimeframeFilterBar, {
  Timeframe,
} from "../../../components/TimeframeFilterBar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ApiCoinItem } from "@/types/api";
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

// Helper function to create shorter address for TrendingCoins
function shortenAddressForTrending(address: string): string {
  if (!address) return "";
  if (address.length <= 8) return address;
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
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

// Skeleton component tuned to match the final table layout + sizing
const TrendingCoinsTableSkeleton = () => (
  <div className="overflow-x-auto xl:overflow-visible">
    <Table className="w-full min-w-[550px] xl:w-full">
      <TableHeader className="!text-[#FFFFFF]/50">
        <TableRow className="border-none">
          <TableHead className="!font-bold">
            <span className="hidden">Watchlist button</span>
          </TableHead>
          <TableHead className="!font-bold">Name</TableHead>
          <TableHead className="!font-bold text-center">MC/Liq</TableHead>
          <TableHead className="!font-bold text-center">Price/24%</TableHead>
          <TableHead className="!font-bold text-center">Age</TableHead>
          <TableHead className="!font-bold text-center">Risk score</TableHead>
          <TableHead className="!font-bold text-right">Holders</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRow key={index} className="border-none">
            <TableCell className="!py-1">
              <div className="flex justify-center">
                <div className="size-4 rounded-full bg-white/10 animate-pulse" />
              </div>
            </TableCell>
            <TableCell className="!py-1">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="size-7 rounded-full bg-white/10 animate-pulse" />
                  <div className="absolute bottom-0 left-0 size-[14px] rounded-full border border-[#010101] bg-white/5 animate-pulse" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-[90px] rounded bg-white/20 animate-pulse" />
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-[70px] rounded bg-white/10 animate-pulse" />
                    <div className="size-4 rounded bg-white/10 animate-pulse" />
                    <div className="size-[10px] rounded-full bg-white/10 animate-pulse" />
                    <div className="size-[10px] rounded-full bg-white/10 animate-pulse" />
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="!py-1">
              <div className="flex flex-col items-center gap-1">
                <div className="h-3 w-14 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-12 rounded bg-white/10 animate-pulse" />
              </div>
            </TableCell>
            <TableCell className="!py-1">
              <div className="flex flex-col items-center gap-1">
                <div className="h-3 w-12 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-14 rounded bg-white/10 animate-pulse" />
              </div>
            </TableCell>
            <TableCell className="!py-1">
              <div className="flex justify-center">
                <div className="h-3 w-10 rounded bg-white/10 animate-pulse" />
              </div>
            </TableCell>
            <TableCell className="!py-1">
              <div className="flex items-center justify-center gap-1">
                <div className="h-3 w-8 rounded bg-white/10 animate-pulse" />
                <div className="size-[12px] rounded-full bg-white/10 animate-pulse" />
              </div>
            </TableCell>
            <TableCell className="!py-1">
              <div className="flex flex-col items-end gap-1">
                <div className="h-3 w-12 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-8 rounded bg-white/10 animate-pulse" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);



export default function TrendingCoins({
  apiData,
  isLoading,
}: {
  apiData: ApiCoinItem[];
  isLoading: boolean;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1h");
  const router = useRouter();

  const handleRowClick = (address?: string) => {
    if (!address) return;
    router.push(`/projectProfile/${address}`);
  };

  // Function to calculate trending score based on multiple factors
  const calculateTrendingScore = (item: ApiCoinItem): number => {
    let score = 0;
    
    // 1. Age factor (newer coins get higher score)
    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    if (createdAt) {
      const ageInHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      if (ageInHours < 24) score += 50; // Very new (less than 24h)
      else if (ageInHours < 168) score += 30; // New (less than 1 week)
      else if (ageInHours < 720) score += 10; // Recent (less than 1 month)
    }
    
    // 2. Price performance (24h change)
    const change24h = Number(item.change24h ?? 0);
    if (change24h > 50) score += 40; // Excellent performance
    else if (change24h > 20) score += 25; // Good performance
    else if (change24h > 0) score += 10; // Positive performance
    else if (change24h > -10) score += 5; // Not too bad
    
    // 3. Volume factor (higher volume = more interest)
    const volume24h = Number(item.volume24h ?? item?.metadata?.market?.volume?.h24 ?? 0);
    if (volume24h > 1000000) score += 30; // High volume
    else if (volume24h > 100000) score += 20; // Medium volume
    else if (volume24h > 10000) score += 10; // Low volume
    
    // 4. Market cap factor (not too small, not too big)
    const marketCap = Number(item.marketCap ?? item?.metadata?.market?.fdv ?? 0);
    if (marketCap > 1000000 && marketCap < 100000000) score += 20; // Sweet spot
    else if (marketCap > 100000) score += 10; // Decent size
    
    // 5. Liquidity factor (higher liquidity = more stable)
    const liquidity = Number(item.liquidityUsd ?? 0);
    if (liquidity > 500000) score += 25; // High liquidity
    else if (liquidity > 100000) score += 15; // Medium liquidity
    else if (liquidity > 50000) score += 10; // Low liquidity
    
    // 6. Holders factor (more holders = more community interest)
    const holders = Number(item.holders ?? item?.metadata?.market?.holders ?? 0);
    if (holders > 10000) score += 20; // Many holders
    else if (holders > 1000) score += 10; // Decent holders
    
    // 7. Risk score factor (lower risk = better)
    const riskScore = typeof item.riskScore === "number" ? item.riskScore : (item?.metadata?.market?.riskScore ?? 0);
    if (riskScore > 70) score += 15; // Low risk
    else if (riskScore > 50) score += 10; // Medium risk
    else if (riskScore > 0) score += 5; // Some risk
    
    // 8. Community score factor
    const communityScore = typeof item.communityScore === "number" ? item.communityScore : (item?.metadata?.market?.communityScore ?? 0);
    if (communityScore > 70) score += 15; // High community score
    else if (communityScore > 50) score += 10; // Medium community score
    else if (communityScore > 0) score += 5; // Some community score
    
    return score;
  };

  // Convert API data to the format expected by the component
  const trendingData = useMemo(() => {
    console.log('TrendingCoins - apiData received:', apiData?.length || 0, 'items');
    if (!apiData || apiData.length === 0) {
      console.log('TrendingCoins - No apiData, returning empty array');
      return [];
    }
    
    // Calculate trending score for each coin
    const coinsWithScores = apiData
      .filter((item) => item.contractAddress) // Only include items with valid addresses
      .map((item) => {
        const createdAt = item.createdAt ? new Date(item.createdAt) : null;
        const ageStr = createdAt ? formatRelativeAge(createdAt) : item.age || "1h";
        
        // Calculate trending score based on multiple factors
        const trendingScore = calculateTrendingScore(item);
        
        return {
          item,
          trendingScore,
          createdAt,
          ageStr
        };
      });
    
    // Sort by trending score (highest first) and take top 6
    // If no coins have a score > 0, still show top 6 by score (even if 0)
    // This ensures we always show something if there's data
    const sortedCoins = coinsWithScores
      .sort((a, b) => {
        // Primary sort: trending score
        if (b.trendingScore !== a.trendingScore) {
          return b.trendingScore - a.trendingScore;
        }
        // Secondary sort: volume (if available)
        const aVolume = Number(a.item.volume24h ?? a.item?.metadata?.market?.volume?.h24 ?? 0);
        const bVolume = Number(b.item.volume24h ?? b.item?.metadata?.market?.volume?.h24 ?? 0);
        return bVolume - aVolume;
      })
      .slice(0, 6);
    
    console.log('TrendingCoins - Processed coins:', sortedCoins.length);
    
    return sortedCoins.map(({ item, ageStr }) => {
      
      const convertedItem = {
        name: item.name || item.symbol || "Unknown",
        age: ageStr,
        address: item.contractAddress,
        chain: item.chain,
        x: undefined,
        website: undefined,
        image: item.logoUrl || item?.metadata?.market?.logoUrl,
    mindshare: {
          mentions: 0, // Use real data from API when available
          sentiment: "neutral",
          volume: 0,
    },
    price: {
          amount: Number(item.priceUsd ?? 0),
      change: {
            "1m": 0, // Use real data from API when available
            "5m": 0,
            "1h": Number(item.change1h ?? 0),
            "5h": 0,
            "24h": Number(item.change24h ?? 0),
          },
        },
        marketCap: Number(item.marketCap ?? item?.metadata?.market?.fdv ?? 0),
        liquidity: Number(item.liquidityUsd ?? 0),
    volume: {
          amount: Number(item.volume24h ?? item?.metadata?.market?.volume?.h24 ?? 0),
      timeframe: {
            "1m": 0, // Use real data from API when available
            "5m": 0,
            "1h": 0,
            "5h": 0,
            "24h": 0,
          },
        },
        holders: Number(item.holders ?? item?.metadata?.market?.holders ?? 0),
        riskScore: typeof item.riskScore === "number" ? item.riskScore : (item?.metadata?.market?.riskScore ?? 0),
      };
      
      return convertedItem;
    });
  }, [apiData]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] w-full rounded-xl lg:flex-1">
        <Card className="border-none p-3 bg-[#010101] w-full">
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
          <CardContent className="px-0 -mt-4">
            <TrendingCoinsTableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no data available, show empty state
  if (trendingData.length === 0) {
    return (
      <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] w-full rounded-xl xl:w-auto xl:flex-1">
        <Card className="border-none p-3 bg-[#010101] w-full">
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
          <CardContent className="px-0 -mt-4">
            <div className="w-full h-[200px] flex items-center justify-center text-white/50">
              No trending data available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] w-full rounded-xl lg:flex-1">
      <Card className="border-none p-3 bg-[#010101] w-full">
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
        <CardContent className="px-0 -mt-4">
           <div className="overflow-x-auto xl:overflow-visible">
             <Table className="w-full min-w-[550px] xl:w-full">
            <TableHeader className="!text-[#FFFFFF]/50">
              <TableRow className="border-none">
                <TableHead className="!font-bold">
                    <span className="hidden">Watchlist button</span>
                </TableHead>
                <TableHead className="!font-bold">Name</TableHead>
                <TableHead className="!font-bold text-center">MC/Liq</TableHead>
                <TableHead className="!font-bold text-center">Price/24%</TableHead>
                <TableHead className="!font-bold text-center">Age</TableHead>
                <TableHead className="!font-bold text-center">Risk score</TableHead>
                <TableHead className="!font-bold text-right">Holders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trendingData.map((data, index) => (
                <TableRow
                  key={index}
                  className="border-none cursor-pointer"
                  onClick={() => handleRowClick(data.address)}
                >
                  <TableCell>
                      <div>
                        <Button 
                          className="p-0 w-fit h-fit"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add your watchlist logic here
                            console.log('Watchlist clicked for:', data.name);
                          }}
                        >
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
                  {/* name */}
                  <TableCell className="!py-1">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <FallbackImage
                          className="size-7 rounded-full border-[0.36px] border-white"
                          src={data.image}
                          alt="coin-image"
                          customStyles={{ width: '28px', height: '28px', objectFit: 'cover' }}
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
                          <span className="font-medium capitalize max-w-[80px] truncate" title={data.name}>
                            {data.name.length > 10 ? `${data.name.substring(0, 10)}...` : data.name}
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
                          <Link href="#" onClick={(e) => e.stopPropagation()}>
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
                  {/* mc/liq */}
                  <TableCell className="!py-1">
                    <div className="flex flex-col items-center">
                      <span className={`text-xs font-medium`}>
                        ${compactNumber(data.marketCap)}
                      </span>
                      <span className="flex font-medium items-center text-[10px]">
                        <span>${compactNumber(data.liquidity)}</span>
                        <Image
                          src="/lock.svg"
                          alt="gaining-traction"
                          width={8}
                          height={8}
                        />
                      </span>
                    </div>
                  </TableCell>
                  {/* Price / 24% */}
                  <TableCell className="!py-1">
                      <div className="flex flex-col items-center">
                        <span className={`font-medium text-xs`}>
                          ${data.price.amount}
                        </span>
                        <span
                          className={`flex font-medium items-center text-[10px] ${
                            data.price.change["24h"] < 0
                              ? "text-[#C71624]"
                              : "text-[#16C784]"
                          }`}
                        >
                          {data.price.change["24h"] < 0 ? (
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
                            {data.price.change["24h"]}%
                          </span>
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
                        src={`${
                          data.riskScore >= 70
                            ? "/risk-score/good.svg"
                            : data.riskScore >= 50
                            ? "/risk-score/average.svg"
                            : "/risk-score/bad.svg"
                        }`}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

