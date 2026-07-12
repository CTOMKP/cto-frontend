import type { ApiCoinItem } from "@/types/api";

export type DiscoveryCategory = {
  name: string;
  slug: string;
  info: string;
};

export const DISCOVERY_CATEGORIES: DiscoveryCategory[] = [
  {
    name: "Animals",
    slug: "animals",
    info: "Doggos, cattos, and zoo memes — animal coins that get reborn every cycle.",
  },
  {
    name: "Art and Culture",
    slug: "art-and-culture",
    info: "Memecoins that reflect internet culture, vibes, and virality.",
  },
  {
    name: "Food and Drink",
    slug: "food-and-drink",
    info: "Snackable, ridiculous, and deliciously viral — from $PIZZA to $MILK.",
  },
  {
    name: "Technology and Science",
    slug: "technology-and-science",
    info: "AI, agents, and builder-core tokens between tech utility and troll coin.",
  },
  {
    name: "Sports and Fitness",
    slug: "sports-and-fitness",
    info: "Athletes, sporting moments, gym bros, and crypto cardio culture.",
  },
  {
    name: "Entertainment and Media",
    slug: "entertainment-and-media",
    info: "Pop culture, streams, and media moments turned into on-chain memes.",
  },
  {
    name: "Lifestyle and Well-being",
    slug: "lifestyle-and-well-being",
    info: "Wellness, self-care, and lifestyle vibes in memecoin form.",
  },
  {
    name: "Finance and Business",
    slug: "finance-and-business",
    info: "Markets, money culture, and business-themed meme tokens.",
  },
  {
    name: "Community and Social Movements",
    slug: "community-and-social-movements",
    info: "Grassroots communities, social causes, and movement-driven tokens.",
  },
  {
    name: "Elon Musk-Inspired",
    slug: "elon-musk-inspired",
    info: "Elon-themed memes, rockets, and main-character energy on-chain.",
  },
];

export function normalizeDiscoverySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDiscoveryCategoryBySlug(
  slug: string,
): DiscoveryCategory | undefined {
  const normalized = normalizeDiscoverySlug(slug);
  return DISCOVERY_CATEGORIES.find((c) => c.slug === normalized);
}

export function getDiscoveryCategoryHref(slug: string): string {
  return `/categories/${normalizeDiscoverySlug(slug)}`;
}

/** Resolve image path; supports legacy filenames from the hub page. */
export function getDiscoveryCategoryImageSrc(slug: string): string {
  const category = getDiscoveryCategoryBySlug(slug);
  if (!category) return "/categories/animals.png";

  const legacyMap: Record<string, string> = {
    "art-and-culture": "arts-&-Culture",
    "food-and-drink": "food-&-drinks",
    "technology-and-science": "technology-&-science",
    "sports-and-fitness": "sports-&-fitness",
    "entertainment-and-media": "entertainment-&-media",
    "finance-and-business": "finance-&-business",
    "lifestyle-and-well-being": "lifestyle-&-well-being",
  };

  const fileSlug = legacyMap[category.slug] ?? category.slug;
  return `/categories/${fileSlug}.png`;
}

function coinCategoryCandidates(coin: ApiCoinItem): string[] {
  return [
    coin.category,
    coin.metadata?.market?.category,
    coin.summary,
    coin.name,
  ].filter((v): v is string => typeof v === "string" && v.trim() !== "");
}

export function matchesDiscoveryCategory(
  coin: ApiCoinItem,
  slug: string,
): boolean {
  const category = getDiscoveryCategoryBySlug(slug);
  if (!category) return false;

  const targetSlug = category.slug;
  const targetNameSlug = normalizeDiscoverySlug(category.name);

  return coinCategoryCandidates(coin).some((field) => {
    const fieldSlug = normalizeDiscoverySlug(field);
    return (
      fieldSlug === targetSlug ||
      fieldSlug === targetNameSlug ||
      fieldSlug.includes(targetSlug) ||
      targetSlug.includes(fieldSlug)
    );
  });
}

export function filterCoinsByDiscoveryCategory(
  items: ApiCoinItem[],
  slug: string,
): ApiCoinItem[] {
  return items.filter((coin) => matchesDiscoveryCategory(coin, slug));
}
