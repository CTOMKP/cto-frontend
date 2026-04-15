"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { userListingsService } from "@/services/userListingsService";

type ListingLike = {
  id: string;
  title: string;
  status: string;
  chain?: string;
  contractAddr: string;
  description?: string;
  scanSummary?: string;
  vettingTier?: string;
  vettingScore?: number;
  links?: Record<string, string | undefined>;
  scanMetadata?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-500/20 text-zinc-200",
  PENDING_APPROVAL: "bg-amber-500/20 text-amber-200",
  PUBLISHED: "bg-emerald-500/20 text-emerald-200",
  REJECTED: "bg-red-500/20 text-red-200",
};

const compactNumber = (value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString();
};

const priceLabel = (value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
  return value < 0.0001 ? value.toFixed(8) : value.toFixed(6);
};

const parseRejectionReason = (description?: string) => {
  if (!description) return null;
  const match = description.match(/Rejection Reason:\s*(.+)/i);
  return match?.[1]?.trim() || null;
};

export default function UserListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<ListingLike | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        let response: unknown = null;
        const token = localStorage.getItem("cto_auth_token");
        if (token) {
          try {
            response = await userListingsService.getMyListing(id);
          } catch {
            response = null;
          }
        }

        if (!response) {
          response = await userListingsService.getPublicListing(id);
        }

        setListing(response as ListingLike);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load listing details.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const metadata = useMemo(() => {
    if (!listing) return {};
    return (listing.scanMetadata || listing.metadata || {}) as Record<string, unknown>;
  }, [listing]);

  const rejectionReason = useMemo(() => {
    if (!listing) return null;
    return parseRejectionReason(listing.description);
  }, [listing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010101] text-white px-5 py-8">
        <div className="max-w-5xl mx-auto rounded-xl border border-white/10 p-6 text-white/70">
          Loading listing details...
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#010101] text-white px-5 py-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/user-listings/mine" className="text-sm text-white/70 underline">
            Back to my listings
          </Link>
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error || "Listing not found."}
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[listing.status] || "bg-zinc-500/20 text-zinc-200";
  const price = priceLabel(metadata.token_price);
  const marketCap = compactNumber(metadata.market_cap);
  const liquidity = compactNumber(metadata.lp_amount_usd);
  const volume24h = compactNumber(metadata.volume_24h);
  const holders = compactNumber(metadata.holder_count);

  return (
    <div className="min-h-screen bg-[#010101] text-white px-5 py-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/user-listings/mine" className="text-sm text-white/70 underline">
          Back to my listings
        </Link>

        <div className="mt-4 rounded-xl border border-white/10 p-6 bg-white/[0.02]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">{listing.title || "Untitled Project"}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
              {listing.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-white/60 break-all">{listing.contractAddr}</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p className="text-white/75">Chain: <span className="text-white">{listing.chain || "N/A"}</span></p>
            <p className="text-white/75">Tier: <span className="text-white">{listing.vettingTier || "N/A"}</span></p>
            <p className="text-white/75">Score: <span className="text-white">{typeof listing.vettingScore === "number" ? `${listing.vettingScore}/100` : "N/A"}</span></p>
            <p className="text-white/75">Created: <span className="text-white">{typeof metadata.creation_date === "string" ? new Date(metadata.creation_date).toLocaleDateString() : "N/A"}</span></p>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="rounded-lg border border-white/10 p-3">
              <p className="text-[11px] text-white/60">Price</p>
              <p className="text-sm font-semibold mt-1">${price}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <p className="text-[11px] text-white/60">Market Cap</p>
              <p className="text-sm font-semibold mt-1">{marketCap}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <p className="text-[11px] text-white/60">Liquidity</p>
              <p className="text-sm font-semibold mt-1">{liquidity}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <p className="text-[11px] text-white/60">24h Volume</p>
              <p className="text-sm font-semibold mt-1">{volume24h}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <p className="text-[11px] text-white/60">Holders</p>
              <p className="text-sm font-semibold mt-1">{holders}</p>
            </div>
          </div>

          {listing.scanSummary && (
            <div className="mt-5 rounded-lg border border-white/10 p-4">
              <p className="text-sm text-white/70">{listing.scanSummary}</p>
            </div>
          )}

          {listing.status === "REJECTED" && (
            <div className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 p-4">
              <p className="text-xs text-red-200 uppercase tracking-wide">Rejection Feedback</p>
              <p className="text-sm text-red-100 mt-1">
                {rejectionReason || "This listing was rejected by an admin."}
              </p>
            </div>
          )}

          {listing.description && (
            <div className="mt-5">
              <p className="text-xs text-white/50 uppercase tracking-wide">Description</p>
              <p className="text-sm text-white/80 mt-1 whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {listing.links && (
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.entries(listing.links).map(([key, value]) => {
                if (!value) return null;
                return (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 px-3 rounded-lg border border-white/20 text-xs hover:bg-white/5"
                  >
                    {key}
                  </a>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {listing.status === "PUBLISHED" && (
              <Link
                href={`/user-listings/${listing.id}/live`}
                className="h-10 px-4 rounded-lg bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] text-sm font-semibold flex items-center"
              >
                Open Live Page
              </Link>
            )}
            <Link
              href={`/projectProfile/${listing.contractAddr}`}
              className="h-10 px-4 rounded-lg border border-white/20 hover:bg-white/5 text-sm flex items-center"
            >
              Open Public Token Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

