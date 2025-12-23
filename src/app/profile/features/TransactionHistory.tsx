"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SquareArrowOutUpRight } from 'lucide-react';

export default function TransactionHistory() {
  return (
    <div className="mt-10">
      <Tabs defaultValue="tx-history" className="w-full">
        <TabsList className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF]/20 rounded-lg items-center px-1 w-fit bg-transparent">
          <TabsTrigger
            value="holdings"
            className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
          >
            Holdings
          </TabsTrigger>
          <TabsTrigger
            value="tx-history"
            className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
          >
            Tx history
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
          >
            Orders
          </TabsTrigger>
        </TabsList>
        <div className="border-t-[0.5px] border-white/20 mt-4"></div>
        
        <TabsContent value="tx-history">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-1">
              <thead>
                <tr className="text-left">
                  <th className="text-xs font-bold text-white/50 py-2 pr-4">Timestamp</th>
                  <th className="text-xs font-bold text-white/50 py-2 pr-4">Value (USDC)</th>
                  <th className="text-xs font-bold text-white/50 py-2 pr-4">Amount</th>
                  <th className="text-xs font-bold text-white/50 py-2 pr-4">Type</th>
                  <th className="text-xs font-bold text-white/50 py-2 pr-4">Address</th>
                  <th className="text-xs font-bold text-white/50 py-2 pr-0 text-right">Hash ID</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { timestamp: "07/07/2025, 10:09:06", value: "$100.61", amount: "1.78M", type: "deposit", address: "7RET3F...YGS5", hash: "#" },
                  { timestamp: "07/07/2025, 09:45:23", value: "$250.00", amount: "4.50M", type: "withdraw", address: "7RET3F...YGS5", hash: "#" },
                  { timestamp: "07/07/2025, 08:30:15", value: "$500.00", amount: "9.00M", type: "deposit", address: "7RET3F...YGS5", hash: "#" },
                  { timestamp: "07/06/2025, 15:20:42", value: "$75.25", amount: "1.35M", type: "withdraw", address: "7RET3F...YGS5", hash: "#" },
                ].map((row, idx) => (
                  <tr key={idx} className="bg-white/2">
                    <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.timestamp}</td>
                    <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.value}</td>
                    <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.amount}</td>
                    <td className="text-xs font-medium py-3 pr-4 whitespace-nowrap">
                      <span className={row.type === "deposit" ? "text-[#16C784]" : "text-[#C71624]"}>
                        {row.type === "deposit" ? "Deposit" : "Withdraw"}
                      </span>
                    </td>
                    <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.address}</td>
                    <td className="text-xs font-medium text-white py-3 pr-0 whitespace-nowrap text-right">
                      <a href={row.hash} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white/80 hover:text-white">
                        <SquareArrowOutUpRight size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="holdings">
          <div></div>
        </TabsContent>
        
        <TabsContent value="orders">
          <div></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

