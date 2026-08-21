/**
 * CTOMarketplace URL & Slug Architecture — slug generation utilities.
 * Slugs are human-readable, keyword-rich, and immutable after creation.
 * @see URL & Slug Architecture Developer Reference Document
 */

import {
  CHAIN_DISPLAY_NAMES,
  CHAIN_SLUGS,
  normalizeChainSlug,
  type ChainSlug,
} from "@/lib/constants/slugs";

export { type ChainSlug };
export { CHAIN_SLUGS, CHAIN_DISPLAY_NAMES, normalizeChainSlug };

/** Project slug regex: token-name portion + hyphen + chain. */
export const PROJECT_SLUG_REGEX = new RegExp(
  `^[a-z0-9-]+-(${CHAIN_SLUGS.join("|")})$`
);

/**
 * Generates a project slug from token name and chain.
 * FORMAT: [token-name]-[chain]
 * EXAMPLE: generateProjectSlug("Bagzilla Inu", "solana") → "bagzilla-inu-solana"
 * Max 80 chars total; name portion truncated to 60 chars.
 */
export function generateProjectSlug(
  tokenName: string,
  chain: string | ChainSlug
): string {
  const chainSlug = normalizeChainSlug(chain);
  const base = tokenName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/-+/g, "-") // collapse duplicate hyphens
    .replace(/^-|-$/g, "") // trim leading/trailing hyphens
    .slice(0, 60); // max 60 chars for name portion

  const namePart = base || "token";
  const slug = `${namePart}-${chainSlug}`;
  return slug.length > 80 ? slug.slice(0, 80) : slug;
}

/**
 * Build `/projects/[slug]?address=…` (optional userListingId).
 */
export function buildProjectHref(params: {
  name: string;
  address: string;
  chain?: string | null;
  userListingId?: string | null;
}): string {
  const slug = generateProjectSlug(params.name, params.chain ?? "solana");
  const qs = new URLSearchParams();
  qs.set("address", params.address);
  if (params.userListingId) qs.set("userListingId", params.userListingId);
  return `/projects/${encodeURIComponent(slug)}?${qs.toString()}`;
}

/**
 * Generic slugify for titles (forum threads, blog, glossary, usernames).
 * Lowercase, replace spaces with hyphens, remove special chars, collapse hyphens.
 */
export function slugify(
  text: string,
  options?: { maxLength?: number }
): string {
  const maxLength = options?.maxLength ?? 80;
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLength);
}
