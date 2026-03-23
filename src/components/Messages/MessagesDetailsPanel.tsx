"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EscrowSummary, MessageThread } from "@/types/messages";
import {
  useRewardProgress,
  toXpProgressPct,
} from "@/lib/userRewardProgress";

function withAvatarCache(
  url: string,
  cacheValue?: string | number,
): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${cacheValue ?? Date.now()}`;
}

const DESCRIPTION_PREVIEW_LEN = 180;
const FILLED_STAR = "#E6AC19";
const EMPTY_STAR = "#D9D9D9";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const pct = Math.min(1, Math.max(0, rating - (i - 1)));
        return (
          <span key={i} className="relative inline-block size-[18px] shrink-0">
            <Star
              className="size-[18px] absolute left-0 top-0"
              fill={EMPTY_STAR}
              stroke={EMPTY_STAR}
              strokeWidth={1.2}
              aria-hidden
            />
            {pct > 0 ? (
              <span
                className="absolute left-0 top-0 h-full overflow-hidden"
                style={{ width: `${pct * 100}%` }}
              >
                <Star
                  className="size-[18px]"
                  fill={FILLED_STAR}
                  stroke={FILLED_STAR}
                  strokeWidth={1.2}
                  aria-hidden
                />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

export default function MessagesDetailsPanel({
  thread,
  viewerUserId,
  selectedProfileUserId,
  currentEscrow,
  isPoster,
  onEscrowPrimary,
  onBackToThread,
}: {
  thread: MessageThread | null;
  viewerUserId: number | null;
  /** When set (e.g. from `/messages/[id]/profile/[userId]`), show that participant. */
  selectedProfileUserId: number | null;
  currentEscrow: EscrowSummary | null;
  isPoster: boolean;
  onEscrowPrimary: () => void;
  onBackToThread?: () => void;
}) {
  const [profileAvatarError, setProfileAvatarError] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const viewerReward = useRewardProgress();

  const posterAvatarSrc = useMemo(() => {
    const fallback =
      typeof thread?.ad?.user?.avatarUrl === "string"
        ? thread.ad.user.avatarUrl
        : "";
    const base = thread?.poster?.avatarUrl || fallback;
    if (!base) return "";
    return withAvatarCache(
      base,
      thread?.poster?.id || thread?.updatedAt || "",
    );
  }, [
    thread?.poster?.avatarUrl,
    thread?.poster?.id,
    thread?.ad?.user?.avatarUrl,
    thread?.updatedAt,
  ]);

  const applicantAvatarSrc = useMemo(() => {
    const base = thread?.applicant?.avatarUrl || "";
    if (!base) return "";
    return withAvatarCache(
      base,
      thread?.applicant?.id || thread?.updatedAt || "",
    );
  }, [thread?.applicant?.avatarUrl, thread?.applicant?.id, thread?.updatedAt]);

  const otherUser = useMemo(() => {
    if (!thread) return null;
    return isPoster ? thread.applicant : thread.poster;
  }, [thread, isPoster]);

  const selectedProfileUser = useMemo(() => {
    if (!thread || !selectedProfileUserId) return otherUser;
    const fromThread =
      selectedProfileUserId === thread.posterId
        ? thread.poster
        : selectedProfileUserId === thread.applicantId
          ? thread.applicant
          : null;
    return fromThread || otherUser;
  }, [thread, selectedProfileUserId, otherUser]);

  const selectedProfileRole = useMemo(() => {
    if (!thread || !selectedProfileUserId) {
      return isPoster ? "Applicant" : "Poster";
    }
    return selectedProfileUserId === thread.posterId ? "Poster" : "Applicant";
  }, [thread, selectedProfileUserId, isPoster]);

  const profileAvatarSrc = useMemo(() => {
    const selectedUser = selectedProfileUser;
    const fallback =
      selectedProfileUserId === thread?.posterId
        ? posterAvatarSrc
        : applicantAvatarSrc;
    const raw = selectedUser?.avatarUrl || fallback;
    if (!raw) return "";
    return withAvatarCache(
      raw,
      thread?.updatedAt || selectedUser?.id || "",
    );
  }, [
    selectedProfileUser,
    selectedProfileUserId,
    thread?.posterId,
    thread?.updatedAt,
    posterAvatarSrc,
    applicantAvatarSrc,
  ]);

  useEffect(() => {
    setProfileAvatarError(false);
  }, [selectedProfileUser?.id, profileAvatarSrc]);

  const ad = thread?.ad;
  const title = ad?.title || "Listing";
  const chain = useMemo(() => {
    const c = String(ad?.chain ?? "").trim();
    if (!c) return "—";
    return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
  }, [ad?.chain]);

  const description = ad?.description;

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [thread?.id, description]);

  const price = useMemo(() => {
    if (ad?.priceCurrency && typeof ad?.priceAmount === "number") {
      return `${ad.priceAmount} ${ad.priceCurrency}`;
    }
    if (ad?.priceCurrency) return String(ad.priceCurrency);
    return "—";
  }, [ad?.priceCurrency, ad?.priceAmount]);

  const hasEscrow = Boolean(currentEscrow?.id);
  const escrowDisabled = !isPoster && !hasEscrow;

  const displayName =
    selectedProfileUser?.name ||
    selectedProfileUser?.email ||
    selectedProfileRole;

  const isViewingSelf =
    viewerUserId != null &&
    selectedProfileUser?.id != null &&
    Number(selectedProfileUser.id) === viewerUserId;

  const participantRankPct = toXpProgressPct(
    typeof selectedProfileUser?.progressPercent === "number"
      ? selectedProfileUser.progressPercent
      : 0,
  );

  const levelTitle = useMemo(() => {
    if (isViewingSelf) {
      const { rankEmoji, rankLevel, rankLabel } = viewerReward;
      const prefix = rankEmoji ? `${rankEmoji} ` : "";
      return `${prefix}Level ${rankLevel} - ${rankLabel}`.trim();
    }
    const u = selectedProfileUser;
    if (u?.rankLevel != null && u.rankLabel) {
      const em = u.rankEmoji ? `${u.rankEmoji} ` : "";
      return `${em}Level ${u.rankLevel} - ${u.rankLabel}`.trim();
    }
    if (u?.rankLevel != null) {
      const em = u.rankEmoji ? `${u.rankEmoji} ` : "";
      return `${em}Level ${u.rankLevel}`.trim();
    }
    return "Rank not shared";
  }, [isViewingSelf, viewerReward, selectedProfileUser]);

  const progressPct = isViewingSelf
    ? viewerReward.progressPct
    : participantRankPct;

  const xpSubtitle = isViewingSelf
    ? `${viewerReward.currentXP} / ${viewerReward.nextLevelXP} XP`
    : selectedProfileUser?.progressPercent != null
      ? `${participantRankPct}% to next tier`
      : null;

  return (
    <aside className="w-[380px] bg-black/40">
      <div className="h-full overflow-auto hover-scrollbar p-5 pt-25">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="relative size-[115px] rounded-full bg-white/5 overflow-hidden shrink-0 border border-white/10">
            {profileAvatarSrc && !profileAvatarError ? (
              <Image
                key={profileAvatarSrc}
                src={profileAvatarSrc}
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
                referrerPolicy="no-referrer"
                onError={() => setProfileAvatarError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-lg">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="mt-3 font-semibold text-white truncate max-w-full">
            {displayName}
          </div>
          {/* <div className="text-xs text-white/50">{selectedProfileRole}</div> */}

          <div className="mt-2 w-full max-w-[260px] text-left">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs w-full text-center text-white/70 leading-tight">
                {levelTitle}
              </span>
            </div>

            <div className="text-xs text-[#FFC176] text-center mb-2">
            Typically replies in 15 minutes
          </div>
            {xpSubtitle ? (
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-white/50">XP</span>
                <span className="text-[11px] text-white/60">{xpSubtitle}</span>
              </div>
            ) : null}
            <div className="w-full h-1 bg-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-[10px] text-white/40 mt-1 text-right mb-1">
              {progressPct}%
            </div>
          </div>
          {selectedProfileUserId && onBackToThread ? (
            <button
              type="button"
              className="mt-3 rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-300 hover:bg-white/10"
              onClick={onBackToThread}
            >
              Back to thread
            </button>
          ) : null}
        </div>

        <div className="border-t-[0.5px] border-white/20 pt-5">
          <div className="text-xs text-white mb-1">Project brief</div>

          <div className="mt-4 text-xs text-white/60">
            {description ? (
              <>
                <span className="whitespace-pre-wrap">
                  {descriptionExpanded ||
                  String(description).length <= DESCRIPTION_PREVIEW_LEN
                    ? String(description)
                    : `${String(description).slice(0, DESCRIPTION_PREVIEW_LEN)}…`}
                </span>
                {String(description).length > DESCRIPTION_PREVIEW_LEN ? (
                  <button
                    type="button"
                    className="ml-1 inline text-[#E6AC19] font-medium hover:underline align-baseline"
                    onClick={() => setDescriptionExpanded((v) => !v)}
                  >
                    {descriptionExpanded ? "See less" : "See more"}
                  </button>
                ) : null}
              </>
            ) : (
              "No description available."
            )}
          </div>

          <div className="border-t-[0.5px] border-white/20 pt-5 mt-5">
            <div className="text-xs text-white mb-2">Requirements</div>
            <div className="text-xs text-white my-2">Preferred Stack</div>
            <ul className="list-disc space-y-2 list-inside text-xs text-white/80">
              <li>{ad?.chain}</li>
              <li>{ad?.category}</li>
              <li>{ad?.subCategory}</li>
            </ul>
          </div>

          <div className="border-t-[0.5px] border-white/20 pt-5 mt-5">
          <div className="text-xs text-white mb-2">Requirements</div>
            <Button
              className="w-full cta-gradient text-white hover:opacity-90 disabled:opacity-40"
              disabled={escrowDisabled}
              type="button"
              onClick={onEscrowPrimary}
            >
              {hasEscrow
                ? "View escrow"
                : isPoster
                  ? "Set up escrow"
                  : "No escrow set yet"}
            </Button>
            {escrowDisabled ? (
              <div className="text-[11px] text-white/50 mt-2 text-center">
                Poster has not created an escrow yet
              </div>
            ) : null}
          </div>

          <div className="border-t-[0.5px] border-white/20 pt-5 mt-5">
            <div className="text-xs text-white/50 mb-2">Reviews</div>
            <div className="flex flex-col gap-2">
              <RatingStars rating={3.5} />
              <div className="text-xs text-white/50">
                Based on 27 reviews
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
