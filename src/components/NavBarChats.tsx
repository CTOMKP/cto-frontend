"use client";

// import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

export type Filter = "all" | "unread";

export default function NavBarChats() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const filters: Filter[] = ["all", "unread"];

  const labels: Record<Filter, string> = {
    all: "All",
    unread: "Unread (6)",
  };

  return (
    <DropdownMenu
      open={isDropdownOpen}
      onOpenChange={(open) => setDropdownOpen(open)}
    >
      <DropdownMenuTrigger>
        <span className="relative flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20]">
          <span className="bg-[#FFFFFF0D] rounded-sm size-7 flex items-center justify-center">
            <Image
              src="/chat.svg"
              alt="watchlist"
              width={15}
              height={15}
            />
          </span>
          {/* <Badge className="h-4 absolute top-1 right-1 text-[10px] font-bold text-white cta-gradient min-w-4 rounded-full px-1 font-mono tabular-nums">
            <span>8</span>
          </Badge> */}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#010101] text-white p-6 w-[534px] border-2 border-[#86868630]">
        <div>
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b-[0.5px] border-[#FFFFFF20]">
            <h3 className="text-base font-bold mb-2">Chats</h3>
            <Button onClick={() => setDropdownOpen(false)}>
              <X />
            </Button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF20] rounded-lg items-center px-1">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg ${
                    selectedFilter === filter
                      ? "bg-[#17171C] text-white"
                      : "bg-transparent text-[#A1A1AA]"
                  }`}
                >
                  {labels[filter]}
                </Button>
              ))}
            </div>

            <button className="border-[0.2px] gap-1 w-[119px] text-[#A1A1AA] !px-0 border-[#FFFFFF20] rounded-lg h-9 font-medium text-sm flex items-center justify-center">
              Mark as read <Check size={12} />
            </button>
          </div>
        </div>

        <div>
          <span className="text-xs font-normal text-[#FFFFFFB2]">You have no price chats yet</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
