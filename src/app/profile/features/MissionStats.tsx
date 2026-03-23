"use client";

import React from "react";
import { toXpProgressPct } from "@/lib/userRewardProgress";

export default function MissionStats({
  currentXP,
  // nextLevelXP = 150,
  xpProgress = 0,
}: {
  currentXP: number;
  /** XP target for the current tier (denominator in stats). */
  nextLevelXP?: number;
  /** 0–100 raw; bar + “Level progress” use `toXpProgressPct` via parent or here. */
  xpProgress?: number;
}) {
  const progressPct = toXpProgressPct(xpProgress);
  return (
    <div className="mb-4">
      <h3 className="text-[14px] text-[#E4E4E7] mb-4">
        Mission Stats
      </h3>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-[#71717B] text-[12px] leading-[12px] mb-1">
            Completed Missions
          </h4>
          <div className="text-[#71717B] text-[12px] leading-[12px]">
            <span className="text-white text-[14px] leading-5">
              6
            </span>{" "}
            / 7
          </div>
        </div>
        <div>
          <h4 className="text-[#71717B] text-[12px] leading-[12px] mb-1">
            Total XP
          </h4>
          <div className="text-[#71717B] text-[12px] leading-[12px]">
            <span className="text-white text-[14px] leading-5">
              {currentXP}
            </span>{" "}
          </div>
        </div>
        {/* <div>
          <h4 className="text-[#71717B] text-[12px] leading-[12px] mb-1">
            Level Progress
          </h4>
          <div className="text-[#71717B] text-[12px] leading-[12px]">
            <span className="text-white text-[14px] leading-5">
              {currentXP}
            </span>{" "}
            / {nextLevelXP}
          </div>
        </div> */}
      </div>

      <div>
        <h4 className="text-[#71717B] text-[12px] leading-[12px] mb-1">
          Level Completion Rate
        </h4>
        <div className="text-[#71717B] text-[13.5px] leading-5">
          {progressPct}%
        </div>
      </div>
    </div>
  );
}

