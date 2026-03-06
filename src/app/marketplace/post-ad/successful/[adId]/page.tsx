"use client";

import React, { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Copy, MoreHorizontal, Clock, BadgeCheck, PartyPopper, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import marketplaceService from "@/services/marketplaceService";
import { MarketplaceAd } from "@/app/marketplace/page";
import { getCloudFrontUrl } from "@/utils/helper/image-url-helper";

const MARKETPLACE_ASSET_BASE = "/marketplace";

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

function PostAdSuccessWithAdContent() {
  const params = useParams();
  const adId = typeof params?.adId === "string" ? params.adId : "";
  const [ad, setAd] = useState<MarketplaceAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!adId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    marketplaceService
      .listMine()
      .then((items) => {
        if (cancelled) return;
        const list = Array.isArray(items) ? items : [];
        const match = list.find(
          (item) => item && typeof item === "object" && "id" in item && (item as any).id === adId,
        );
        if (match) {
          setAd(match);
        } else {
          setError("Ad not found");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load ad");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adId]);

  console.log(ad)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const title = (ad?.title as string) || "Your ad";

  const listingUrl = useMemo(() => {
    if (typeof window === "undefined") return `https://ctomarketplace.com/marketplace/${adId}`;
    return `${window.location.origin}/marketplace/${adId}`;
  }, [adId]);

  const copyLink = () => {
    navigator.clipboard.writeText(listingUrl);
  };

  const shareReddit = () => {
    const url = `https://reddit.com/submit?url=${encodeURIComponent(listingUrl)}&title=${encodeURIComponent(title)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareX = () => {
    const text = encodeURIComponent(`${title} ${listingUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const imageUrl =
    toCloudFrontUrl(Array.isArray(ad?.images) && ad.images.length > 0 ? ad.images[0] : null) ||
    `${MARKETPLACE_ASSET_BASE}/ads-thumbnail.png`;
  const postedDays = getDaysAgo(ad?.createdAt ?? null);
  const expiryCountdown = formatCountdown(ad?.expiresAt ?? null, now);
  const tags = Array.isArray(ad?.tags) ? (ad.tags as string[]) : ["Liquidity", "Partner", "RevenueShare", "Launch"];

  if (!adId) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <p className="text-white/70">Missing ad ID.</p>
        <Button asChild className="ml-4">
          <Link href="/marketplace/post-ad">Post an ad</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <p className="text-white/70">Loading your ad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-white/70">{error}</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/marketplace">Back to Marketplace</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Link href="/marketplace/post-ad">Post another ad</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <h1 className="text-center text-2xl font-bold text-white pt-19 pb-15">
        You&apos;re Live
      </h1>

      <div className="max-w-5xl bg-[#010101] border border-[#86868630] mx-auto md:px-25 md:py-15 px-5 py-5 rounded-[20px] pb-16 flex flex-col lg:flex-row gap-8 items-center justify-center">
        <div className="w-full max-w-lg flex flex-col items-center text-center space-y-3">
          <div className="rounded-full bg-[#304841] size-25 flex items-center justify-center">
            <PartyPopper className="h-14 w-14 text-teal-400" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-white">You&apos;re Live</h2>
          <a
            href={listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6584FF] hover:underline break-all text-sm"
          >
            {listingUrl}
          </a>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={shareReddit}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Share on Reddit"
            >
              <Image src="/social-icons/reddit.svg" alt="Reddit" width={20} height={20} />
            </button>
            <button
              type="button"
              onClick={shareX}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Share on X"
            >
              <Image src="/social-icons/x.svg" alt="X" width={20} height={20} />
            </button>
            <button
              type="button"
              onClick={shareX}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Share on Facebook"
            >
              <Image src="/social-icons/facebook-meta.svg" alt="Facebook" width={20} height={20} />
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Copy link"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
          <div className="rounded-xl bg-[#353535] border border-white/10 p-2.5 text-center">
            <p className="text-sm text-white">
              Bumped Ads Get 3x More DMs In The First 24 Hours
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm rounded-lg border border-white/10 overflow-hidden shrink-0">
          <div className="relative aspect-[4/3]">
            <div className="absolute top-0 left-0 flex border-[0.5px] border-white/20 rounded-br-lg rounded-tl-lg items-center gap-1 bg-[#FFCB450A] px-2 py-1 text-xs text-[#FFCB45B2]">
              <Clock className="h-3.5 w-3.5" />
              <span>{expiryCountdown}</span>
            </div>
            <div className="absolute top-0 right-0 h-5.5 w-10 rounded-bl-lg bg-[#892BFF]/20 flex items-center justify-center">
              <BadgeCheck color="#892BFF" className="h-4 w-4 text-white" />
            </div>
            <div className="absolute top-10 w-full h-full px-2.5 rounded-[6px]">
              <Image
                className="w-full h-full object-cover rounded-[6px]"
                src={imageUrl}
                alt={title}
                width={600}
                height={600}
                unoptimized={imageUrl.startsWith("http")}
              />
            </div>
          </div>
          <div className="p-2.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-white truncate flex-1">{title}</h3>
              <button
                type="button"
                className="text-white/60 hover:text-white p-1"
                aria-label="More options"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg text-white">
                {(ad?.category as string) || (ad?.subCategory as string) || "Ad"}{" "}
                <sup className="text-xs text-white/50">{postedDays != null ? `${postedDays}d ago` : ""}</sup>
              </p>
              <button type="button" className="text-white hover:text-white p-1">
                <EllipsisVertical className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-white/60">
              by <span className="text-white hover:underline break-all text-sm">You</span>
            </p>
            <p className="text-sm text-white/50">
              <span className="text-white">Skill needed:</span> {(ad?.offerType as string) || "None"}
            </p>
            <div className="pt-5 bg-[#060708] px-5 py-4 flex items-center justify-between">
              <div className="text-center w-1/2 border-r border-white/10">
                <p className="text-xs text-white/60 mb-2">Payment</p>
                <p className="text-xs text-white/80">{ad?.priceCurrency}</p>
              </div>
              <div className="text-center w-1/2">
                <p className="text-xs text-white/60 mb-2">Price</p>
                <p className="text-xs text-white/80">{ad?.priceAmount}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-4">
              {ad?.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[4px] bg-white/10 p-2 text-[10px] text-white"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 pb-12 mt-10">
        <Button asChild className="bg-white cta-gradient text-white hover:bg-white/90">
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          <Link href="/marketplace/post-ad">Post another ad</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PostAdSuccessByAdIdPage() {
  return <PostAdSuccessWithAdContent />;
}
