"use client";

import Link from "next/link";
import { CheckCircle2, Zap } from "lucide-react";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserListingDetailQuery } from "@/hooks/useUserListingDetailQuery";
import FiatText from "@/components/FiatText";

type ListingLike = {
  id: string;
  contractAddr: string;
  chain: string;
  title: string;
  description: string;
  status: string;
  vettingTier?: string;
  vettingScore?: number;
  scanMetadata?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  scanSummary?: string | null;
};

const toDateLabel = (value?: string | Date | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
};

const formatNumber = (value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString();
};

const asUsd = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const riskLevelLabel = (score?: number) => {
  if (typeof score !== "number") return "N/A";
  if (score >= 70) return "LOW";
  if (score >= 50) return "MEDIUM";
  return "HIGH";
};

const riskColor = (score?: number) => {
  if (typeof score !== "number") return "#A1A1AA";
  if (score >= 70) return "#16C784";
  if (score >= 50) return "#FFCB45";
  return "#FF4D4F";
};

export default function UserListingLivePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const listQuery = useUserListingDetailQuery(id);
  const loading = listQuery.isPending && listQuery.data === undefined;
  const error = listQuery.isError
    ? listQuery.error instanceof Error
      ? listQuery.error.message
      : "Failed to load approved listing."
    : null;
  const listing = (listQuery.data as ListingLike | null | undefined) ?? null;

  const metadata = useMemo(() => {
    if (!listing) return {};
    return (listing.scanMetadata || listing.metadata || {}) as Record<string, unknown>;
  }, [listing]);

  const summary = useMemo(() => {
    if (!listing) return "";
    return (
      listing.scanSummary ||
      String(metadata.summary || "") ||
      listing.description ||
      "Your project has been approved and published successfully."
    );
  }, [listing, metadata]);

  const score =
    listing?.vettingScore ??
    (typeof metadata?.vetting_results === "object" &&
    metadata.vetting_results &&
    typeof (metadata.vetting_results as Record<string, unknown>).overallScore === "number"
      ? ((metadata.vetting_results as Record<string, unknown>).overallScore as number)
      : undefined);

  const tier =
    listing?.vettingTier ||
    (typeof metadata?.vetting_results === "object" &&
    metadata.vetting_results &&
    typeof (metadata.vetting_results as Record<string, unknown>).eligibleTier === "string"
      ? ((metadata.vetting_results as Record<string, unknown>).eligibleTier as string)
      : "SEED");

  const progress =
    typeof score === "number" ? Math.max(0, Math.min(100, score)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010101] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-[#16C784]" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#010101] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/user-listings/mine" className="text-sm text-white/70 underline">
            Back
          </Link>
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <p>{error || "Listing not found"}</p>
            {listQuery.isError && id && (
              <button
                type="button"
                className="w-fit rounded-md border border-red-400/50 px-3 py-1.5 text-red-100 hover:bg-red-500/20"
                onClick={() => listQuery.refetch()}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (listing.status !== "PUBLISHED") {
    return (
      <div className="min-h-screen bg-[#010101] text-white p-6">
        <div className="max-w-4xl mx-auto rounded-xl border border-white/10 p-6">
          <p className="text-xl font-bold">This listing is not live yet.</p>
          <p className="text-white/70 mt-2">
            Current status: <span className="text-white">{listing.status}</span>
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => router.push(`/user-listings/${listing.id}`)}
              className="h-10 px-4 rounded-lg border border-white/20 hover:bg-white/5"
            >
              View Listing Details
            </button>
            <button
              type="button"
              onClick={() => router.push("/user-listings/mine")}
              className="h-10 px-4 rounded-lg border border-white/20 hover:bg-white/5"
            >
              Go To My Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010101] text-white px-4 py-6">
      <div className="max-w-5xl mx-auto border border-white/10 rounded-2xl px-4 md:px-8 py-8">
        <div className="border-b border-white/10 pb-6" />

        <div className="mt-10 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-[#16C784]/20 flex items-center justify-center">
            <CheckCircle2 size={44} color="#16C784" />
          </div>
        </div>

        <h1 className="text-center text-4xl font-bold mt-6">Your Project Is Now Live!</h1>
        <p className="text-center text-white/70 mt-3 max-w-2xl mx-auto text-lg">
          Congratulations! Your project has been approved and published. You can now share your listing with the community.
        </p>

        <div className="mt-10 border border-white/15 rounded-xl p-4 md:p-6">
          <h2 className="font-bold text-xl border-b border-white/10 pb-3">Project Summary</h2>

          <div className="mt-4">
            <h3 className="font-bold text-2xl">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-lg mt-3">
              <p><span className="text-white/70">Name:</span> {String(metadata.token_name || listing.title || "N/A")}</p>
              <p><span className="text-white/70">Price:</span> <FiatText usd={asUsd(metadata.token_price)} compact={false} /></p>
              <p><span className="text-white/70">Ticker:</span> ${String(metadata.token_symbol || "N/A")}</p>
              <p><span className="text-white/70">Market cap:</span> <FiatText usd={asUsd(metadata.market_cap)} /></p>
              <p><span className="text-white/70">Age:</span> {String(metadata.age_display || metadata.age_display_short || "N/A")}</p>
              <p><span className="text-white/70">24h volume:</span> <FiatText usd={asUsd(metadata.volume_24h)} /></p>
              <p><span className="text-white/70">Created:</span> {toDateLabel((metadata.creation_date as string | undefined) || null)}</p>
              <p><span className="text-white/70">Chain:</span> {listing.chain || "N/A"}</p>
            </div>
          </div>

          <div className="mt-4 border border-white/15 rounded-lg p-4 bg-white/[0.02]">
            <h4 className="font-semibold text-xl flex items-center gap-2">
              <Zap size={16} color="#FFCB45" /> Summary
            </h4>
            <p className="text-white/75 mt-2 text-lg leading-relaxed">{summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="border border-white/15 rounded-lg p-4 text-center">
              <p className="text-white/60 text-sm">LP security</p>
              <p className="text-2xl font-bold mt-1"><FiatText usd={asUsd(metadata.lp_amount_usd)} /></p>
            </div>
            <div className="border border-white/15 rounded-lg p-4 text-center">
              <p className="text-white/60 text-sm">Holders</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(metadata.holder_count)}</p>
            </div>
            <div className="border border-white/15 rounded-lg p-4 text-center">
              <p className="text-white/60 text-sm">Security</p>
              <p className="text-2xl font-bold mt-1" style={{ color: riskColor(score) }}>
                {riskLevelLabel(score)}
              </p>
            </div>
          </div>

          <div className="mt-4 border border-white/15 rounded-lg p-4">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Tier: <span className="text-white">{tier}</span></span>
              <span>{typeof score === "number" ? `${score}/100` : "N/A"}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#2A2A2A] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#16C784]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push(`/user-listings/${listing.id}`)}
            className="h-11 px-5 rounded-lg bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] font-semibold"
          >
            View Listing Page
          </button>
          <button
            onClick={() => router.push("/listings")}
            className="h-11 px-5 rounded-lg border border-white/20 font-semibold hover:bg-white/5"
          >
            Go To Public Listings
          </button>
        </div>
      </div>
    </div>
  );
}

