'use client'

import { Button } from "./ui/button";

export type Timeframe = "1m" | "5m" | "1h" | "5h" | "24h";

export default function TimeFilter({ selected, onChange }: { selected: string; onChange: (t: string) => void }) {
const TIMEFRAMES = ["1m", "5m", "1h", "5h", "24h"];

  return (
    <div className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF20] rounded-lg items-center px-1">
      {TIMEFRAMES.map((time) => (
        <Button
          key={time}
          onClick={() => onChange(time)}
          className={`text-xs px-1.5 py-1 w-fit font-bold h-[20px] rounded-lg ${
            selected === time ? "bg-[#17171C] text-white" : "bg-transparent text-[#A1A1AA]"
          }`}
        >
          {time}
        </Button>
      ))}
    </div>
  );
}
