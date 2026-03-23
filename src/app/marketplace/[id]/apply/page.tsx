/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import marketplaceService from "@/services/marketplaceService";
import messagesService from "@/services/messagesService";
import { PartyPopper } from "lucide-react";

type MarketplaceAdUser = {
  id: number;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

type MarketplaceAd = {
  id: string;
  title: string;
  priceCurrency: string | null;
  priceAmount: number | null;
  chain: string | null;
  createdAt: string;
  user?: MarketplaceAdUser;
};

function daysAgo(iso: string): number | null {
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return null;
  const diff = Date.now() - ts;
  if (diff < 0) return 0;
  return Math.floor(diff / 86400000);
}

export default function MarketplaceAdApplyPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const [ad, setAd] = useState<MarketplaceAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [coverLetter, setCoverLetter] = useState("");
  const coverRef = useRef<HTMLTextAreaElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing ad id");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    marketplaceService
      .getPublicAd(id)
      .then((data) => {
        if (cancelled) return;
        if (!data || typeof data !== "object") {
          setError("Ad not found");
          return;
        }
        const d = data as Record<string, unknown>;
        setAd({
          id: String(d.id ?? id),
          title: String(d.title ?? "Untitled"),
          priceCurrency: d.priceCurrency != null ? String(d.priceCurrency) : null,
          priceAmount:
            d.priceAmount == null ? null : Number(d.priceAmount as number),
          chain: d.chain != null ? String(d.chain) : null,
          createdAt: String(d.createdAt ?? new Date().toISOString()),
          user: d.user && typeof d.user === "object" ? (d.user as MarketplaceAdUser) : undefined,
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load ad");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const posted = useMemo(() => (ad?.createdAt ? daysAgo(ad.createdAt) : null), [ad?.createdAt]);
  const paymentLabel = useMemo(() => {
    if (!ad) return "—";
    if (ad.priceCurrency && ad.priceAmount != null) return `${ad.priceAmount} ${ad.priceCurrency}`;
    if (ad.priceCurrency) return ad.priceCurrency;
    return "—";
  }, [ad]);
  const chainLabel = useMemo(() => {
    const c = (ad?.chain ?? "").trim();
    if (!c) return "—";
    return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
  }, [ad?.chain]);

  const coverLen = coverLetter.trim().length;
  const coverValid = coverLen >= 500;

  const onSubmit = () => {
    if (!coverValid) {
      coverRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      coverRef.current?.focus();
      return;
    }

    if (!ad) return;

    setSubmitting(true);
    setError(null);
    messagesService
      .apply(id, coverLetter)
      .then((res) => {
        // Try to extract thread id in a backend-agnostic way.
        const obj = (res && typeof res === "object" ? res : null) as
          | Record<string, unknown>
          | null;
        const data = obj?.data && typeof obj.data === "object" ? (obj.data as Record<string, unknown>) : null;

        const nextThreadId =
          obj?.threadId ??
          obj?.id ??
          data?.threadId ??
          data?.id ??
          null;

        setThreadId(nextThreadId != null ? String(nextThreadId) : null);
        setApplicationSuccess(true);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to submit application");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-white/70">Loading...</p>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-white/70">{error || "Ad not found."}</p>
        <Button onClick={() => router.back()} variant="outline" className="border-white/20 text-white hover:bg-white/10">
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            type="button"
            variant="ghost"
            className="text-white/70 hover:text-white"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>

        <h1 className="text-center text-xl sm:text-2xl font-semibold mb-6">
          Reply to {ad.title}
        </h1>

        <div className="rounded-[20px] border-2 border-[#868686]/19 bg-black/40 py-15 px-25">
          {!applicationSuccess ? (
            <>
              <div className="text-sm text-[#FF9631] mb-10">You&apos;re responding to</div>

              <div className="space-y-5 text-sm text-white/80">
                <div className="text-white text-base font-medium">&quot;{ad.title}&quot;</div>
                <div>Payment: {paymentLabel}</div>
                <div>Chain: {chainLabel}</div>
                <div>Posted: {posted != null ? `${posted} days ago` : "—"}</div>
              </div>

              <div className="border-t border-[#2F2F2F] my-10" />

              <div className="space-y-2">
                <div className="text-sm text-white/90">Cover Letter</div>
                <Textarea
                  ref={coverRef}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you a good fit for this role?"
                  className="min-h-[120px] bg-[#141414] border-0 text-white placeholder:text-white/70"
                />
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{coverLen}/500</span>
                  <span className={coverValid ? "text-white/50" : "text-[#FF9631]"}>
                    Minimum of 500 characters, required
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  onClick={onSubmit}
                  className="cta-gradient px-8"
                  disabled={!coverValid || submitting}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-6">
              {/* <PartyPopper className="h-10 w-10 text-[#FFCB45]" /> */}
              <span className="text-[60px]">🎉</span>

              <div className="text-2xl font-bold text-white">Message Delivered</div>

              <div className="text-sm text-white/80 leading-relaxed max-w-md">
                Your Message Has Been Sent To{" "}
                <span className="text-white font-semibold">
                  {ad.user?.name ?? "Poster"}
                </span>{" "}
                Watch Your Inbox For A Reply
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/marketplace">Browse more listing</Link>
                </Button>

                <Button
                  type="button"
                  className="cta-gradient text-white hover:bg-white/90"
                  asChild
                >
                  <Link href={threadId ? `/messages/${threadId}` : "/messages"}>
                    View message
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
