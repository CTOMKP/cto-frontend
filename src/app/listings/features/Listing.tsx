"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category } from "../../../components/ListingsCategoryFilter";
import { MemeCategory } from "../../../components/MemeCategoryFilter";
import { Network } from "../../../components/NetworkFilter";
import { ApiCoinItem, ApiListingResponse } from "@/types/api";
import { SortField, SortDirection, MockLikeCoin } from "./types/listing";
import { formatAgeYMD } from "./utils/listingUtils";
import ListingTableSkeleton from "./ListingTableSkeleton";
import ListingTableHeader from "./ListingTableHeader";
import ListingTableRow from "./ListingTableRow";
import ListingFilters from "./ListingFilters";
import ListingPagination from "./ListingPagination";


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
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!base) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchListings = async () => {
      setIsLoading(true);

      let url: string;
      if (selectedNetwork === null) {
        url = `${base}/api/v1/listing/listings?category=MEME&sort=updatedAt%3Adesc&page=${page}&limit=${limit}`;
      } else {
        const chainParam = selectedNetwork.toUpperCase();
        url = `${base}/api/v1/listing/listings?chain=${chainParam}&category=MEME&sort=updatedAt%3Adesc&page=${page}&limit=${limit}`;
      }

      try {
        const res = await fetch(url, { signal });
        if (signal.aborted) return;
        if (!res.ok) {
          console.error('Failed to fetch listings:', res.status, res.statusText);
          return;
        }
        const response = await res.json();
        if (signal.aborted) return;

        let data: ApiListingResponse;
        if (response && typeof response === 'object') {
          if ('data' in response && response.data) {
            data = response.data;
          } else if ('items' in response || 'total' in response) {
            data = response as ApiListingResponse;
          } else {
            data = { total: 0, items: [], page: 1, limit: 20 };
          }
        } else {
          data = { total: 0, items: [], page: 1, limit: 20 };
        }

        setTotal(data.total || 0);
        setRawApiItems(data.items || []);

        const mapped: MockLikeCoin[] = (data.items || []).map((it) => {
          // Use backend-provided age (actual token age) or fallback to calculating from createdAt
          let ageStr: string | null = null;
          if (it.age && typeof it.age === 'string' && it.age.trim() !== '') {
            // Convert to "1y 2mo 4d" format
            ageStr = formatAgeYMD(it.age);
          } else {
            const createdAt = it.createdAt ? new Date(it.createdAt) : null;
            ageStr = createdAt ? formatAgeYMD(createdAt) : null;
          }
          
          // Get holders from multiple possible sources - preserve null for "N/A" display
          const holderCount = it.holders ?? it?.metadata?.market?.holders ?? null;
          
          // Get tier and normalize it
          let tier: string | null = it.tier || null;
          if (tier) {
            tier = String(tier).trim().toLowerCase();
            // Normalize various invalid tier values to null (including all dash variations)
            if (tier === 'none' || tier === 'null' || tier === 'undefined' || tier === '' || 
                tier === '—' || tier === '----' || tier === '------' || 
                tier.startsWith('---') || tier === 'n/a' || tier === 'na' ||
                /^[-—]+$/.test(tier)) { // Match any string that's only dashes/em-dashes
              tier = null;
            }
          }
          
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
            tier: tier,
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
            holders: holderCount !== null && holderCount !== undefined ? Number(holderCount) : null,
          } as MockLikeCoin;
        });
        if (signal.aborted) return;
        setLiveItems(mapped);
      } catch (e) {
        if (signal.aborted) return;
        console.log(e);
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    };
    fetchListings();
    return () => controller.abort();
  }, [page, limit, selectedNetwork]);

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


  const listings = useMemo(() => {
    const items = liveItems;
    
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
    
    return result;
  }, [liveItems, category, memeCategory, sortField, sortDirection]);

  const filteredData = listings[category];

  const handleProjectClick = (projectAddress: string) => {
    router.push(`/projectProfile/${projectAddress}`);
  };

  const handleFilterChange = (filteredItems: ApiCoinItem[]) => {
    // Convert filtered API items to MockLikeCoin format for display
    const mapped: MockLikeCoin[] = filteredItems.map((it) => {
      // Use backend-provided age (actual token age) or fallback to calculating from createdAt
      let ageStr: string | null = null;
      if (it.age && typeof it.age === 'string' && it.age.trim() !== '') {
        // Convert to "1y 2mo 4d" format
        ageStr = formatAgeYMD(it.age);
      } else {
        const createdAt = it.createdAt ? new Date(it.createdAt) : null;
        ageStr = createdAt ? formatAgeYMD(createdAt) : null;
      }
      
      // Get holders from multiple possible sources - preserve null for "N/A" display
      const holderCount = it.holders ?? it?.metadata?.market?.holders ?? null;
      
      // Get tier and normalize it
      let tier: string | null = it.tier || null;
      if (tier) {
        tier = String(tier).trim().toLowerCase();
        // Normalize various invalid tier values to null (including all dash variations)
        if (tier === 'none' || tier === 'null' || tier === 'undefined' || tier === '' || 
            tier === '—' || tier === '----' || tier === '------' || 
            tier.startsWith('---') || tier === 'n/a' || tier === 'na' ||
            /^[-—]+$/.test(tier)) { // Match any string that's only dashes/em-dashes
          tier = null;
        }
      }
      
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
        degenAudit: typeof it.riskScore === "number" ? it.riskScore : (it?.metadata?.market?.riskScore ?? 0),
        tier: tier,
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
        holders: Number(holderCount),
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
            <ListingFilters
              category={category}
              setCategory={setCategory}
              memeCategory={memeCategory}
              setMemeCategory={setMemeCategory}
              selectedNetwork={selectedNetwork}
              setSelectedNetwork={setSelectedNetwork}
              rawApiItems={rawApiItems}
              onFilterChange={handleFilterChange}
            />
          </CardHeader>

          <CardContent className="px-0 h-[690px] overflow-auto hide-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-separate border-spacing-y-2">
                <ListingTableHeader
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <tbody>
                  {isLoading ? (
                    <ListingTableSkeleton />
                  ) : (
                    (filteredData ?? []).map((coin, index) => (
                      <ListingTableRow
                        key={index}
                        coin={coin}
                        onProjectClick={handleProjectClick}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <ListingPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
