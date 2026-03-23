"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { BrushCleaning, ListFilter, X } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ApiCoinItem } from "@/types/api";

// Define filter conditions interface
// interface FilterConditions {
//   communityScore: { min: number | null; max: number | null };
//   lpBurned: { min: number | null; max: number | null };
//   top10Holders: { min: number | null; max: number | null };
//   marketCap: { min: number | null; max: number | null };
//   liquidity: { min: number | null; max: number | null };
//   volume24h: { min: number | null; max: number | null };
//   age: { min: number | null; max: number | null };
//   holders: { min: number | null; max: number | null };
//   mintAuthDisabled: boolean;
//   raidingDetected: boolean;
//   atLeastOneSocial: boolean;
// }

const filters = [
    {
        id: "community-score",
        label: "Community Score"
    },
    {
        id: "lp-burned->=-505",
        label: "LP Burned >= 50%"
    },
    {
        id: "top-10-holders-<-15%",
        label: "Top 10 Holders < 15%"
    },
    {
        id: "mint-auth-disabled",
        label: "Mint Auth Disabled"
    },
    {
        id: "at-lest-1-social",
        label: "At least 1 social"
    },
    {
        id: "raiding",
        label: "Raiding"
    }
]

const filtersWithInput = ["Market cap", "Liquidity", "24hr Volume %", "Age", "Holders"];

export default function FilterButton({
  items,
  onFilterChange,
}: {
  items: ApiCoinItem[];
  onFilterChange: (filteredItems: ApiCoinItem[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const [checkboxFilters, setCheckboxFilters] = useState<Record<string, boolean>>({
    "community-score": false,
    "lp-burned->=-505": false,
    "top-10-holders-<-15%": false,
    "mint-auth-disabled": false,
    "at-lest-1-social": false,
    "raiding": false,
  });

  const [rangeFilters, setRangeFilters] = useState<Record<string, { min: string; max: string }>>({
    "Market cap": { min: "", max: "" },
    "Liquidity": { min: "", max: "" },
    "24hr Volume %": { min: "", max: "" },
    "Age": { min: "", max: "" },
    "Holders": { min: "", max: "" },
  });

  const handleCheckboxChange = (filterId: string, checked: boolean) => {
    setCheckboxFilters(prev => ({
      ...prev,
      [filterId]: checked
    }));
  };

  const handleRangeChange = (filterName: string, field: 'min' | 'max', value: string) => {
    setRangeFilters(prev => ({
      ...prev,
      [filterName]: {
        ...prev[filterName],
        [field]: value
      }
    }));
  };

  const applyFilters = async () => {
    setIsApplying(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredItems = [...items];

    // Apply checkbox filters
    if (checkboxFilters["community-score"]) {
      filteredItems = filteredItems.filter(item => (item?.communityScore ?? 0) >= 50);
    }
    if (checkboxFilters["lp-burned->=-505"]) {
      filteredItems = filteredItems.filter(item => (item.lpBurnedPercentage ?? 0) >= 50);
    }
    if (checkboxFilters["top-10-holders-<-15%"]) {
      filteredItems = filteredItems.filter(item => (item.top10HoldersPercentage ?? 100) < 15);
    }
    if (checkboxFilters["mint-auth-disabled"]) {
      filteredItems = filteredItems.filter(item => item.mintAuthDisabled === true);
    }
    if (checkboxFilters["at-lest-1-social"]) {
      // This would need social media data from API
      // For now, we'll skip this filter
    }
    if (checkboxFilters["raiding"]) {
      filteredItems = filteredItems.filter(item => item.raidingDetected === true);
    }

    // Apply range filters
    if (rangeFilters["Market cap"].min) {
      const min = parseFloat(rangeFilters["Market cap"].min);
      if (!isNaN(min)) {
        filteredItems = filteredItems.filter(item => (item?.marketCap ?? 0) >= min);
      }
    }
    if (rangeFilters["Market cap"].max) {
      const max = parseFloat(rangeFilters["Market cap"].max);
      if (!isNaN(max)) {
        filteredItems = filteredItems.filter(item => (item?.marketCap ?? 0) <= max);
      }
    }

    if (rangeFilters["Liquidity"].min) {
      const min = parseFloat(rangeFilters["Liquidity"].min);
      if (!isNaN(min)) {
        filteredItems = filteredItems.filter(item => item.liquidityUsd >= min);
      }
    }
    if (rangeFilters["Liquidity"].max) {
      const max = parseFloat(rangeFilters["Liquidity"].max);
      if (!isNaN(max)) {
        filteredItems = filteredItems.filter(item => item.liquidityUsd <= max);
      }
    }

    if (rangeFilters["24hr Volume %"].min) {
      const min = parseFloat(rangeFilters["24hr Volume %"].min);
      if (!isNaN(min)) {
        filteredItems = filteredItems.filter(item => (item?.change24h ?? 0) >= min);
      }
    }
    if (rangeFilters["24hr Volume %"].max) {
      const max = parseFloat(rangeFilters["24hr Volume %"].max);
      if (!isNaN(max)) {
        filteredItems = filteredItems.filter(item => (item?.change24h ?? 0) <= max);
      }
    }

    if (rangeFilters["Holders"].min) {
      const min = parseInt(rangeFilters["Holders"].min);
      if (!isNaN(min)) {
        filteredItems = filteredItems.filter(item => item.holders >= min);
      }
    }
    if (rangeFilters["Holders"].max) {
      const max = parseInt(rangeFilters["Holders"].max);
      if (!isNaN(max)) {
        filteredItems = filteredItems.filter(item => item.holders <= max);
      }
    }

    // Pass filtered items back to parent
    onFilterChange(filteredItems);
    
    setIsApplying(false);
    setIsOpen(false); // Close dialog after applying
  };

  const clearFilters = () => {
    setCheckboxFilters({
      "community-score": false,
      "lp-burned->=-505": false,
      "top-10-holders-<-15%": false,
      "mint-auth-disabled": false,
      "at-lest-1-social": false,
      "raiding": false,
    });
    setRangeFilters({
      "Market cap": { min: "", max: "" },
      "Liquidity": { min: "", max: "" },
      "24hr Volume %": { min: "", max: "" },
      "Age": { min: "", max: "" },
      "Holders": { min: "", max: "" },
    });
    // Reset to show all items
    onFilterChange(items);
    setIsOpen(false); // Close dialog after clearing
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="p-2 text-sm text-[#FFFFFF80] border-[0.5px] border-[#FFFFFF20] flex items-center gap-1 rounded-lg">
        <ListFilter size={15} color="#FFFFFF80" /> <span>Filter</span>
      </DialogTrigger>
      <DialogContent className="bg-black text-sm border-[2px] p-4 border-[#86868630] text-[#FFFFFF9E] max-w-5xl h-full overflow-auto rounded-xl hover-scrollbar">
        <DialogHeader className="flex !flex-row justify-between items-center pb-2 border-b-[0.5px] border-[#FFFFFF20]">
          <div>
            <DialogTitle className="font-bold text-white text-base">
              Filter
            </DialogTitle>
          </div>
          <DialogClose>
            <X />
          </DialogClose>
        </DialogHeader>

        <p>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45]">#Active Filters</span>
        </p>

        {filters.map((filter, index) => (
          <div key={index} className="flex items-center justify-between">
            <Label>{filter.label}</Label>
            <Checkbox 
              className="fill-amber-400" 
              color="white"
              checked={checkboxFilters[filter.id]}
              onCheckedChange={(checked) => handleCheckboxChange(filter.id, checked as boolean)}
            />
          </div>
        ))}

        <div className="border-t-[0.5px] border-[#FFFFFF20]"></div>

        {filtersWithInput.map((label, index) => (
          <div className="flex justify-between" key={index}>
            <Label border-none
              className="text-white font-medium text-sm flex items-center"
            >
              {label}
            </Label>
            <div className="flex gap-4">
                <Input
              placeholder="Min"
              className="bg-[#141414] w-27 border-none rounded-lg py-2 px-3 text-white placeholder:text-[#FFFFFF20] placeholder:font-medium"
              value={rangeFilters[label].min}
              onChange={(e) => handleRangeChange(label, 'min', e.target.value)}
            />
            <Input
              placeholder="Max"
              className="bg-[#141414] w-27 border-none rounded-lg py-2 px-3 text-white placeholder:text-[#FFFFFF20] placeholder:font-medium"
              value={rangeFilters[label].max}
              onChange={(e) => handleRangeChange(label, 'max', e.target.value)}
            />
            </div>
          </div>
        ))}

        <div className="border-t-[0.5px] border-[#FFFFFF20]"></div>

        <div className="flex items-center justify-between">
            <Button 
              className="p-2 rounded-lg border-[0.2px] border-[#FFFFFF20]"
              onClick={clearFilters}
              disabled={isApplying}
            >
              <BrushCleaning size={16} /> Clear filter
            </Button>
            <Button 
              className="p-2 rounded-lg cta-gradient w-[140px] text-white font-medium"
              onClick={applyFilters}
              disabled={isApplying}
            >
              {isApplying ? "Applying..." : "Apply"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
