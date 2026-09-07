"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowUpRight, ChevronDown, ChevronUp, X } from "lucide-react";
import FallbackImage from "@/components/FallbackImage";
import Chart from "@/app/projects/[id]/features/Chart";
import FiatText from "@/components/FiatText";
import { shortenAddress } from "@/utils/helper/shortenAddress";
import { getChainImage } from "./utils/listingUtils";
import type { MockLikeCoin } from "./types/listing";
import {
  CHAIN_DISPLAY_NAMES,
  normalizeChainSlug,
} from "@/lib/constants/slugs";
import { useTranslation } from "react-i18next";

const PREVIEW_WIDTH = 380;
const PREVIEW_ESTIMATED_HEIGHT = 520;
const OPEN_DELAY_MS = 350;
const CLOSE_DELAY_MS = 180;

function previewPosition(rect: DOMRect): { top: number; left: number } {
  const gap = 10;
  let left = rect.right + gap;
  let top = rect.top;
  if (left + PREVIEW_WIDTH > window.innerWidth - 12) {
    left = rect.left - PREVIEW_WIDTH - gap;
  }
  if (left < 12) left = 12;
  if (top + PREVIEW_ESTIMATED_HEIGHT > window.innerHeight - 12) {
    top = Math.max(12, window.innerHeight - PREVIEW_ESTIMATED_HEIGHT - 12);
  }
  if (top < 12) top = 12;
  return { top, left };
}

function communityScoreIcon(score: number): string {
  if (score >= 70) return "/communitry-score-icons/good-green.svg";
  if (score >= 40) return "/communitry-score-icons/average-yellow.svg";
  return "/communitry-score-icons/bad-red.svg";
}

function riskScoreIcon(score: number): string {
  if (score >= 70) return "/risk-score/good.svg";
  if (score >= 50) return "/risk-score/average.svg";
  return "/risk-score/bad.svg";
}

function ProjectPreviewCard({
  coin,
  onOpenProject,
  onClose,
}: {
  coin: MockLikeCoin;
  onOpenProject: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const change24h = coin.price.change["24h"] ?? 0;
  const down = change24h < 0;
  const chainSlug = normalizeChainSlug(coin.chain ?? "solana");
  const chainLabel = CHAIN_DISPLAY_NAMES[chainSlug] ?? chainSlug;
  const risk = coin.degenAudit ?? 0;
  const communityScore = coin.communityScore ?? 0;
  const twitter = coin.links?.twitter || coin.x;
  const website = coin.links?.website || coin.website;
  const hasTier = Boolean(coin.tier && !/^[-—]+$/.test(String(coin.tier).trim()));

  return (
    <div className="w-[380px] rounded-xl border-2 border-[#868686]/20 bg-[#010101] p-4 text-white shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative size-11 shrink-0">
            <FallbackImage
              src={coin.image && coin.image.trim() !== "" ? coin.image : undefined}
              alt={coin.name || "token"}
              className="size-11 rounded-full object-cover border-[0.36px] border-white"
              width={44}
              height={44}
            />
            <Image
              src={getChainImage(coin.chain || "solana")}
              alt={chainLabel}
              width={16}
              height={16}
              className="absolute bottom-0 left-0 size-4 rounded-full border border-[#010101]"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-lg font-semibold capitalize" title={coin.name}>
                {coin.name || "Unknown"}
              </p>
              {hasTier ? (
                <Image
                  src="/certified.svg"
                  alt="verified"
                  width={14}
                  height={14}
                  className="shrink-0"
                />
              ) : null}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50">
              <span>{shortenAddress(coin.address)}</span>
              <button
                type="button"
                className="shrink-0"
                title="Copy address"
                onClick={(e) => {
                  e.stopPropagation();
                  if (coin.address) void navigator.clipboard.writeText(coin.address);
                }}
              >
                <Image src="/copy.svg" alt="copy" width={12} height={12} />
              </button>
              {twitter ? (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                >
                  <Image src="/social-icons/x.svg" alt="X" width={12} height={12} />
                </a>
              ) : null}
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                >
                  <Image src="/globe.svg" alt="website" width={12} height={12} />
                </a>
              ) : null}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="shrink-0 text-white/60 hover:text-white"
          aria-label="Close preview"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#17171C] px-2 py-1 text-xs">
          <Image
            src={communityScoreIcon(communityScore)}
            alt=""
            width={14}
            height={14}
          />
          {communityScore > 0 ? `${Math.round(communityScore)}%` : "0%"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#17171C] px-2 py-1 text-xs">
          {risk > 0 ? risk.toFixed(0) : "—"}
          {risk > 0 ? (
            <Image src={riskScoreIcon(risk)} alt="" width={10} height={13} />
          ) : null}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-white/40">{t("common.price")}</p>
        <div className="flex items-center gap-2">
          <p className="text-xl font-semibold">
            <FiatText usd={coin.price.amount} compact={false} />
          </p>
          <p
            className={`flex items-center text-sm font-medium ${
              down ? "text-[#C71624]" : "text-[#16C784]"
            }`}
          >
            {down ? <ChevronDown size={14} fill="#C71624" /> : <ChevronUp size={14} fill="#16C784" />}
            {Math.abs(change24h).toFixed(2)}%
          </p>
        </div>
        <p className="mt-1 text-xs text-white/50">
          {t("common.marketCap")}{" "}
          <span className="text-white">
            <FiatText usd={coin.marketCap} />
          </span>
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-[#0F0F0F]">
        <Chart
          address={coin.address}
          chain={coin.chain}
          height={200}
          interactive={false}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <Image
          src="/nav-bar/logo.svg"
          alt="CTO Marketplace"
          width={128}
          height={35}
          className="h-7 w-auto"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenProject();
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-[#868686]/20 bg-[#17171C] p-2 text-xs text-white/80 hover:text-white"
        >
          Detailed view
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

interface ProjectPreviewHoverProps {
  coin: MockLikeCoin;
  children: React.ReactNode;
  onOpenProject: () => void;
}

export default function ProjectPreviewHover({
  coin,
  children,
  onOpenProject,
}: ProjectPreviewHoverProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number>(0);
  const closeTimer = useRef<number>(0);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const clearTimers = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }, []);

  const openPreview = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords(previewPosition(rect));
    setOpen(true);
  }, []);

  const scheduleOpen = () => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(openPreview, OPEN_DELAY_MS);
  };

  const scheduleClose = () => {
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
      >
        {children}
      </div>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-label={`${coin.name} project preview`}
            className="fixed z-[80] cursor-pointer"
            style={{ top: coords.top, left: coords.left }}
            onMouseEnter={() => {
              window.clearTimeout(closeTimer.current);
            }}
            onMouseLeave={scheduleClose}
            onClick={(e) => {
              e.stopPropagation();
              onOpenProject();
            }}
          >
            <ProjectPreviewCard
              coin={coin}
              onOpenProject={onOpenProject}
              onClose={() => setOpen(false)}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
