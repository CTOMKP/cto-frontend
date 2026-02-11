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
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!base) {
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchListings = async () => {
      setIsLoading(true);
      const url = `${base}/api/v1/listing/listings?category=MEME&sort=updatedAt%3Adesc&limit=10000`;
      try {
        const res = await fetch(url, { signal });
        if (signal.aborted) return;
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const response = await res.json();
        if (signal.aborted) return;
        const data: ApiListingResponse = response.data || response;
        setApiData(data.items || []);
      } catch (e) {
        if (signal.aborted) return;
        console.log(e);
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    };
    fetchListings();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <Highlights apiData={apiData} isLoading={isLoading} />
      <Listing />
    </div>
  );
}
