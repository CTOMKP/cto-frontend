/**
 * CTOMarketplace URL & Slug Architecture — slug generation utilities.
 * Slugs are human-readable, keyword-rich, and immutable after creation.
 * @see URL & Slug Architecture Developer Reference Document
 */

import {
  CHAIN_SLUGS,
  type ChainSlug,
} from "@/lib/constants/slugs";

export { type ChainSlug };
export { CHAIN_SLUGS };

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
  chain: ChainSlug
): string {
  const base = tokenName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/-+/g, "-") // collapse duplicate hyphens
    .replace(/^-|-$/g, "") // trim leading/trailing hyphens
    .slice(0, 60); // max 60 chars for name portion

  const slug = `${base}-${chain}`;
  return slug.length > 80 ? slug.slice(0, 80) : slug;
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
