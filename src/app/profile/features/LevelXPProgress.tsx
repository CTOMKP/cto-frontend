"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import MissionStats from "./MissionStats";
import { useRewardProgress } from "@/lib/userRewardProgress";
import { getRankBadgeSrc } from "@/lib/rankBadge";

export default function LevelXPProgress() {
  const {
    rankLevel,
    rankLabel,
    currentXP,
    nextLevelXP,
    xpProgress,
    progressPct,
    isLoading,
  } = useRewardProgress();

  const rankBadgeSrc = useMemo(() => getRankBadgeSrc(rankLabel), [rankLabel]);
  const levelTitle = `Level ${rankLevel} - ${rankLabel}`;

  return (
    <div className="mb-4 rounded-lg border-[0.5px] border-white/20 py-[13px] px-3">
      <div className=" mb-2">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2 items-center min-w-0">
            <Image
              src={rankBadgeSrc}
              alt={`${rankLabel} badge`}
              width={20}
              height={20}
              loading="lazy"
              className="shrink-0 rounded-sm object-cover"
            />
            <span className="font-bold truncate" title={levelTitle}>
              {levelTitle}
            </span>
            {isLoading ? (
              <span className="text-[10px] text-white/40 shrink-0">…</span>
            ) : null}
          </div>
          <Button className="text-[#9F9FA9] p-2 ronded-lg border-[0.2px] border-white/20">
            View more
          </Button>
        </div>
      </div>

      <MissionStats
        currentXP={currentXP}
        nextLevelXP={nextLevelXP}
        xpProgress={xpProgress}
      />

      <div className="w-full h-1 bg-[#27272A] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
