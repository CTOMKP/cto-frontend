"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { getUserId } from "@/lib/authSession";
import { walletKeys } from "@/lib/queryKeys";
import walletsService from "@/services/walletsService";

export function useResolvedMovementWallet(opts?: { preferStorage?: boolean }) {
  const { authenticated, user } = usePrivy();
  const userId = getUserId() || user?.id || null;

  return useQuery({
    queryKey: walletKeys.movementContext(userId),
    queryFn: () =>
      walletsService.resolveMovementWalletContext({
        privyUser: user,
        userId,
        preferStorage: opts?.preferStorage ?? true,
      }),
    enabled: !!(authenticated && user && userId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

