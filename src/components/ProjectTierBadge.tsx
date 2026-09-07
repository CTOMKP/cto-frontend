"use client";

import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const PROJECT_TIER_META = {
  seed: {
    name: "Seed",
    icon: "/project-categories/seed.png",
    bg: "bg-[#6D6D6D]/20",
    description:
      "Entry-level tier, 14-21 days old with minimal liquidity and early activity",
    lp: ">$10,000",
    lpLockBurn: ">30% / 6mo",
  },
  sprout: {
    name: "Sprout",
    icon: "/project-categories/sprout.png",
    bg: "bg-[#FF5900]/20",
    description:
      "Mid-level tier, >21 days old, with moderate liquidity and stability",
    lp: ">$20,000",
    lpLockBurn: ">30% / 18mo",
  },
  bloom: {
    name: "Bloom",
    icon: "/project-categories/bloom.png",
    bg: "bg-[#15FF00]/20",
    description:
      "Premium tier, >1 month old, with significant liquidity and security",
    lp: ">$50,000",
    lpLockBurn: ">30% / 24mo",
  },
  stellar: {
    name: "Stellar",
    icon: "/project-categories/stellar.png",
    bg: "bg-[#FFBB00]/20",
    description:
      "Elite tier, >1 month old, with significant liquidity and security",
    lp: ">$100,000",
    lpLockBurn: ">30% / 36mo",
  },
} as const;

export type ProjectTierKey = keyof typeof PROJECT_TIER_META;

function isPlaceholderTier(value: string) {
  return (
    value === "none" ||
    value === "null" ||
    value === "undefined" ||
    value === "" ||
    value === "—" ||
    value === "n/a" ||
    value === "na" ||
    value.startsWith("---") ||
    /^[-—]+$/.test(value)
  );
}

export function normalizeProjectTier(raw: unknown): ProjectTierKey | null {
  if (raw == null) return null;
  const value = String(raw).trim().toLowerCase();
  if (isPlaceholderTier(value)) return null;
  if (value in PROJECT_TIER_META) return value as ProjectTierKey;
  if (value.includes("bloom") || value.includes("flower") || value.includes("premium")) {
    return "bloom";
  }
  if (value.includes("sprout")) return "sprout";
  if (value.includes("stellar")) return "stellar";
  if (value.includes("seed")) return "seed";
  return null;
}

function TierIcon({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className="object-contain"
    />
  );
}

export default function ProjectTierBadge({
  tier,
  iconSize = 9,
}: {
  tier?: string | null;
  iconSize?: number;
}) {
  const key = normalizeProjectTier(tier);
  if (!key) return null;
  const meta = PROJECT_TIER_META[key];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`${meta.bg} inline-flex rounded-[4px] p-[3px] cursor-help`}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <TierIcon src={meta.icon} alt={meta.name} size={iconSize} />
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={6}
        className="z-[80] bg-[#010101] p-2 rounded-lg border-[0.5px] border-white max-w-[200px] text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-white">{meta.name}</span>
          <span className={`${meta.bg} inline-flex rounded-[4px] p-[3px]`}>
            <TierIcon src={meta.icon} alt={meta.name} size={16} />
          </span>
        </div>
        <p className="mt-1 w-full text-xs font-medium text-white/70 text-wrap">
          {meta.description}
        </p>
        <div className="mt-1 flex flex-col gap-0.5 text-xs font-medium text-white/70">
          <span className="flex items-center justify-between gap-4">
            <span>Lp:</span>
            <span>{meta.lp}</span>
          </span>
          <span className="flex items-center justify-between gap-4">
            <span>Lp lock/burn:</span>
            <span>{meta.lpLockBurn}</span>
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
