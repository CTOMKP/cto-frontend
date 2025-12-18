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
      
      // Fetch from all chains initially (remove chain filter to get all chains)
      const url = `${base}/api/v1/listing/listings?category=MEME&sort=updatedAt%3Adesc&limit=10000`;
      
      try {
        const res = await fetch(url);
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const response = await res.json();
        console.log('Highlights - Raw API response:', response);
        console.log('Highlights - Response.data:', response.data);
        
        // Backend wraps response in { data, statusCode, timestamp } via TransformInterceptor
        const data: ApiListingResponse = response.data || response;
        console.log('Highlights - Parsed data:', data);
        console.log('Highlights - Items count:', data.items?.length || 0);
        console.log('Highlights - First item sample:', data.items?.[0]);
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
