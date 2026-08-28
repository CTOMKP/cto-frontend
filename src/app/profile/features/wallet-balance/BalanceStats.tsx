import React from "react";
import { ChevronUp } from "lucide-react";
import FiatText from "@/components/FiatText";

export default function BalanceStats() {
  return (
    <div className="flex justify-center items-center">
      <span className={`flex font-medium items-center text-xs text-[#16C784]`}>
        <ChevronUp
          size={16}
          stroke="false"
          className="border-none p-0 -mb-0.5"
          fill="#16C784"
        />
        <span className="font-medium">6.00%</span>
        <span className="text-xs text-[#16C784]">
          (<FiatText usd={15960324} compact={false} />)
        </span>
      </span>
    </div>
  );
}
