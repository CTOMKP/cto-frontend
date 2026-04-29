"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/authSession";
import { userListingsService } from "@/services/userListingsService";

type ListingItem = {
  id: string;
  title: string;
  status: string;
  contractAddr: string;
  chain?: string;
  createdAt?: string;
  vettingTier?: string;
  vettingScore?: number;
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-500/20 text-zinc-200",
  PENDING_APPROVAL: "bg-amber-500/20 text-amber-200",
  PUBLISHED: "bg-emerald-500/20 text-emerald-200",
  REJECTED: "bg-red-500/20 text-red-200",
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
};

export default function MyUserListingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ListingItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) {
          setError("Please log in to view your listing status.");
          return;
        }

        const response = await userListingsService.mine();
        const nextItems = (response?.items || []) as ListingItem[];
        setItems(nextItems);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load your listing status.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#010101] text-white px-5 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">My Listing Status</h1>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="h-10 px-4 rounded-lg border border-white/20 hover:bg-white/5 text-sm"
          >
            Go To Profile
          </button>
        </div>

        <p className="text-white/65 mt-2">
          Track pending, approved, and rejected listings in one place.
        </p>

        {loading && (
          <div className="mt-6 rounded-xl border border-white/10 p-6 text-white/70">
            Loading listings...
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mt-6 rounded-xl border border-white/10 p-6 text-white/70">
            No listings found.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-6 space-y-3">
            {items.map((listing) => {
              const statusStyle =
                STATUS_STYLES[listing.status] || "bg-zinc-500/20 text-zinc-200";
              const isPublished = listing.status === "PUBLISHED";

              return (
                <div
                  key={listing.id}
                  className="rounded-xl border border-white/10 p-4 bg-white/[0.02]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold">{listing.title || "Untitled Project"}</p>
                      <p className="text-xs text-white/60 break-all">{listing.contractAddr}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
                      {listing.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <p className="text-white/70">
                      Chain: <span className="text-white">{listing.chain || "N/A"}</span>
                    </p>
                    <p className="text-white/70">
                      Tier: <span className="text-white">{listing.vettingTier || "N/A"}</span>
                    </p>
                    <p className="text-white/70">
                      Score:{" "}
                      <span className="text-white">
                        {typeof listing.vettingScore === "number"
                          ? `${listing.vettingScore}/100`
                          : "N/A"}
                      </span>
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-white/55">
                    Created: {formatDate(listing.createdAt)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/user-listings/${listing.id}`}
                      className="h-10 px-4 rounded-lg border border-white/20 hover:bg-white/5 text-sm flex items-center"
                    >
                      View Details
                    </Link>
                    {isPublished && (
                      <Link
                        href={`/user-listings/${listing.id}/live`}
                        className="h-10 px-4 rounded-lg bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] text-sm font-semibold flex items-center"
                      >
                        View Live Page
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

