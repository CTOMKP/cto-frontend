import { RewardProgress, User } from '../types/auth.types';

const STORAGE_KEYS = {
  xpBalance: 'cto_user_xp',
  rankScore: 'cto_user_rank_score',
  rankTier: 'cto_user_rank_tier',
  rankLevel: 'cto_user_rank_level',
  rankLabel: 'cto_user_rank_label',
  rankEmoji: 'cto_user_rank_emoji',
  nextRankTier: 'cto_user_next_rank_tier',
  nextRankLevel: 'cto_user_next_rank_level',
  nextRankLabel: 'cto_user_next_rank_label',
  progressPercent: 'cto_user_rank_progress',
  scoreProgressPercent: 'cto_user_rank_score_progress',
  dayProgressPercent: 'cto_user_rank_day_progress',
  rankScoreToNext: 'cto_user_rank_score_to_next',
  daysToNext: 'cto_user_rank_days_to_next',
  daysOnPlatform: 'cto_user_days_on_platform',
  currentStreakDays: 'cto_user_streak_days',
} as const;

type RewardLike = Partial<RewardProgress> & Partial<User> & {
  balance?: number;
  data?: Partial<RewardProgress> & Partial<User> & { balance?: number };
};

function readNumber(key: string): number | undefined {
  const raw = localStorage.getItem(key);
  if (raw == null || raw === '') return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readString(key: string): string | undefined {
  const raw = localStorage.getItem(key);
  return raw ? raw : undefined;
}

export function normalizeRewardData(source?: RewardLike | null): Partial<RewardProgress> {
  if (!source) return {};

  const nested = source.data || {};
  const from = { ...nested, ...source };

  return {
    xpBalance: typeof from.xpBalance === 'number' ? from.xpBalance : typeof from.balance === 'number' ? from.balance : undefined,
    rankScore: typeof from.rankScore === 'number' ? from.rankScore : undefined,
    rankTier: typeof from.rankTier === 'number' ? from.rankTier : undefined,
    rankLevel: typeof from.rankLevel === 'number' ? from.rankLevel : undefined,
    rankLabel: typeof from.rankLabel === 'string' ? from.rankLabel : undefined,
    rankEmoji: typeof from.rankEmoji === 'string' ? from.rankEmoji : undefined,
    nextRankTier: typeof from.nextRankTier === 'number' ? from.nextRankTier : undefined,
    nextRankLevel: typeof from.nextRankLevel === 'number' ? from.nextRankLevel : undefined,
    nextRankLabel: typeof from.nextRankLabel === 'string' ? from.nextRankLabel : undefined,
    progressPercent: typeof from.progressPercent === 'number' ? from.progressPercent : undefined,
    scoreProgressPercent: typeof from.scoreProgressPercent === 'number' ? from.scoreProgressPercent : undefined,
    dayProgressPercent: typeof from.dayProgressPercent === 'number' ? from.dayProgressPercent : undefined,
    rankScoreToNext: typeof from.rankScoreToNext === 'number' ? from.rankScoreToNext : undefined,
    daysToNext: typeof from.daysToNext === 'number' ? from.daysToNext : undefined,
    daysOnPlatform: typeof from.daysOnPlatform === 'number' ? from.daysOnPlatform : undefined,
    currentStreakDays: typeof from.currentStreakDays === 'number' ? from.currentStreakDays : undefined,
  };
}

export function persistRewardData(source?: RewardLike | null) {
  const reward = normalizeRewardData(source);
  const entries: Array<[string, number | string | null | undefined]> = [
    [STORAGE_KEYS.xpBalance, reward.xpBalance],
    [STORAGE_KEYS.rankScore, reward.rankScore],
    [STORAGE_KEYS.rankTier, reward.rankTier],
    [STORAGE_KEYS.rankLevel, reward.rankLevel],
    [STORAGE_KEYS.rankLabel, reward.rankLabel],
    [STORAGE_KEYS.rankEmoji, reward.rankEmoji],
    [STORAGE_KEYS.nextRankTier, reward.nextRankTier],
    [STORAGE_KEYS.nextRankLevel, reward.nextRankLevel],
    [STORAGE_KEYS.nextRankLabel, reward.nextRankLabel],
    [STORAGE_KEYS.progressPercent, reward.progressPercent],
    [STORAGE_KEYS.scoreProgressPercent, reward.scoreProgressPercent],
    [STORAGE_KEYS.dayProgressPercent, reward.dayProgressPercent],
    [STORAGE_KEYS.rankScoreToNext, reward.rankScoreToNext],
    [STORAGE_KEYS.daysToNext, reward.daysToNext],
    [STORAGE_KEYS.daysOnPlatform, reward.daysOnPlatform],
    [STORAGE_KEYS.currentStreakDays, reward.currentStreakDays],
  ];

  entries.forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, String(value));
  });
}

export function clearRewardData() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function getStoredRewardData(): Partial<RewardProgress> {
  return {
    xpBalance: readNumber(STORAGE_KEYS.xpBalance),
    rankScore: readNumber(STORAGE_KEYS.rankScore),
    rankTier: readNumber(STORAGE_KEYS.rankTier),
    rankLevel: readNumber(STORAGE_KEYS.rankLevel),
    rankLabel: readString(STORAGE_KEYS.rankLabel),
    rankEmoji: readString(STORAGE_KEYS.rankEmoji),
    nextRankTier: readNumber(STORAGE_KEYS.nextRankTier),
    nextRankLevel: readNumber(STORAGE_KEYS.nextRankLevel),
    nextRankLabel: readString(STORAGE_KEYS.nextRankLabel),
    progressPercent: readNumber(STORAGE_KEYS.progressPercent),
    scoreProgressPercent: readNumber(STORAGE_KEYS.scoreProgressPercent),
    dayProgressPercent: readNumber(STORAGE_KEYS.dayProgressPercent),
    rankScoreToNext: readNumber(STORAGE_KEYS.rankScoreToNext),
    daysToNext: readNumber(STORAGE_KEYS.daysToNext),
    daysOnPlatform: readNumber(STORAGE_KEYS.daysOnPlatform),
    currentStreakDays: readNumber(STORAGE_KEYS.currentStreakDays),
  };
}

