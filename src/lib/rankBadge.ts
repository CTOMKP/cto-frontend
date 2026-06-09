const RANK_BADGE_BASE = "/user-badges";
const DEFAULT_BADGE = `${RANK_BADGE_BASE}/seedling.png`;

/** "Junior Sapling" → "junior-sapling" (matches files in public/user-badges) */
export function rankLabelToBadgeSlug(rankLabel: string): string {
  return rankLabel.trim().toLowerCase().replace(/\s+/g, "-");
}

export function getRankBadgeSrc(rankLabel: string | null | undefined): string {
  const label = rankLabel?.trim();
  if (!label) return DEFAULT_BADGE;
  const slug = rankLabelToBadgeSlug(label);
  return `${RANK_BADGE_BASE}/${slug}.png`;
}
