/**
 * Valid slug values for CTOMarketplace routes.
 * Do not add new values without updating the URL & Slug Architecture doc.
 * @see URL & Slug Architecture Developer Reference Document
 */

export const CHAIN_SLUGS = [
  "solana",
  "ethereum",
  "bsc",
  "aptos",
  "sui",
  "ton",
  "base",
  "movement",
] as const;

export type ChainSlug = (typeof CHAIN_SLUGS)[number];

export const CHAIN_DISPLAY_NAMES: Record<ChainSlug, string> = {
  solana: "Solana",
  ethereum: "Ethereum",
  bsc: "BNB Smart Chain",
  aptos: "Aptos",
  sui: "Sui",
  ton: "TON",
  base: "Base",
  movement: "Movement",
};

/** Common API / UI aliases → canonical chain slug */
const CHAIN_ALIASES: Record<string, ChainSlug> = {
  sol: "solana",
  solana: "solana",
  eth: "ethereum",
  ethereum: "ethereum",
  bnb: "bsc",
  bsc: "bsc",
  "binance-smart-chain": "bsc",
  aptos: "aptos",
  sui: "sui",
  ton: "ton",
  base: "base",
  movement: "movement",
  move: "movement",
};

/**
 * Normalize a chain string from the API/UI into a known {@link ChainSlug}.
 * Falls back to `solana` when unknown (matches existing listing defaults).
 */
export function normalizeChainSlug(chain: string | null | undefined): ChainSlug {
  if (!chain) return "solana";
  const key = chain.trim().toLowerCase().replace(/\s+/g, "-");
  if (CHAIN_ALIASES[key]) return CHAIN_ALIASES[key];
  if ((CHAIN_SLUGS as readonly string[]).includes(key)) return key as ChainSlug;
  return "solana";
}

/** Listing tier slugs (Section 4.2) */
export const TIER_SLUGS = ["seed", "sprout", "bloom", "stellar"] as const;
export type TierSlug = (typeof TIER_SLUGS)[number];

/** Marketplace category slugs (Section 4.5) — use in URL /marketplace/[category] */
export const MARKETPLACE_CATEGORY_SLUGS = [
  "cto-wanted",
  "developers",
  "designers",
  "marketers-promoters",
  "community-roles",
  "collaborations-partners",
  "development-services",
  "design-creative",
  "marketing-hype",
  "tools-assets",
  "education-advisory",
  "other",
] as const;

export type MarketplaceCategorySlug =
  (typeof MARKETPLACE_CATEGORY_SLUGS)[number];

export const MARKETPLACE_CATEGORY_DISPLAY_NAMES: Record<
  MarketplaceCategorySlug,
  string
> = {
  "cto-wanted": "CTO Wanted",
  developers: "Developers",
  designers: "Designers",
  "marketers-promoters": "Marketers & Promoters",
  "community-roles": "Community Roles",
  "collaborations-partners": "Collaborations & Partners",
  "development-services": "Development Services",
  "design-creative": "Design & Creative",
  "marketing-hype": "Marketing & Hype",
  "tools-assets": "Tools & Assets",
  "education-advisory": "Education & Advisory",
  other: "Other / Experimental",
};

export function isValidMarketplaceCategorySlug(
  value: string
): value is MarketplaceCategorySlug {
  return (MARKETPLACE_CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function isValidChainSlug(value: string): value is ChainSlug {
  return (CHAIN_SLUGS as readonly string[]).includes(value);
}
