"use client";

import { ListFilter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Boost / placement filters — mirrors post-ad boostOptions + featured placement */
export type MarketplaceBoostFilter =
  | "urgent"
  | "spotlight"
  | "multichain"
  | "autoBump"
  | "featured";

/** Ad type filters — mirrors post-ad postType */
export type MarketplacePostTypeFilter = "LOOKING_FOR" | "OFFERING";

export type MarketplaceAdFilters = {
  boosts: MarketplaceBoostFilter[];
  postTypes: MarketplacePostTypeFilter[];
};

export const EMPTY_MARKETPLACE_FILTERS: MarketplaceAdFilters = {
  boosts: [],
  postTypes: [],
};

const BOOST_OPTIONS: { id: MarketplaceBoostFilter; label: string }[] = [
  { id: "urgent", label: "Urgent" },
  { id: "spotlight", label: "Spotlight" },
  { id: "multichain", label: "Multichain" },
  { id: "autoBump", label: "Auto bump" },
  { id: "featured", label: "Featured" },
];

const POST_TYPE_OPTIONS: { id: MarketplacePostTypeFilter; label: string }[] = [
  { id: "LOOKING_FOR", label: "Looking for" },
  { id: "OFFERING", label: "Offering" },
];

type MarketplaceAdsFilterProps = {
  value: MarketplaceAdFilters;
  onChange: (next: MarketplaceAdFilters) => void;
};

function toggleInList<T extends string>(list: T[], id: T): T[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function MarketplaceAdsFilter({
  value,
  onChange,
}: MarketplaceAdsFilterProps) {
  const activeCount = value.boosts.length + value.postTypes.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="p-2 bg-white/3 text-sm text-[#FFFFFF80] border-[0.5px] border-[#FFFFFF20] flex items-center gap-1 rounded-lg hover:bg-white/6"
          aria-label="Filter ads"
        >
          <ListFilter size={15} color="#FFFFFF80" />
          <span>Filter</span>
          {activeCount > 0 && (
            <span className="ml-0.5 rounded-full bg-white/15 px-1.5 text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 border-[#FFFFFF20] bg-[#0B0B0E] text-white"
      >
        <DropdownMenuLabel className="text-[#FFFFFF80]">Boost tags</DropdownMenuLabel>
        {BOOST_OPTIONS.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.id}
            checked={value.boosts.includes(opt.id)}
            onCheckedChange={() =>
              onChange({
                ...value,
                boosts: toggleInList(value.boosts, opt.id),
              })
            }
            onSelect={(e) => e.preventDefault()}
            className="text-white focus:bg-white/10 focus:text-white"
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}

        <DropdownMenuSeparator className="bg-[#FFFFFF20]" />
        <DropdownMenuLabel className="text-[#FFFFFF80]">Ad type</DropdownMenuLabel>
        {POST_TYPE_OPTIONS.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.id}
            checked={value.postTypes.includes(opt.id)}
            onCheckedChange={() =>
              onChange({
                ...value,
                postTypes: toggleInList(value.postTypes, opt.id),
              })
            }
            onSelect={(e) => e.preventDefault()}
            className="text-white focus:bg-white/10 focus:text-white"
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}

        {activeCount > 0 && (
          <>
            <DropdownMenuSeparator className="bg-[#FFFFFF20]" />
            <button
              type="button"
              className="w-full px-2 py-1.5 text-left text-xs text-[#FFFFFF80] hover:text-white"
              onClick={() => onChange(EMPTY_MARKETPLACE_FILTERS)}
            >
              Clear filters
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Returns true when the ad matches any of the selected marketplace filters. */
export function matchesMarketplaceFilters(
  ad: {
    urgentTag?: boolean;
    homepageSpotlight?: boolean;
    multiChainTag?: boolean;
    autoBumpDays?: number | null;
    featuredPlacement?: boolean;
    featuredUntil?: string | null;
    postType?: string;
  },
  filters: MarketplaceAdFilters,
): boolean {
  const hasBoostFilters = filters.boosts.length > 0;
  const hasPostTypeFilters = filters.postTypes.length > 0;
  if (!hasBoostFilters && !hasPostTypeFilters) return true;

  const featured =
    !!ad.featuredPlacement ||
    (!!ad.featuredUntil &&
      Number.isFinite(new Date(ad.featuredUntil).getTime()) &&
      new Date(ad.featuredUntil).getTime() > Date.now());

  const flags: Record<MarketplaceBoostFilter, boolean> = {
    urgent: !!ad.urgentTag,
    spotlight: !!ad.homepageSpotlight,
    multichain: !!ad.multiChainTag,
    autoBump: typeof ad.autoBumpDays === "number" && ad.autoBumpDays > 0,
    featured,
  };

  const matchesBoost =
    hasBoostFilters && filters.boosts.some((key) => flags[key]);

  const postType = String(ad.postType || "").toUpperCase();
  const matchesPostType =
    hasPostTypeFilters &&
    filters.postTypes.some((t) => t === postType);

  // Union of matches: show ads that satisfy any selected filter
  return matchesBoost || matchesPostType;
}
