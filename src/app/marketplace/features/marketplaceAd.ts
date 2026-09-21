import { getCloudFrontUrl } from "@/utils/helper/image-url-helper";

export const MARKETPLACE_ASSET_BASE = "/marketplace";

/** Shape of a marketplace ad from listTrending / listForYou / listPublic */
export type MarketplaceAdUser = {
  id: number;
  email: string;
  avatarUrl: string | null;
  name: string | null;
};

export type MarketplaceAd = {
  id: string;
  userId: number;
  postType: string;
  approvedBy: number | null;
  autoBumpDays: number | null;
  category: string;
  subCategory: string | null;
  chain: string;
  contactInfo: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  expiryNoticeSentAt: string | null;
  extendedCount: number;
  featuredPlacement: boolean;
  featuredUntil: string | null;
  homepageSpotlight: boolean;
  imageCount: number;
  images: string[];
  lastExtendedAt: string | null;
  lastInteractionAt: string | null;
  messageCount: number;
  multiChainTag: boolean;
  offerType: string;
  priceAmount: number;
  priceCurrency: string;
  rejectionReason: string | null;
  status: string;
  tier: string;
  title: string;
  topOfDayDays: number | null;
  totalPrice: number;
  urgentTag: boolean;
  viewCount: number;
  tags: string[];
  user?: MarketplaceAdUser | null;
};

export function isFeatured(ad: { featuredPlacement?: boolean; featuredUntil?: string | null }) {
  if (ad?.featuredPlacement) return true;
  if (!ad?.featuredUntil) return false;
  const ts = new Date(ad.featuredUntil).getTime();
  return Number.isFinite(ts) && ts > Date.now();
}

export function formatCountdown(dateStr?: string | null, nowTs?: number) {
  if (!dateStr) return null;
  const target = new Date(dateStr).getTime();
  if (!Number.isFinite(target)) return null;
  const now = typeof nowTs === "number" ? nowTs : Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    const hh = String(hours).padStart(2, "0");
    return `${days}d : ${hh}h : ${mm}m : ${ss}s`;
  }
  return `${days}d : ${mm}m : ${ss}s`;
}

export function getDaysAgo(dateStr?: string | null) {
  if (!dateStr) return null;
  const ts = new Date(dateStr).getTime();
  if (!Number.isFinite(ts)) return null;
  const diff = Date.now() - ts;
  if (diff < 0) return 0;
  return Math.floor(diff / 86400000);
}

export function toCloudFrontUrl(url?: string | null) {
  if (!url || typeof url !== "string") return undefined;
  if (url.includes("cloudfront.net")) return url;
  if (url.includes("/api/v1/images/view/")) {
    const match = url.match(/\/api\/v1\/images\/view\/(.+)$/);
    if (match) {
      const imagePath = match[1].split("?")[0];
      return getCloudFrontUrl(imagePath);
    }
  }
  if (url.includes("user-uploads/")) return getCloudFrontUrl(url);
  return url;
}

export const MARKETPLACE_RAIL_MAX_ADS = 8;

export function normAdField(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function fieldSlug(value: unknown) {
  return normAdField(value)
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function fieldsMatch(a: unknown, b: unknown) {
  const na = normAdField(a);
  const nb = normAdField(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const sa = fieldSlug(na);
  const sb = fieldSlug(nb);
  return Boolean(sa && sb && sa === sb);
}

/** Compact token: lookingFor / LOOKING_FOR / looking-for → LOOKINGFOR */
function compactPostType(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/**
 * List ads often omit `postType` or send camelCase (`lookingFor`).
 * Looking for is the create-ad default, so treat missing/unknown as that.
 */
export function resolveMarketplacePostType(
  ad: Pick<MarketplaceAd, "postType"> & Record<string, unknown>,
): "LOOKING_FOR" | "OFFERING" {
  const raw =
    ad.postType ??
    ad.post_type ??
    ad.adType ??
    ad.ad_type ??
    ad.type;
  const compact = compactPostType(raw);
  if (compact.includes("OFFER")) return "OFFERING";
  return "LOOKING_FOR";
}
