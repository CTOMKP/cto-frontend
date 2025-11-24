"use client";

import { useState, useEffect } from "react";
import Highlights from "@/app/listings/features/Highlights";
import Listing from "@/app/listings/features/Listing";
import { ApiCoinItem } from "@/types/api";

type ApiListingResponse = {
  page: number;
  limit: number;
  total: number;
  items: ApiCoinItem[];
};

export default function Listings() {
  const [apiData, setApiData] = useState<ApiCoinItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      const base = process.env.NEXT_PUBLIC_BACKEND_URL;
      
      // Fetch from all chains initially
      const url = `${base}/api/listing/listings?category=MEME&sort=updatedAt%3Adesc&limit=10000&chain=SOLANA`;
      
      try {
        const res = await fetch(url);
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const data: ApiListingResponse = await res.json();
        setApiData(data.items || []);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, []);

  return (
    <div>
      <Highlights apiData={apiData} isLoading={isLoading} />
      <Listing />
    </div>
  );
}
