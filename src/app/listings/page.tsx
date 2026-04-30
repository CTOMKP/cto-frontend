"use client";

import { useQuery } from "@tanstack/react-query";
import Highlights from "@/app/listings/features/Highlights";
import Listing from "@/app/listings/features/Listing";
import { ApiCoinItem } from "@/types/api";
import { listingKeys } from "@/lib/queryKeys";
import { fetchListingHighlights } from "@/services/listingPublicService";

export default function Listings() {
  const backendConfigured = !!process.env.NEXT_PUBLIC_BACKEND_URL;

  const highlightsQuery = useQuery({
    queryKey: listingKeys.highlights(),
    queryFn: ({ signal }) => fetchListingHighlights(signal),
    enabled: backendConfigured,
    staleTime: 60_000,
  });

  const apiData: ApiCoinItem[] = highlightsQuery.data ?? [];
  const isLoading = backendConfigured && highlightsQuery.isPending;

  return (
    <div>
      {highlightsQuery.isError && (
        <p className="px-4 py-2 text-sm text-amber-200/90" role="status">
          Highlights could not be loaded. The table below may still work.
        </p>
      )}
      <Highlights apiData={apiData} isLoading={isLoading} />
      <Listing />
    </div>
  );
}
