"use client";

import { useQuery } from "@tanstack/react-query";
import { listingKeys } from "@/lib/queryKeys";
import { userListingsService } from "@/services/userListingsService";

export function useUserListingDetailQuery(listingId: string | undefined) {
  return useQuery({
    queryKey: listingId ? listingKeys.detail(listingId) : ["listings", "detail", "none"],
    queryFn: ({ signal }) => userListingsService.fetchListingForDisplay(listingId!, signal),
    enabled: !!listingId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
