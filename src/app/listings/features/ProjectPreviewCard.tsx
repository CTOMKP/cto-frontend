"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
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
const PREVIEW_ESTIMATED_HEIGHT = 430;
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

function ProjectPreviewCard({ coin }: { coin: MockLikeCoin }) {
  const { t } = useTranslation();
  const change24h = coin.price.change["24h"] ?? 0;
  const down = change24h < 0;
  const chainSlug = normalizeChainSlug(coin.chain ?? "solana");
  const chainLabel = CHAIN_DISPLAY_NAMES[chainSlug] ?? chainSlug;
  const risk = coin.degenAudit ?? 0;

  return (
    <div className="w-[380px] rounded-xl bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] shadow-2xl">
      <div className="rounded-xl bg-[#010101] p-3 text-white">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative size-10 shrink-0">
              <FallbackImage
                src={coin.image && coin.image.trim() !== "" ? coin.image : undefined}
                alt={coin.name || "token"}
                className="size-10 rounded-full object-cover border-[0.36px] border-white"
                width={40}
                height={40}
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
              <p className="truncate font-semibold capitalize" title={coin.name}>
                {coin.name || "Unknown"}
              </p>
              <p className="text-xs text-white/50">
                {chainLabel} · {shortenAddress(coin.address)}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-semibold">
              <FiatText usd={coin.price.amount} compact={false} />
            </p>
            <p
              className={`flex items-center justify-end text-xs font-medium ${
                down ? "text-[#C71624]" : "text-[#16C784]"
              }`}
            >
              {down ? <ChevronDown size={14} fill="#C71624" /> : <ChevronUp size={14} fill="#16C784" />}
              {Math.abs(change24h).toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-4 gap-1">
          {[
            { label: t("preview.mc"), value: <FiatText usd={coin.marketCap} /> },
            { label: t("preview.liq"), value: <FiatText usd={coin.liquidity} /> },
            { label: t("preview.age"), value: coin.age || "—" },
            { label: t("preview.risk"), value: risk > 0 ? risk.toFixed(1) : "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-white/5 px-1.5 py-1.5 text-center"
            >
              <p className="text-[10px] font-medium text-white/50">{stat.label}</p>
              <p className="truncate text-xs font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg bg-[#0F0F0F]">
          <Chart
            address={coin.address}
            chain={coin.chain}
            height={200}
            interactive={false}
          />
        </div>
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
            <ProjectPreviewCard coin={coin} />
          </div>,
          document.body,
        )}
    </>
  );
}
