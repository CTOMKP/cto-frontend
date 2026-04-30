"use client";

import { useQuery } from "@tanstack/react-query";
import { listingKeys } from "@/lib/queryKeys";
import { getAuthToken } from "@/lib/authSession";
import { userListingsService } from "@/services/userListingsService";

export type UseUserListingsQueryOptions = {
  enabled?: boolean;
};

export function useUserListingsQuery(options: UseUserListingsQueryOptions = {}) {
  const { enabled: enabledOption } = options;

  const enabled =
    enabledOption !== undefined
      ? enabledOption
      : typeof window !== "undefined" && !!getAuthToken();

  return useQuery({
    queryKey: listingKeys.mine(),
    queryFn: ({ signal }) => userListingsService.mine(signal),
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
