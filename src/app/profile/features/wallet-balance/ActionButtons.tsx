import React from "react";
import { Button } from "@/components/ui/button";
import { MoveDown, MoveUp, ArrowUpDown } from "lucide-react";

export default function ActionButtons() {
  return (
    <div className="mt-5 flex items-center gap-2">
      <Button className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] flex-1 h-12 py-3.5 px-6 rounded-full">
        {" "}
        <MoveDown /> Deposit
      </Button>
      <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-full flex-1">
        <Button className="bg-[#010101] h-12 w-full py-3.5 px-6 rounded-full text-white border-none">
          {" "}
          <MoveUp /> Withdraw
        </Button>
      </div>
      <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-full">
        <Button className="bg-[#010101] size-12 rounded-full text-white border-none">
          {" "}
          <ArrowUpDown />
        </Button>
      </div>
    </div>
  );
}
