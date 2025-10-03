"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { BrushCleaning, ChevronDown, ListFilter, X } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Image from "next/image";

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

const networks = [
  {
    name: "Aptos",
    src: "/listings-chains/aptos.png",
  },
  {
    name: "Solana",
    src: "/listings-chains/solana.png",
  },
  {
    name: "BNB",
    src: "/listings-chains/bnb.png",
  },
  {
    name: "Movement",
    src: "/listings-chains/movement.png",
  },
  {
    name: "Base",
    src: "/listings-chains/base.png",
  },
  {
    name: "Monad",
    src: "/listings-chains/monad.png",
  },
];

const filtersWithInput = ["Market cap", "Liquidity", "24hr Volume %", "Age", "Holders"];

export default function FilterButton() {

  return (
    <Dialog>
      <DialogTrigger className="p-2 text-sm text-[#FFFFFF80] border-[0.5px] border-[#FFFFFF20] flex items-center gap-1 rounded-lg">
        <ListFilter size={15} color="#FFFFFF80" /> <span>Filter</span>
      </DialogTrigger>
      <DialogContent className="bg-black text-sm border-[2px] p-4 border-[#86868630] text-[#FFFFFF9E] max-w-5xl overflow-hidden rounded-xl">
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
            <Checkbox className="fill-amber-400" color="white" />
          </div>
        ))}

        <div className="border-t-[0.5px] border-[#FFFFFF20]"></div>

        <h2 className="text-white">Dex</h2>

        <Button className="w-full bg-[#141414] justify-between rounded-lg font-medium py-2 px-3">
            <span>All Dexes</span>

            <div className="flex items-center gap-4">
                <div className="flex gap-1 ml-1">
                      {networks.map((network, index) => (
                        <div key={index} className="size-[24px] -m-1.5">
                          <Image
                            src={network.src}
                            alt={`${network.name}-img`}
                            className="w-full h-full rounded-full border-[0.3px] border-[#FFFFFF]"
                            width={24}
                            height={24}
                          />
                        </div>
                      ))}
                </div>
                <ChevronDown size={16} />
            </div>
        </Button>

        <div className="border-[0.5px] border-[#FFFFFF20]"></div>

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
            />
            <Input
              placeholder="Max"
              className="bg-[#141414] w-27 border-none rounded-lg py-2 px-3 text-white placeholder:text-[#FFFFFF20] placeholder:font-medium"
            />
            </div>
          </div>
        ))}

        <div className="border-[0.5px] border-[#FFFFFF20]"></div>

        <div className="flex items-center justify-between">
            <Button className="p-2 rounded-lg border-[0.2px] border-[#FFFFFF20]"><BrushCleaning size={16} /> Clear filter</Button>
            <Button className="p-2 rounded-lg cta-gradient w-[140px] text-white font-medium">Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
