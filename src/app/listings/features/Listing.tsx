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
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import ListingsCategoryFilter, { Category } from "../../../components/ListingsCategoryFilter";
import MemeCategoryFilter, { MemeCategory } from "../../../components/MemeCategoryFilter";
import NetworkFilter, { Network } from "../../../components/NetworkFilter";
import ListingEngagement from "./ListingEngagement";
import { Input } from "../../../components/ui/input";
// Using live data instead of mockData
import FilterButton from "../../../components/FilterButton";
import { ApiCoinItem, ApiListingResponse } from "@/types/api";

// Types for sorting
type SortField = 'name' | 'marketCap' | 'liquidity' | 'holders' | 'age' | 'price' | 'change24h' | 'change1m' | 'change5m' | 'change1h' | 'communityScore' | 'degenAudit';
type SortDirection = 'asc' | 'desc' | null;

// Skeleton rows matching the table layout
const ListingTableSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, index) => (
      <TableRow key={index} className="border-none bg-[#FFFFFF]/5 h-13">
        <TableCell>
          <div className="flex justify-center">
            <div className="size-6 rounded-full bg-white/10 animate-pulse" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="size-7 rounded-full bg-white/10 animate-pulse" />
                <div className="absolute bottom-0 left-0 size-[14px] rounded-full border border-[#010101] bg-white/10 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-3 w-24 rounded bg-white/20 animate-pulse" />
                <div className="flex items-center gap-1">
                  <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                  <div className="size-4 rounded bg-white/10 animate-pulse" />
                  <div className="size-[10px] rounded-full bg-white/10 animate-pulse" />
                  <div className="size-[10px] rounded-full bg-white/10 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="h-6 w-12 rounded bg-[#FF4A15]/30 animate-pulse" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-14 rounded bg-white/10 animate-pulse" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex justify-center">
            <div className="h-3 w-12 rounded bg-white/10 animate-pulse" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex justify-center">
            <div className="h-3 w-10 rounded bg-white/10 animate-pulse" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 w-14 rounded bg-white/10 animate-pulse" />
            <div className="flex items-center gap-1">
              <div className="size-3 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-10 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-center gap-1">
            <div className="size-3 rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-10 rounded bg-white/10 animate-pulse" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-center gap-1">
            <div className="size-3 rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-10 rounded bg-white/10 animate-pulse" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-center gap-1">
            <div className="size-3 rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-10 rounded bg-white/10 animate-pulse" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex justify-center items-center gap-2">
            <div className="size-4 rounded-full bg-white/10 animate-pulse" />
            <div className="h-3 w-10 rounded bg-white/10 animate-pulse" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex justify-center items-center gap-2">
            <div className="h-3 w-8 rounded bg-white/10 animate-pulse" />
            <div className="size-3 rounded-full bg-white/10 animate-pulse" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex justify-center">
            <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
          </div>
        </TableCell>
      </TableRow>
    ))}
  </>
);


type MockLikeCoin = {
  name: string;
  whale: boolean;
  age: string | null;
  address: string;
  x?: string;
  website?: string;
  image?: string;
  chain?: string;
  category?: string;
  communityScore: number;
  degenAudit: number; // not in API; filled with 0 to keep UI stable
  mindshare?: { mentions: number; sentiment: string; volume: number };
  price: {
    amount: number;
    change: { "1m": number; "5m": number; "1h": number; "5h": number; "24h": number };
  };
  marketCap: number;
  liquidity: number;
  volume: { amount: number; timeframe?: number };
  holders: number;
};

export default function TopListings() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("new");
  const [memeCategory, setMemeCategory] = useState<MemeCategory>("all");
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [page, setPage] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [limit] = useState<number>(20);
  const [liveItems, setLiveItems] = useState<MockLikeCoin[]>([]);
  const [rawApiItems, setRawApiItems] = useState<ApiCoinItem[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const totalPages = useMemo(() => (total && limit ? Math.max(1, Math.ceil(total / limit)) : 1), [total, limit]);

  // Reset page to 1 when network changes
  useEffect(() => {
    setPage(1);
  }, [selectedNetwork]);

  // Fetch data for Listing component (separate from highlights)
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      const base =
        process.env.NEXT_INTERNAL_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://github.useguidr.com";
      
      // Build chain parameter from selected network
      let url;
      if (selectedNetwork === null) {
        // No network selected - fetch from all chains
        url = `${base}/api/listing/listings?category=MEME&sort=updatedAt%3Adesc&page=${page}&limit=${limit}`;
      } else {
        // Specific network selected - fetch from that chain only
        const chainParam = selectedNetwork.toUpperCase();
        url = `${base}/api/listing/listings?chain=${chainParam}&category=MEME&sort=updatedAt%3Adesc&page=${page}&limit=${limit}`;
      }
      
      try {
        const res = await fetch(url);
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const data: ApiListingResponse = await res.json();

        console.log('Listing API Response:', data);
        setTotal(data.total || 0);
        setRawApiItems(data.items || []);
        
        const mapped: MockLikeCoin[] = (data.items || []).map((it) => {
          const createdAt = it.createdAt ? new Date(it.createdAt) : null;
          const ageStr = createdAt ? formatRelativeAge(createdAt) : it.age || null;
          return {
            name: it.name || it.symbol || "",
            whale: false,
            age: ageStr,
            address: it.contractAddress,
            x: undefined,
            website: undefined,
            image: it.logoUrl || it?.metadata?.market?.logoUrl,
            chain: it.chain || "solana",
            category: it.category || "meme",
            communityScore: typeof it.communityScore === "number" ? it.communityScore : (it?.metadata?.market?.communityScore ?? 0),
            degenAudit: typeof it.riskScore === "number" ? it.riskScore : (it?.metadata?.market?.riskScore ?? 0),
            mindshare: undefined,
            price: {
              amount: Number(it.priceUsd ?? 0),
              change: {
                "1m": 0,
                "5m": 0,
                "1h": Number(it.change1h ?? 0),
                "5h": 0,
                "24h": Number(it.change24h ?? 0),
              },
            },
            marketCap: Number(it.marketCap ?? it?.metadata?.market?.fdv ?? 0),
            liquidity: Number(it.liquidityUsd ?? 0),
            volume: { amount: Number(it.volume24h ?? it?.metadata?.market?.volume?.h24 ?? 0) },
            holders: Number(it.holders ?? it?.metadata?.market?.holders ?? 0),
          } as MockLikeCoin;
        });
        console.log('Listing Mapped items:', mapped);
        setLiveItems(mapped);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
        setIsLoading(false);
      }
    };
    fetchListings();
  }, [page, limit, selectedNetwork]);

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

  // Sorting function
  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc';
    
    if (sortField === field) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }

    setSortField(newDirection ? field : null);
    setSortDirection(newDirection);
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col">
          <ChevronUp className="w-3 h-3 text-gray-400" />
          <ChevronDown className="w-3 h-3 text-gray-400 -mt-1" />
        </div>
      );
    }
    
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-3 h-3 text-white" />;
    } else if (sortDirection === 'desc') {
      return <ChevronDown className="w-3 h-3 text-white" />;
    }
    
    return null;
  };

  const listings = useMemo(() => {
    const items = liveItems;
    console.log('Current liveItems:', items);
    console.log('Current category:', category);
    console.log('Current memeCategory:', memeCategory);
    
    let filteredItems = items;
    
    // Apply category filtering
    if (category === 'gainers') {
      filteredItems = items.filter((coin) => coin.price.change["24h"] > 0);
    } else if (category === 'losers') {
      filteredItems = items.filter((coin) => coin.price.change["24h"] < 0);
    }
    
    // Apply meme category filtering
    if (memeCategory === 'meme') {
      filteredItems = filteredItems.filter((coin) => {
        // Use category from API if available, otherwise fall back to name matching
        if (coin.category) {
          return coin.category.toLowerCase() === 'meme';
        }
        // Fallback to name matching for backward compatibility
        const name = coin.name.toLowerCase();
        return name.includes('meme') || name.includes('dog') || name.includes('cat') || 
               name.includes('pepe') || name.includes('doge') || name.includes('shib');
      });
    } else if (memeCategory === 'emoji') {
      filteredItems = filteredItems.filter((coin) => {
        // Use category from API if available, otherwise fall back to name matching
        if (coin.category) {
          return coin.category.toLowerCase() === 'emoji';
        }
        // Fallback to name matching for backward compatibility
        const name = coin.name.toLowerCase();
        return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(coin.name) ||
               name.includes('emoji') || name.includes('smile') || name.includes('happy');
      });
    }
    // If memeCategory is 'all', show all items without additional filtering
    
    // Apply sorting if active
    if (sortField && sortDirection) {
      filteredItems = [...filteredItems].sort((a, b) => {
        let aValue: number | string, bValue: number | string;
        
        switch (sortField) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'marketCap':
            aValue = a.marketCap;
            bValue = b.marketCap;
            break;
          case 'liquidity':
            aValue = a.liquidity;
            bValue = b.liquidity;
            break;
          case 'holders':
            aValue = a.holders;
            bValue = b.holders;
            break;
          case 'age':
            // Convert age to minutes for sorting
            const aAge = a.age ? parseInt(a.age.replace(/[^\d]/g, '')) : 0;
            const bAge = b.age ? parseInt(b.age.replace(/[^\d]/g, '')) : 0;
            aValue = aAge;
            bValue = bAge;
            break;
          case 'price':
            aValue = a.price.amount;
            bValue = b.price.amount;
            break;
          case 'change24h':
            aValue = a.price.change["24h"];
            bValue = b.price.change["24h"];
            break;
          case 'change1m':
            aValue = a.price.change["1m"];
            bValue = b.price.change["1m"];
            break;
          case 'change5m':
            aValue = a.price.change["5m"];
            bValue = b.price.change["5m"];
            break;
          case 'change1h':
            aValue = a.price.change["1h"];
            bValue = b.price.change["1h"];
            break;
          case 'communityScore':
            aValue = a.communityScore;
            bValue = b.communityScore;
            break;
          case 'degenAudit':
            aValue = a.degenAudit;
            bValue = b.degenAudit;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    const result = {
      gainers: category === 'gainers' ? filteredItems : items.filter((coin) => coin.price.change["24h"] > 0).sort((a, b) => b.price.change["24h"] - a.price.change["24h"]),
      losers: category === 'losers' ? filteredItems : items.filter((coin) => coin.price.change["24h"] < 0).sort((a, b) => a.price.change["24h"] - b.price.change["24h"]),
      new: category === 'new' ? filteredItems : items,
    };
    
    console.log('Filtered listings:', result);
    return result;
  }, [liveItems, category, memeCategory, sortField, sortDirection]);

  const filteredData = listings[category];
  console.log('Final filteredData for category', category, ':', filteredData);

  const handleProjectClick = (projectAddress: string) => {
    router.push(`/projectProfile/${projectAddress}`);
  };

  const handleFilterChange = (filteredItems: ApiCoinItem[]) => {
    // Convert filtered API items to MockLikeCoin format for display
    const mapped: MockLikeCoin[] = filteredItems.map((it) => {
      const createdAt = it.createdAt ? new Date(it.createdAt) : null;
      const ageStr = createdAt ? formatRelativeAge(createdAt) : it.age || null;
      return {
        name: it.name || it.symbol || "",
        age: ageStr,
        address: it.contractAddress,
        x: it.logoUrl,
        website: undefined,
        image: it.logoUrl || it?.metadata?.market?.logoUrl,
        chain: it.chain || "solana", // Default to solana if no chain specified
        category: it.category || "meme", // Include category from API
        communityScore: typeof it.communityScore === "number" ? it.communityScore : (it?.metadata?.market?.communityScore ?? 0),
        degenAudit: 0,
        mindshare: undefined,
        price: {
          amount: Number(it.priceUsd ?? 0),
          change: {
            "1m": 0,
            "5m": 0,
            "1h": Number(it.change1h ?? 0),
            "5h": 0,
            "24h": Number(it.change24h ?? 0),
          },
        },
        marketCap: Number(it.marketCap ?? it?.metadata?.market?.fdv ?? 0),
        liquidity: Number(it.liquidityUsd ?? 0),
        volume: { amount: Number(it.volume24h ?? it?.metadata?.market?.volume?.h24 ?? 0) },
        holders: Number(it.holders ?? it?.metadata?.market?.holders ?? 0),
      } as MockLikeCoin;
    });
    setLiveItems(mapped);
  };

  return (
    <div>
      <div className="h-px w-full bg-[#FF007510] mt-7 mb-4.5"></div>
      <div className="w-[87%] mx-auto">
        <Card className="w-full p-3 border-none border-[#FF007510] text-white">
          <CardHeader className="flex flex-wrap justify-between items-center px-0">
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
              <div className="flex gap-3">
              <ListingsCategoryFilter
                selected={category}
                onChange={(c: Category) => setCategory(c)}
              />
                <MemeCategoryFilter
                  selected={memeCategory}
                  onChange={(c: MemeCategory) => setMemeCategory(c)}
                />
              </div>
            </CardAction>

            <CardAction>
              <div className="flex items-center gap-2">
                <FilterButton 
                  items={rawApiItems}
                  onFilterChange={handleFilterChange}
                />
                <div className="relative flex items-center">
                  <Input
                    className="border-[0.2px] pl-7 max-w-50 placeholder:font-medium border-[#FFFFFF20] text-white placeholder:text-[#FFFFFF80] focus:!border-[0.2px] focus:!border-white focus-visible:ring-0"
                    placeholder="Ask Baws anything"
                  />
                  <Search size={16} color="#FFFFFF50" className="absolute left-2" />
                </div>

                <NetworkFilter
                  selectedNetwork={selectedNetwork}
                  onChange={setSelectedNetwork}
                />
              </div>
            </CardAction>
          </CardHeader>

          <CardContent className="px-0 h-[690px] overflow-auto hide-scrollbar">
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[1200px] border-separate border-spacing-y-2">
              <TableHeader className="!text-[#FFFFFF]/50">
                <TableRow className="border-none">
                  <TableHead className="!font-bold">
                    <span className="hidden">Watchlist button</span>
                  </TableHead>
                    <TableHead 
                      className="!font-bold cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        <SortIcon field="name" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('marketCap')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        MC / Liq
                        <SortIcon field="marketCap" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('holders')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Holders
                        <SortIcon field="holders" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('age')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Age
                        <SortIcon field="age" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Price / 24%
                        <SortIcon field="price" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('change1m')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        1m%
                        <SortIcon field="change1m" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('change5m')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        5m%
                        <SortIcon field="change5m" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('change1h')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        1h%
                        <SortIcon field="change1h" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="!font-bold flex justify-center cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('communityScore')}
                    >
                      <div className="flex items-center gap-1">
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
                        <SortIcon field="communityScore" />
                      </div>
                  </TableHead>
                    <TableHead 
                      className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('degenAudit')}
                    >
                      <div className="flex items-center justify-center gap-1">
                    Risk score
                        <SortIcon field="degenAudit" />
                      </div>
                  </TableHead>
                  <TableHead>
                    <span className="hidden">Listing Engagement</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {isLoading ? (
                    <ListingTableSkeleton />
                  ) : (
                    filteredData.map((coin, index) => (
                  <TableRow
                    key={index}
                    className="border-none bg-[#FFFFFF]/5 h-13 hover:!bg-[#FFFFFF1A] cursor-pointer"
                    onClick={() => handleProjectClick(coin.address)}
                  >
                    <TableCell>
                      <div>
                        <Button 
                          className="p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add your watchlist logic here
                            console.log('Watchlist clicked for:', coin.name);
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
                    <TableCell>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center h-full gap-1">
                        <div className="relative">
                          <Image
                            className="size-7 rounded-full border-[0.36px] border-white"
                            src={coin.image && coin.image.trim() !== "" ? coin.image : "/homepage/trending-coins/default-coin.png"}
                            alt="default-coin"
                            width={28}
                            height={28}
                          />
                          <Image
                            className="absolute bottom-0 left-0 size-[14px] rounded-full"
                            src={getChainImage(coin.chain || "solana")}
                            alt={`${coin.chain || "solana"}-chain`}
                            width={14}
                            height={14}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium capitalize max-w-[120px] truncate" title={coin.name}>
                              {coin.name.length > 15 ? `${coin.name.substring(0, 15)}...` : coin.name}
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
                            <Button 
                              className="p-0 h-fit w-fit"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(coin.address);
                              }}
                            >
                              <Image
                                src="/copy.svg"
                                alt="copy"
                                width={7.85}
                                height={8.38}
                              />
                            </Button>
                            <Link 
                              href={coin.website || "#"}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Image
                                src="/x.svg"
                                alt="x"
                                height={8}
                                width={8}
                              />
                            </Link>
                            <Link 
                              href={coin.website || "#"}
                              onClick={(e) => e.stopPropagation()}
                            >
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


                        <Button 
                          className="bg-[#FF4A15]/21 p-0 h-fit px-1 py-1 ml-5 rounded-[5.5px] font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add your buy logic here
                            console.log('Buy clicked for:', coin.name);
                          }}
                        >
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
                          {compactNumber(coin.holders)}
                        </span>
                      </div>
                      </div>
                    </TableCell>

                    {/* Age */}
                    <TableCell className="font-medium text-center">{coin.age}</TableCell>

                    {/* Price / 24% */}
                    <TableCell className="flex justify-center">
                      <div className="flex flex-col items-center">
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
                          {coin.price.change["1m"]}%
                        </span>
                      </span>
                    </TableCell>

                    {/* 5m% */}
                    <TableCell>
                      <span className={`flex font-medium items-center justify-center ${
                        coin.price.change["1m"] < 0
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
                          {coin.price.change["1m"]}%
                        </span>
                      </span>
                    </TableCell>

                    {/* 1h% */}
                    <TableCell>
                      <span className={`flex font-medium items-center justify-center ${
                        coin.price.change["1m"] < 0
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
                          {coin.price.change["1m"]}%
                        </span>
                      </span>
                    </TableCell>

                    {/* Community */}
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Image
                          src={
                            coin.communityScore < 50
                              ? "/communitry-score-icons/bad-red.svg"
                              : coin.communityScore >= 50 && coin.communityScore < 70
                              ? "/communitry-score-icons/average-yellow.svg"
                              : "/communitry-score-icons/good-green.svg"
                          }
                          alt={
                            coin.communityScore < 50
                              ? "bad-red"
                              : coin.communityScore >= 50 && coin.communityScore < 70
                              ? "average-yellow"
                              : "good-green"
                          }
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
                    ))
                  )}
              </TableBody>
            </Table>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 px-2">
              <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).slice(0, 10).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <Button 
                      key={p} 
                      variant={p === page ? undefined : "ghost"} 
                      onClick={() => setPage(p)}
                      className={p === page ? "border border-white/50 rounded-lg" : ""}
                    >
                      {p}
                    </Button>
                  );
                })}
                {totalPages > 10 && <span className="text-xs opacity-70">... {totalPages}</span>}
              </div>
              <Button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
