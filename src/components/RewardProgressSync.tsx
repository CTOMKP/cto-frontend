"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRewardProgressStore } from "@/lib/userRewardProgress";
import { AUTH_TOKEN_KEY, getAuthToken } from "@/lib/authSession";
import { useState } from "react";

/**
 * Keeps XP / rank state in sync when auth changes (login, logout, session restore).
 * Mount once inside PrivyProvider.
 */
export default function RewardProgressSync() {
  const { ready, authenticated } = usePrivy();
  const refresh = useRewardProgressStore((s) => s.refresh);
  const reset = useRewardProgressStore((s) => s.reset);
  const hydrateFromStorage = useRewardProgressStore((s) => s.hydrateFromStorage);
  const [token, setToken] = useState<string | null>(() => getAuthToken());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_TOKEN_KEY) {
        setToken(e.newValue);
      }
    };

    window.addEventListener("storage", onStorage);
    const interval = setInterval(() => {
      const next = getAuthToken();
      setToken((prev) => (prev === next ? prev : next));
    }, 1000);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      reset();
      return;
    }
    hydrateFromStorage();
    if (token) {
      void refresh({ force: true });
    }
  }, [ready, authenticated, token, refresh, reset, hydrateFromStorage]);

  return null;
}
