"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, BadgeCheck, MoreHorizontal, EllipsisVertical } from "lucide-react";
import marketplaceService from "@/services/marketplaceService";
import { getCloudFrontUrl } from "@/utils/helper/image-url-helper";

const MARKETPLACE_ASSET_BASE = "/marketplace";

const formatCountdown = (dateStr?: string | null, nowTs?: number) => {
  if (!dateStr) return "—";
  const target = new Date(dateStr).getTime();
  if (!Number.isFinite(target)) return "—";
  const now = typeof nowTs === "number" ? nowTs : Date.now();
  const diff = target - now;
  if (diff <= 0) return "Expired";
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

const toCloudFrontUrl = (url?: string | null) => {
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
};

export interface MyAdItem {
  id: string;
  userId?: number;
  postType?: string;
  category?: string;
  subCategory?: string;
  title?: string;
  description?: string;
  tags?: string[];
  contactInfo?: unknown;
  chain?: string;
  offerType?: string;
  priceAmount?: number;
  priceCurrency?: string;
  images?: string[];
  imageCount?: number;
  tier?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string | null;
  featuredUntil?: string | null;
  [key: string]: unknown;
}

export default function MyAdsTab() {
  const [ads, setAds] = useState<MyAdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    marketplaceService
      .listMine()
      .then((result) => {
        if (cancelled) return;
        const list = Array.isArray(result) ? result : [];
        setAds(list as MyAdItem[]);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load ads");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="py-6 text-sm text-white/70">
        Loading my ads...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="py-8 text-sm text-white/60">
        You haven’t posted any ads yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center sm:justify-items-stretch mb-2">
      {ads.map((ad) => {
        const imageUrl =
          toCloudFrontUrl(ad.images?.[0]) ||
          `${MARKETPLACE_ASSET_BASE}/ads-thumbnail.png`;
        const postedDays = getDaysAgo(ad.createdAt);
        const expiryCountdown = formatCountdown(ad.expiresAt, now);
        const tags = Array.isArray(ad.tags) ? ad.tags : [];
        const displayTitle = (ad.title || "").trim() || "Untitled";

const DRAFT_EDIT_KEY = "marketplace_edit_draft";

        return (
          <Link
            key={ad.id}
            href={ad.status === "DRAFT" ? "/marketplace/post-ad" : `/marketplace/${ad.id}`}
            onClick={
              ad.status === "DRAFT"
                ? () => {
                    try {
                      sessionStorage.setItem(DRAFT_EDIT_KEY, JSON.stringify(ad));
                    } catch (_) {}
                  }
                : undefined
            }
            className="w-full max-w-sm rounded-lg border border-white/10 overflow-hidden shrink-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <div className="relative aspect-[4/3]">
              <div className="absolute top-0 left-0 flex border-[0.5px] border-white/20 rounded-br-lg rounded-tl-lg items-center gap-1 bg-[#FFCB450A] px-2 py-1 text-xs text-[#FFCB45B2]">
                <Clock className="h-3.5 w-3.5" />
                <span>{expiryCountdown}</span>
              </div>
              <div className="absolute top-0 right-0 h-5.5 w-10 rounded-bl-lg bg-[#892BFF]/20 flex items-center justify-center">
                <BadgeCheck color="#892BFF" className="h-4 w-4 text-white" />
              </div>
              <div className="absolute inset-0 pt-10 px-2.5 pb-2.5">
                <div className="relative w-full h-full rounded-[6px] overflow-hidden">
                  <Image
                    className="w-full h-full object-cover"
                    src={imageUrl}
                    alt={displayTitle}
                    width={600}
                    height={600}
                    unoptimized={imageUrl.startsWith("http")}
                  />
                  {ad.status && ad.status !== "LIVE" && (
                    <div className="absolute bottom-2 left-2 z-10 rounded px-2 py-0.5 text-[10px] font-medium bg-black/70 text-white/90 capitalize">
                      {ad.status.replace(/_/g, " ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-2.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white truncate flex-1">
                  {displayTitle}
                </h3>
                <button
                  type="button"
                  className="text-white/60 hover:text-white p-1"
                  aria-label="More options"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg text-white">
                  {displayTitle}{" "}
                  <sup className="text-xs text-white/50">
                    {postedDays != null ? `${postedDays}d ago` : "—"}
                  </sup>
                </p>
                <button
                  type="button"
                  className="text-white hover:text-white p-1"
                  onClick={(e) => e.preventDefault()}
                >
                  <EllipsisVertical className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-white/60">
                by <span className="text-white break-all text-sm">You</span>
              </p>
              <p className="text-sm text-white/50">
                <span className="text-white">Skill needed:</span>{" "}
                {ad.category || "Marketplace"} |{" "}
                {ad.subCategory || ad.category || "General"}
              </p>
              <div className="pt-5 bg-[#060708] px-5 py-4 flex items-center justify-between">
                <div className="text-center w-1/2 border-r border-white/10">
                  <p className="text-xs text-white/60 mb-2">Payment</p>
                  <p className="text-xs text-white/80">
                    {ad.priceCurrency ?? "—"}
                  </p>
                </div>
                <div className="text-center w-1/2">
                  <p className="text-xs text-white/60 mb-2">Price</p>
                  <p className="text-xs text-white/80">
                    {ad.priceAmount != null && ad.priceAmount > 0
                      ? String(ad.priceAmount)
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-4">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[4px] bg-white/10 p-2 text-[10px] text-white"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-white/40">No tags</span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
