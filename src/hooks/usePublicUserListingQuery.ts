"use client";

import { useQuery } from "@tanstack/react-query";
import { listingKeys } from "@/lib/queryKeys";
import { userListingsService } from "@/services/userListingsService";

/**
 * Published user listing only: `GET /api/v1/user-listings/{id}` (no mine-first fallback).
 * Used by `/projects` when opened with `?userListingId=` from profile.
 */
export function usePublicUserListingQuery(listingId: string | undefined) {
  return useQuery({
    queryKey: listingId ? listingKeys.publicUserListing(listingId) : [...listingKeys.all, "public-user-listing", "none"],
    queryFn: ({ signal }) => userListingsService.getPublicListing(listingId!, signal),
    enabled: !!listingId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
