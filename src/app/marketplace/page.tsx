"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useMarketplaceFeedQuery } from "@/hooks/useMarketplaceFeedQuery";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
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
import MarketplaceAdCard from "./features/MarketplaceAdCard";
import { isFeatured, type MarketplaceAd } from "./features/marketplaceAd";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export type { MarketplaceAd } from "./features/marketplaceAd";

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
          {orderedAds.map((ad, index) => (
            <MarketplaceAdCard key={ad.id ?? String(index)} ad={ad} now={now} />
          ))}
        </div>
      </section>
    </div>
  );
}

