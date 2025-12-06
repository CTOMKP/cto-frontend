"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import MindshareLeader from "./MindshareLeader";
import { usePathname } from "next/navigation";
import Image from "next/image";

const mockData = [
  { name: "Meow", ticker: "MEW", percentage: 0.08, timeFrame: "1hr" },
  { name: "Meow", ticker: "MEW", percentage: 0.2, timeFrame: "1hr" },
  { name: "Meow", ticker: "MEW", percentage: 0.001, timeFrame: "1hr" },
  { name: "Meow", ticker: "MEW", percentage: 20, timeFrame: "1hr" },
  { name: "Meow", ticker: "MEW", percentage: 20, timeFrame: "1hr" },
];

export default function MarketTrends() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/faq") return null;

  // One "group" = your items + MindshareLeader at the end
  const Group = () => (
    <div className="flex items-center whitespace-nowrap">
      {mockData.map((item, index) => (
        <div key={index} className="flex items-center gap-1 ml-3 shrink-0">
          <span className="text-[#393939]">#{index + 1}</span>
          <Image
            loading="lazy"
            src="/default-trending-coin-img.png"
            alt="default-trending-coin-img"
            width={16}
            height={16}
          />
          <span className="text-[#393939]">{item.ticker}</span>
          <span className="flex items-center text-[#008C5E]">
            <ChevronDown
              stroke="false"
              className="border-none"
              fill="#008C5E"
            />
            {item.percentage}%({item.timeFrame})
          </span>
        </div>
      ))}
      {/* Mindshare at the end of the group */}
      <div className="ml-6 shrink-0 flex items-center">
        <MindshareLeader />
      </div>
    </div>
  );

  return (
    <div className="bg-[#FFCB45] h-9 flex items-center justify-between text-xs pr-2 overflow-hidden">
      <div className="flex items-center flex-1 overflow-hidden">
        {/* static left section */}
        <span className="w-[98px] flex justify-center">
          <Image
            loading="lazy"
            src="/market-trends-heart.svg"
            alt="market-trends-heart"
            width={16}
            height={16}
          />
        </span>

        <span className="flex items-center mr-2">
          <p className="text-[#FC461D]">Gaining traction</p>
          <Image
            loading="lazy"
            src="/emoji-icons/gaining-traction.svg"
            alt="/gaining-traction"
            width={16}
            height={16}
          />
        </span>

        {/* ticker container */}
        <div className="relative flex-1 overflow-hidden">
          {/* Track contains TWO identical groups for seamless loop */}
          <div className="marquee-track">
            <div className="marquee-group">
              <Group />
            </div>
            <div className="marquee-group" aria-hidden="true">
              <Group />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
