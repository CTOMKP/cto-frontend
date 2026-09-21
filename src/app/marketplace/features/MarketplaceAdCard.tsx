"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, EllipsisVertical, Globe2, MoreHorizontal, RefreshCw, Sparkles, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MARKETPLACE_ASSET_BASE,
  formatCountdown,
  getDaysAgo,
  toCloudFrontUrl,
  resolveMarketplacePostType,
  type MarketplaceAd,
} from "./marketplaceAd";

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

function postTypeBadge(ad: MarketplaceAd) {
  if (resolveMarketplacePostType(ad) === "OFFERING") {
    return { label: "Offering", color: "#0FFFBB" };
  }
  return { label: "Looking for", color: "#FF4A15" };
}

export default function MarketplaceAdCard({
  ad,
  now,
}: {
  ad: MarketplaceAd;
  now: number;
}) {
  const { t } = useTranslation();
  const imageUrl =
    toCloudFrontUrl(Array.isArray(ad.images) ? ad.images[0] : undefined) ||
    `${MARKETPLACE_ASSET_BASE}/ads-thumbnail.png`;
  const postedDays = getDaysAgo(ad.createdAt != null ? String(ad.createdAt) : undefined);
  const expiryCountdown = formatCountdown(ad.expiresAt, now);
  const typeBadge = postTypeBadge(ad);

  return (
    <Link
      href={`/marketplace/${ad.id ?? ""}`}
      className="flex h-full w-full max-w-[370px] min-w-0 flex-col rounded-lg border border-white/10 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
        <div className="absolute inset-0 px-2.5 pt-10 pb-2.5">
          <Image
            className="h-full w-full rounded-[6px] object-cover"
            src={imageUrl}
            alt={ad.title ?? "Ad"}
            width={600}
            height={600}
          />
        </div>
        <div className="absolute top-2.5 z-10 flex items-center gap-1 px-2 py-1 text-xs text-[#FFCB45B2]">
          <Clock className="h-3.5 w-3.5" />
          <span>{expiryCountdown}</span>
        </div>
        <div className="absolute top-2.5 right-2 z-10 flex items-end gap-1">
          {BOOST_TAGS.filter((tag) => tag.matches(ad)).map(({ id, label, color, Icon }) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium"
              style={{
                color,
                borderColor: color,
                backgroundColor: `${color}33`,
              }}
            >
              <Icon className="h-3 w-3" strokeWidth={2} />
              {label}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/80 to-transparent" />
        <span
          className="absolute bottom-3 left-3 z-20 inline-flex h-6 w-fit items-center rounded-full border bg-black/80 px-2 text-[12px] font-medium"
          style={{
            color: typeBadge.color,
            borderColor: typeBadge.color,
          }}
        >
          {typeBadge.label}
        </span>
      </div>
      <div className="relative z-10 flex flex-1 flex-col space-y-2 bg-[#010101] p-2.5 min-h-0">
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg text-white truncate min-w-0 flex-1">
            {ad.title} <sup className="text-xs text-white/50">{postedDays}d ago</sup>
          </p>
          <button
            type="button"
            className="text-white hover:text-white p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-white/60 truncate">
          by{" "}
          <span className="text-white hover:underline text-sm">
            {String(ad.user?.name ?? "")}
          </span>
        </p>
        <p className="text-sm text-white/50 truncate">
          <span className="text-white">{t("marketplace.skillNeeded")}:</span>{" "}
          {String(ad.category ?? "Marketplace")} | {String(ad.subCategory ?? ad.category ?? "General")}
        </p>
        <div className="mt-auto pt-5 bg-[#060708] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="text-center w-1/2 border-r border-white/10">
            <p className="text-xs text-white/60 mb-2">{t("marketplace.payment")}</p>
            <p className="text-xs text-white/80">{String(ad.priceCurrency ?? "")}</p>
          </div>
          <div className="text-center w-1/2">
            <p className="text-xs text-white/60 mb-2">{t("marketplace.price")}</p>
            <p className="text-xs text-white/80">
              {ad.priceAmount != null ? String(ad.priceAmount) : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-4 overflow-hidden shrink-0">
          {(ad.tags ?? []).map((tag: string) => (
            <span key={tag} className="rounded-[4px] bg-white/10 p-2 text-[10px] text-white">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
