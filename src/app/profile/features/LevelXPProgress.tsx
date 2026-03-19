"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import MissionStats from './MissionStats';

interface LevelXPProgressProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  xpProgress: number;
}

export default function LevelXPProgress({
  level,
  currentXP,
  xpProgress,
}: LevelXPProgressProps) {
  return (
    <div className="mb-4 rounded-lg border-[0.5px] border-white/20 py-[13px] px-3">
      <div className=" mb-2">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-1">
            <Image
              alt="badge"
              src={"/badge.svg"}
              width={15}
              height={15}
            />
            <span className="font-bold">
              Level {level} - Senior Sapling
            </span>
          </div>
          <Button className="text-[#9F9FA9] p-2 ronded-lg border-[0.2px] border-white/20">
            View more
          </Button>
        </div>
        {/* <span className="text-sm text-gray-400">
          {currentXP} / {nextLevelXP} XP
        </span> */}
      </div>

      <MissionStats currentXP={currentXP} />

      {/* progress */}
      <div className="w-full h-1 bg-[#27272A] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] transition-all duration-300"
          style={{ width: `${xpProgress}%` }}
        />
      </div>
    </div>
  );
}

