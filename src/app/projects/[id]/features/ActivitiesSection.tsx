"use client";

import React from "react";
import { SquareArrowOutUpRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compactNumber } from "@/utils/helper/compactNumber";
import FiatText from "@/components/FiatText";
import { ApiCoinItem } from "@/types/api";

interface ActivitiesSectionProps {
  projectData: ApiCoinItem | null;
}

const activitiesFilterOptions = [
  { key: "all", label: "All" },
  { key: "smart", label: "Smart KOL/VC" },
  { key: "whales", label: "Whales" },
  { key: "insider", label: "Insider" },
  { key: "top10", label: "Top 10" },
  { key: "fresh", label: "Fresh Wallet" },
  { key: "bundle", label: "Bundle" }
];

function ActivitiesFilter() {
  const [active, setActive] = React.useState("all");

  return (
    <div className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF]/20 rounded-lg items-center px-1 w-fit bg-transparent">
      {activitiesFilterOptions.map(opt => (
        <button
          key={opt.key}
          type="button"
          onClick={() => setActive(opt.key)}
          className={`text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg transition-colors ${
            active === opt.key ? "bg-[#17171C] text-white" : "bg-transparent text-[#A1A1AA]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function ActivitiesSection({ projectData }: ActivitiesSectionProps) {
  return (
    <div className="mt-4.5">
      <div className="px-[100px]">
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF]/20 rounded-lg items-center px-1 w-fit bg-transparent">
            <TabsTrigger
              value="activities"
              className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
            >
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="top-traders"
              className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
            >
              Top Traders
            </TabsTrigger>
            <TabsTrigger
              value="holders"
              className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
            >
              {`Holders (${compactNumber(
                projectData?.holders ||
                  projectData?.metadata?.market?.holders ||
                  300150
              )})`}
            </TabsTrigger>
            <TabsTrigger
              value="liquidity"
              className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
            >
              Liquidity
            </TabsTrigger>
            <TabsTrigger
              value="positions"
              className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
            >
              Positions
            </TabsTrigger>
          </TabsList>
          <div className="border-t-[0.5px] border-white/20"></div>
          <ActivitiesFilter />
          <TabsContent value="activities" className="mt-6">
            <div className="overflow-x-auto hover-scrollbar">
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-left">
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Age</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Type</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Value</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Amount</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Price</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">MC</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Address</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-0 text-right">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { age: "5m", type: "buy", valueUsd: 100.61, amount: "1.78M", priceUsd: 0.00001526, mcUsd: 0.00001526, address: "7RET3F...YGS5", tx: "#" },
                    { age: "12m", type: "sell", valueUsd: 100.61, amount: "1.78M", priceUsd: 0.00001526, mcUsd: 0.00001526, address: "7RET3F...YGS5", tx: "#" },
                    { age: "22m", type: "buy", valueUsd: 100.61, amount: "1.78M", priceUsd: 0.00001526, mcUsd: 0.00001526, address: "7RET3F...YGS5", tx: "#" },
                    { age: "35m", type: "sell", valueUsd: 100.61, amount: "1.78M", priceUsd: 0.00001526, mcUsd: 0.00001526, address: "7RET3F...YGS5", tx: "#" },
                  ].map((row, idx) => (
                    <tr key={idx} className="bg-white/2">
                      <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.age}</td>
                      <td className="text-xs font-medium py-3 pr-4 whitespace-nowrap">
                        <span className={row.type === "buy" ? "text-[#16C784]" : "text-[#C71624]"}>
                          {row.type === "buy" ? "Buy" : "Sell"}
                        </span>
                      </td>
                      <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                        <FiatText usd={row.valueUsd} compact={false} />
                      </td>
                      <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.amount}</td>
                      <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                        <FiatText usd={row.priceUsd} compact={false} />
                      </td>
                      <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                        <FiatText usd={row.mcUsd} compact={false} />
                      </td>
                      <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.address}</td>
                      <td className="text-xs font-medium text-white py-3 pr-0 whitespace-nowrap text-right">
                        <a href={row.tx} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white/80 hover:text-white">
                          <SquareArrowOutUpRight size={16} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="top-traders" className="mt-6">
            <div></div>
          </TabsContent>
          <TabsContent value="holders" className="mt-6">
            <div></div>
          </TabsContent>
          <TabsContent value="liquidity" className="mt-6">
            <div></div>
          </TabsContent>
          <TabsContent value="positions" className="mt-6">
            <div></div>
          </TabsContent>
        </Tabs>

        <div className="borrder-t-[0.5px] border-white/20 my-1"></div>
      </div>
    </div>
  );
}

