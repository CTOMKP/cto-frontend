"use client";

import React from 'react';

export default function MissionStats() {
  return (
    <div className="mb-4">
      <h3 className="text-[10.5px] text-[#E4E4E7] mb-4">
        Mission Stats
      </h3>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-[#71717B] text-[9px] leading-[12px] mb-1">
            Completed Missions
          </h4>
          <div className="text-[#71717B] text-[9px] leading-[12px]">
            <span className="text-white text-[13.5px] leading-5">
              6
            </span>{" "}
            / 7
          </div>
        </div>
        <div>
          <h4 className="text-[#71717B] text-[9px] leading-[12px] mb-1">
            Total XP
          </h4>
          <div className="text-[#71717B] text-[9px] leading-[12px]">
            <span className="text-white text-[13.5px] leading-5">
              35
            </span>{" "}
            / 135
          </div>
        </div>
        <div>
          <h4 className="text-[#71717B] text-[9px] leading-[12px] mb-1">
            Total XP
          </h4>
          <div className="text-[#71717B] text-[9px] leading-[12px]">
            <span className="text-white text-[13.5px] leading-5">
              35
            </span>{" "}
            / 135
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[#71717B] text-[9px] leading-[12px] mb-1">
          Completion Rate
        </h4>
        <div className="text-[#71717B] text-[13.5px] leading-5">
          86%
        </div>
      </div>
    </div>
  );
}

