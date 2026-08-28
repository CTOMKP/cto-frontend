"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useMarketplaceFeedQuery } from "@/hooks/useMarketplaceFeedQuery";
import { Button } from "@/components/ui/button";
import { Clock, EllipsisVertical, Globe2, MoreHorizontal, Plus, RefreshCw, Search, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import MarketplaceTrendingFilter, { type Category } from "./features/MarketplaceTrendingFilter";
import MarketplaceAdsFilter, {
  EMPTY_MARKETPLACE_FILTERS,
  matchesMarketplaceFilters,
  type MarketplaceAdFilters,
} from "./features/MarketplaceAdsFilter";
import MarketplaceCategoryDropdowns, {
  matchesCategorySelection,
} from "./features/MarketplaceCategoryDropdowns";
import { Input } from "@/components/ui/input";
import { getCloudFrontUrl } from "@/utils/helper/image-url-helper";
import { useTranslation } from "react-i18next";

const MARKETPLACE_ASSET_BASE = '/marketplace';

/** Shape of a marketplace ad from listTrending / listForYou / listPublic */
type MarketplaceAdUser = {
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
  user: MarketplaceAdUser;
};

const roles = [
  "Designer",
  "Developer",
  "Raider",
  "Core Shillers",
  "Btc",
  "Meme reviver",
  "Shit poster",
  "Backend",
  "Meme Design",
  "Community manager",
  "Icons",
];

const MOCK_ADS = [
  { id: "1", title: "Liquidity Partner Needed", duration: "10d: 28m: 34s", age: "3d", by: "@YourHandle", payment: "Revenue share", price: "-", tags: ["Liquidity", "Partner", "RevenueShare", "Launch"] },
  { id: "2", title: "Liquidity Partner Needed", duration: "10d: 28m: 34s", age: "3d", by: "@YourHandle", payment: "Revenue share", price: "-", tags: ["Liquidity", "Partner", "RevenueShare", "Launch"] },
  { id: "3", title: "Liquidity Partner Needed", duration: "10d: 28m: 34s", age: "3d", by: "@YourHandle", payment: "Revenue share", price: "-", tags: ["Liquidity", "Partner", "RevenueShare", "Launch"] },
  { id: "4", title: "Liquidity Partner Needed", duration: "10d: 28m: 34s", age: "3d", by: "@YourHandle", payment: "Revenue share", price: "-", tags: ["Liquidity", "Partner", "RevenueShare", "Launch"] },
];

const isFeatured = (ad: { featuredPlacement?: boolean; featuredUntil?: string | null }) => {
  if (ad?.featuredPlacement) return true;
  if (!ad?.featuredUntil) return false;
  const ts = new Date(ad.featuredUntil).getTime();
  return Number.isFinite(ts) && ts > Date.now();
};

const formatCountdown = (dateStr?: string | null, nowTs?: number) => {
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
};

const getDaysAgo = (dateStr?: string | null) => {
  if (!dateStr) return null;
  const ts = new Date(dateStr).getTime();
  if (!Number.isFinite(ts)) return null;
  const diff = Date.now() - ts;
  if (diff < 0) return 0;
  return Math.floor(diff / 86400000);
};

const BOOST_TAGS = [
  {
    id: "autoBump",
    label: "Auto-Bump",
    color: "#D57300",
    Icon: RefreshCw,
    matches: (ad: MarketplaceAd) =>
      typeof ad.autoBumpDays === "number" && ad.autoBumpDays > 0,
  },
  {
    id: "spotlight",
    label: "Spotlight",
    color: "#BE9500",
    Icon: Sparkles,
    matches: (ad: MarketplaceAd) => !!ad.homepageSpotlight,
  },
  {
    id: "urgent",
    label: "Urgent",
    color: "#AD0516",
    Icon: Zap,
    matches: (ad: MarketplaceAd) => !!ad.urgentTag,
  },
  {
    id: "multichain",
    label: "Multi-Chain",
    color: "#008F72",
    Icon: Globe2,
    matches: (ad: MarketplaceAd) => !!ad.multiChainTag,
  },
] as const;

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<Category>("trending");
  const [searchTerm, setSearchTerm] = useState('');
  const [marketTab, setMarketTab] = useState<'forYou' | 'new' | 'trending'>('trending');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [adFilters, setAdFilters] = useState<MarketplaceAdFilters>(EMPTY_MARKETPLACE_FILTERS);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const handleMarketTabChange = (next: Category) => {
    setCategory(next);
    setMarketTab(next === "for-you" ? "forYou" : next);
  };

  const [now, setNow] = useState(() => Date.now());

  const feedQuery = useMarketplaceFeedQuery(marketTab);
  const publicAds = (feedQuery.data ?? []) as MarketplaceAd[];

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const toCloudFrontUrl = (url?: string | null) => {
    if (!url || typeof url !== 'string') return undefined;
    if (url.includes('cloudfront.net')) return url;
    if (url.includes('/api/v1/images/view/')) {
      const match = url.match(/\/api\/v1\/images\/view\/(.+)$/);
      if (match) {
        const imagePath = match[1].split('?')[0];
        return getCloudFrontUrl(imagePath);
      }
    }
    if (url.includes('user-uploads/')) return getCloudFrontUrl(url);
    return url;
  };

  const orderedAds = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const list = publicAds.filter((ad) => {
      const title = (ad.title || '').toLowerCase();
      const category = (ad.category || '').toLowerCase();
      const sub = (ad.subCategory || '').toLowerCase();
      const role = (ad.offerType || '').toLowerCase();
      const matchesQuery = !query || title.includes(query) || category.includes(query) || sub.includes(query);
      const matchesRole = !roleFilter || role === roleFilter.toLowerCase();
      const matchesFilters = matchesMarketplaceFilters(ad, adFilters);
      const matchesCategory = matchesCategorySelection(
        ad,
        selectedCategoryId,
        selectedSubcategory,
      );
      return matchesQuery && matchesRole && matchesFilters && matchesCategory;
    });
    return list.sort((a, b) => {
      if (marketTab === 'trending') {
        const scoreA = (a.messageCount || 0) * 3 + (a.viewCount || 0);
        const scoreB = (b.messageCount || 0) * 3 + (b.viewCount || 0);
        if (scoreA !== scoreB) return scoreB - scoreA;
      }
      const aFeatured = isFeatured(a);
      const bFeatured = isFeatured(b);
      if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
      const aSpot = !!a.homepageSpotlight;
      const bSpot = !!b.homepageSpotlight;
      if (aSpot !== bSpot) return aSpot ? -1 : 1;
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [publicAds, searchTerm, roleFilter, adFilters, selectedCategoryId, selectedSubcategory, marketTab]);

  return (
    <div>
      <section className='relative bg-[url("/orbital.png")] bg-[#000000BD] h-[225px] bg-cover bg-center bg-no-repeat overflow-hidden'>
        {/* Drop shadow at bottom, fading up to middle */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none bg-gradient-to-t from-black to-transparent"
          aria-hidden
        />
        <Image
          src="/Group 1597882505.png"
          alt="group"
          width={100}
          height={100}
          className="sm:hidden absolute w-full h-[400px] bottom-0 left-0"
        />

        <div className="relative z-10 my-10 flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-[40px] text-left sm:text-center text-wrap max-w-[506px] leading-[120%]">
          Need to Rebuild?
          </h1>
          <p className="text-lg text-left sm:text-center text-[#FFFFFFCC] text-wrap max-w-[606px] mx-auto">
            Find and connect with talent, you need to revive your CTO
          </p>
          <Button className="cta-gradient" asChild>
            <Link href="/marketplace/post-ad"><Plus /> Post an ad</Link>
          </Button>
        </div>
      </section>

      <section className="md:mx-15 xly:mx-25 mx-5">
        {feedQuery.isError && (
          <div
            className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-200/90"
            role="alert"
          >
            <span>{t("marketplace.adsError")}</span>
            <button
              type="button"
              className="shrink-0 rounded-md border border-red-400/40 px-2 py-1 text-xs font-medium hover:bg-red-500/20"
              onClick={() => feedQuery.refetch()}
            >
              {t("common.retry")}
            </button>
          </div>
        )}
        {feedQuery.isPending && feedQuery.data === undefined && !feedQuery.isError && (
          <p className="mt-4 text-sm text-white/60" aria-live="polite">
            {t("marketplace.loadingAds")}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <MarketplaceCategoryDropdowns
              categoryId={selectedCategoryId}
              subcategory={selectedSubcategory}
              onCategoryChange={setSelectedCategoryId}
              onSubcategoryChange={setSelectedSubcategory}
            />
            <MarketplaceTrendingFilter
              selected={category}
              onChange={handleMarketTabChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="border-[0.2px] bg-white/3 pl-7 max-w-50 placeholder:font-medium border-[#FFFFFF20] text-white placeholder:text-[#FFFFFF80] focus:!border-[0.2px] focus:!border-white focus-visible:ring-0"
                placeholder="search for an Ad"
              />
              <Search size={16} color="#FFFFFF50" className="absolute left-2" />
            </div>

            <MarketplaceAdsFilter value={adFilters} onChange={setAdFilters} />
          </div>
        </div>

        {/* <div className="flex items-center gap-2 overflow-x-auto hover-scrollbar mb-8">
          {roles.map((role) => (
            <button
            onClick={() => setRoleFilter(roleFilter === role ? '' : role)} 
            key={role} className={`rounded-[20px] p-2 border min-w-fit border-white/20 ${roleFilter === role ? 'bg-white text-black' : 'bg-white/8 text-white'}`}>
              {role}
            </button>
          ))}
        </div> */}

        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 justify-items-stretch mb-2">
          {orderedAds.map((ad, index) => {
            const imageUrl =
            toCloudFrontUrl((Array.isArray(ad.images) ? ad.images[0] : undefined)) ||
            `${MARKETPLACE_ASSET_BASE}/ads-thumbnail.png`;
          const postedDays = getDaysAgo(ad.createdAt != null ? String(ad.createdAt) : undefined);
          const expiryCountdown = formatCountdown(ad.expiresAt, now);
          const featuredCountdown = formatCountdown(ad.featuredUntil, now);
          // const spotlight = !!ad.homepageSpotlight;
          // const featured = isFeatured(ad);

          return (
            <Link
              key={ad.id ?? String(index)}
              href={`/marketplace/${ad.id ?? ''}`}
              className="w-full min-w-0 rounded-lg border border-white/10 overflow-hidden block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
          <div className="relative aspect-[4/3]">
            <div className="absolute top-2.5 flex items-center gap-1 px-2 py-1 text-xs text-[#FFCB45B2]">
              <Clock className="h-3.5 w-3.5" />
              <span>{expiryCountdown}</span>
            </div>
            {/* <div className="absolute top-0 right-0 h-5.5 w-10 rounded-bl-lg bg-[#892BFF]/20 flex items-center justify-center">
              <BadgeCheck color="#892BFF" className="h-4 w-4 text-white" />
            </div> */}
            <div className="absolute top-2.5 right-2 z-10 flex items-end gap-1">
              {BOOST_TAGS.filter((tag) => tag.matches(ad)).map(({ id, label, color, Icon }) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium"
                  style={{                     color,
                    borderColor: color,
                    backgroundColor: `${color}33`,
                  }}
                >
                  <Icon className="h-3 w-3" strokeWidth={2} />
                  {label}
                </span>
              ))}
            </div>
            <div className="absolute top-10 w-full h-full px-2.5 rounded-[6px]">
            <Image className="w-full h-full object-cover rounded-[6px]" src={imageUrl} alt={ad.title ?? 'Ad'} width={600} height={600} />
            </div>
          </div>
          <div className="p-2.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-white truncate flex-1">{ad.title}</h3>
              <button
                type="button"
                className="text-white/60 hover:text-white p-1"
                aria-label="More options"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-between">
            <p className="text-lg text-white">{ad.title} <sup className="text-xs text-white/50">{postedDays}d ago</sup></p>
            <button
              type="button"
              className="text-white hover:text-white p-1"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVertical className="h-5 w-5" />
            </button>
            </div>
            <p className="text-sm text-white/60">by <span className="text-white hover:underline break-all text-sm">{String(ad.user.name ?? '')}</span></p>
            <p className="text-sm text-white/50"><span className="text-white">{t("marketplace.skillNeeded")}:</span> {String(ad.category ?? 'Marketplace')} | {String(ad.subCategory ?? ad.category ?? 'General')}</p>
            <div className="pt-5 bg-[#060708] px-5 py-4 flex items-center justify-between">
              <div className="text-center w-1/2 border-r border-white/10">
              <p className="text-xs text-white/60 mb-2">{t("marketplace.payment")}</p>
              <p className="text-xs text-white/80">{String(ad.priceCurrency ?? '')}</p>
              </div>
              <div className="text-center w-1/2">
              <p className="text-xs text-white/60 mb-2">{t("marketplace.price")}</p>
              <p className="text-xs text-white/80">{ad.priceAmount != null ? String(ad.priceAmount) : ''}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-4">
              {(ad.tags ?? []).map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-[4px] bg-white/10 p-2 text-[10px] text-white"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
            </Link>
          )
          })}
        </div>
      </section>
    </div>
  );
}

