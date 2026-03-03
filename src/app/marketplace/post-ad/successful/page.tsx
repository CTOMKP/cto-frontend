"use client";

import React, { useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Copy, MoreHorizontal, Clock, BadgeCheck, PartyPopper, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function PostAdSuccessContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "your-listing";
  const title = searchParams.get("title") || "Your ad";
  const listingUrl = useMemo(() => {
    if (typeof window === "undefined") return `https://ctomarketplace.com/listing/${slug}`;
    return `${window.location.origin}/listing/${slug}`;
  }, [slug]);

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
              aria-label="Share on X"
            >
              <Image src="/social-icons/facebook-meta.svg" alt="Export Link" width={20} height={20} />
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
              <span>10d: 28m: 34s</span>
            </div>
            <div className="absolute top-0 right-0 h-5.5 w-10 rounded-bl-lg bg-[#892BFF]/20 flex items-center justify-center">
              <BadgeCheck color="#892BFF" className="h-4 w-4 text-white" />
            </div>
            <div className="absolute top-10 w-full h-full px-2.5 rounded-[6px]">
            <Image className="w-full h-full object-cover rounded-[6px]" src="/space-thumbnail.png" alt="Ad Image" width={600} height={600} />
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
            <p className="text-lg text-white">Liquidity Partner Needed <sup className="text-xs text-white/50">3d</sup></p>
            <button type="button" className="text-white hover:text-white p-1">
              <EllipsisVertical className="h-5 w-5" />
            </button>
            </div>
            <p className="text-sm text-white/60">by <span className="text-white hover:underline break-all text-sm">@YourHandle</span></p>
            <p className="text-sm text-white/50"><span className="text-white">Skill needed:</span> None</p>
            <div className="pt-5 bg-[#060708] px-5 py-4 flex items-center justify-between">
              <div className="text-center w-1/2 border-r border-white/10">
              <p className="text-xs text-white/60 mb-2">Payment</p>
              <p className="text-xs text-white/80">Revenue share</p>
              </div>
              <div className="text-center w-1/2">
              <p className="text-xs text-white/60 mb-2">Price</p>
              <p className="text-xs text-white/80">-</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-4">
              {["Liquidity", "Partner", "RevenueShare", "Launch"].map((tag) => (
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

export default function PostAdSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">Loading...</div>}>
      <PostAdSuccessContent />
    </Suspense>
  );
}
