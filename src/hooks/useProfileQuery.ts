"use client";

import { useQuery } from "@tanstack/react-query";
import { profileKeys } from "@/lib/queryKeys";
import { authService } from "@/services/authService";
import { getAuthToken } from "@/lib/authSession";

export type UseProfileQueryOptions = {
  /** When set, gate the query (e.g. Privy `ready && authenticated`). Otherwise runs when a token exists. */
  enabled?: boolean;
};

export function useProfileQuery(options: UseProfileQueryOptions = {}) {
  const { enabled: enabledOption } = options;

  const enabled =
    enabledOption !== undefined
      ? enabledOption
      : typeof window !== "undefined" && !!getAuthToken();

  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: ({ signal }) => authService.fetchProfile(signal),
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
