/**
 * Single source of truth for XP / rank progress across the app.
 * - Hydrates from localStorage via `rewardStorage` (instant UI).
 * - Refreshes from `xpService` (`/api/v1/xp/me`) and persists merged snapshot.
 * Use `useRewardProgress()` in components, or `useRewardProgressStore` for fine-grained control.
 */

import { create } from "zustand";
import { useEffect } from "react";
import {
  getStoredRewardData,
  persistRewardData,
  clearRewardData,
} from "@/lib/rewardStorage";
import xpService from "@/services/xpService";
import type { RewardProgress } from "@/types/auth.types";

export const REWARD_PROGRESS_UPDATED_EVENT = "cto:rewardProgressUpdated";

const DEFAULT_NEXT_XP_CAP = 150;

function mergeReward(
  base: Partial<RewardProgress>,
  patch: Partial<RewardProgress>,
): Partial<RewardProgress> {
  return { ...base, ...patch };
}

function dispatchRewardUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REWARD_PROGRESS_UPDATED_EVENT));
}

function rankScoreToNextTarget(reward: Partial<RewardProgress>): number {
  const cur = reward.xpBalance ?? 0;
  const toNext = reward.rankScoreToNext;
  if (typeof toNext === "number" && toNext > 0) {
    return cur + toNext;
  }
  return DEFAULT_NEXT_XP_CAP;
}

/** Integer 0–100 for UI (bar width, labels); same as MissionStats “Level progress”. */
export function toXpProgressPct(raw: number): number {
  return Math.round(
    Math.min(100, Math.max(0, Number.isFinite(raw) ? raw : 0)),
  );
}

/** Progress bar 0–100 */
export function computeXpBarPercent(reward: Partial<RewardProgress>): number {
  const direct =
    reward.scoreProgressPercent ?? reward.progressPercent ?? reward.dayProgressPercent;
  if (typeof direct === "number" && Number.isFinite(direct)) {
    return Math.min(100, Math.max(0, direct));
  }
  const cur = reward.xpBalance ?? 0;
  const cap = rankScoreToNextTarget(reward);
  if (cap <= 0) return 0;
  return Math.min(100, (cur / cap) * 100);
}

type RewardProgressStore = {
  reward: Partial<RewardProgress>;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  hydrateFromStorage: () => void;
  refresh: (opts?: { force?: boolean }) => Promise<void>;
  reset: () => void;
};

let refreshInFlight: Promise<void> | null = null;

export const useRewardProgressStore = create<RewardProgressStore>((set, get) => ({
  reward: {},
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    const stored = getStoredRewardData();
    // `stored` wins on key overlap (e.g. cross-tab updates after persist)
    set((s) => ({ reward: mergeReward(s.reward, stored) }));
  },

  refresh: async (opts) => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("cto_auth_token");
    if (!token) {
      set({ isLoading: false, error: null });
      return;
    }

    if (refreshInFlight) {
      await refreshInFlight;
      return;
    }

    const force = opts?.force === true;
    const { lastFetchedAt } = get();
    if (
      !force &&
      lastFetchedAt != null &&
      Date.now() - lastFetchedAt < 15_000
    ) {
      return;
    }

    refreshInFlight = (async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await xpService.getMe();
        const stored = getStoredRewardData();
        const merged = mergeReward(
          mergeReward(stored, res.rewardPatch),
          { xpBalance: res.balance },
        );
        persistRewardData(merged);
        set({
          reward: merged,
          isLoading: false,
          error: null,
          lastFetchedAt: Date.now(),
        });
        dispatchRewardUpdated();
      } catch (e) {
        const stored = getStoredRewardData();
        set({
          reward: mergeReward(get().reward, stored),
          isLoading: false,
          error: e instanceof Error ? e.message : "Failed to load XP",
        });
      }
    })();

    try {
      await refreshInFlight;
    } finally {
      refreshInFlight = null;
    }
  },

  reset: () => {
    clearRewardData();
    set({
      reward: {},
      error: null,
      lastFetchedAt: null,
      isLoading: false,
    });
    dispatchRewardUpdated();
  },
}));

export function resetUserRewardProgress() {
  useRewardProgressStore.getState().reset();
}

export function getRewardProgressSnapshot(): Partial<RewardProgress> {
  return useRewardProgressStore.getState().reward;
}

export type UseRewardProgressResult = {
  reward: Partial<RewardProgress>;
  /** Total XP / balance */
  xpBalance: number;
  /** Display level (from rank or default 1) */
  rankLevel: number;
  /** e.g. "Senior Sapling" */
  rankLabel: string;
  rankEmoji: string;
  currentXP: number;
  nextLevelXP: number;
  /** Raw 0–100 fill (from rank % or XP ratio). */
  xpProgress: number;
  /** Rounded 0–100 — use for progress bar `width` so it matches “Level progress %”. */
  progressPct: number;
  isLoading: boolean;
  error: string | null;
  refresh: (opts?: { force?: boolean }) => Promise<void>;
};

/**
 * Subscribe to the global reward snapshot + storage/API sync.
 */
export function useRewardProgress(): UseRewardProgressResult {
  const reward = useRewardProgressStore((s) => s.reward);
  const isLoading = useRewardProgressStore((s) => s.isLoading);
  const error = useRewardProgressStore((s) => s.error);
  const hydrateFromStorage = useRewardProgressStore((s) => s.hydrateFromStorage);
  const refresh = useRewardProgressStore((s) => s.refresh);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (e: StorageEvent) => {
      const k = e.key ?? "";
      if (
        k === "cto_user_xp" ||
        k.startsWith("cto_user_rank_") ||
        k.startsWith("cto_user_streak") ||
        k.startsWith("cto_user_days_")
      ) {
        hydrateFromStorage();
      }
    };

    const onCustom = () => hydrateFromStorage();

    window.addEventListener("storage", onStorage);
    window.addEventListener(REWARD_PROGRESS_UPDATED_EVENT, onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        REWARD_PROGRESS_UPDATED_EVENT,
        onCustom as EventListener,
      );
    };
  }, [hydrateFromStorage]);

  const xpBalance = reward.xpBalance ?? 0;
  const rankLevel = reward.rankLevel ?? 1;
  const rankLabel = reward.rankLabel?.trim() || "Member";
  const rankEmoji = reward.rankEmoji?.trim() || "";
  const nextLevelXP = rankScoreToNextTarget(reward);
  const xpProgress = computeXpBarPercent(reward);
  const progressPct = toXpProgressPct(xpProgress);

  return {
    reward,
    xpBalance,
    rankLevel,
    rankLabel,
    rankEmoji,
    currentXP: xpBalance,
    nextLevelXP,
    xpProgress,
    progressPct,
    isLoading,
    error,
    refresh,
  };
}
