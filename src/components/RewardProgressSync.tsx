"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRewardProgressStore } from "@/lib/userRewardProgress";

/**
 * Keeps XP / rank state in sync when auth changes (login, logout, session restore).
 * Mount once inside PrivyProvider.
 */
export default function RewardProgressSync() {
  const { ready, authenticated } = usePrivy();
  const refresh = useRewardProgressStore((s) => s.refresh);
  const reset = useRewardProgressStore((s) => s.reset);
  const hydrateFromStorage = useRewardProgressStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      reset();
      return;
    }
    hydrateFromStorage();
    void refresh();
  }, [ready, authenticated, refresh, reset, hydrateFromStorage]);

  return null;
}
