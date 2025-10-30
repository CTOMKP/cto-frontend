"use client";

// import { useState } from "react";
import { X } from "lucide-react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { usePanoraWidget } from "@panoraexchange/widget-sdk"
// import { Button } from "./ui/button";
// import PanoraSwapWidget from "./PanoraSwapWidget";

export default function TokenSwapCard() {
  // const [sellToken, setSellToken] = useState("APT");
  // const [buyToken, setBuyToken] = useState("GRAPES");
  // const [sellAmount, setSellAmount] = useState("");
  // const [buyAmount, setBuyAmount] = useState("");
  // const widget = usePanoraWidget()

  // const handleSwap = () => {
  //   setSellToken(buyToken);
  //   setBuyToken(sellToken);
  //   setSellAmount(buyAmount);
  //   setBuyAmount(sellAmount);
  // };

  return (
    // <Button onClick={() => widget.openTokenPicker()}>click open</Button>
    <div>
      <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-2xl inline-block">
        <DialogTrigger className="bg-black cursor-pointer text-white size-15 text-sm rounded-2xl flex items-center justify-center hover:opacity-90 transition">
          <Image src="/emoji-icons/grape.svg" className="size-6.5" alt="grape icon" width={26} height={26} />
        </DialogTrigger>
      </div>
      <DialogContent className="bg-[#010101] border-2 border-[#86868630]">
        <DialogHeader className="hidden">
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>Grape swap</DialogDescription>
        </DialogHeader>

        <div className="text-white rounded-xl shadow-lg  space-y-4">
          <div className="flex items-center justify-between pb-4.5 border-b-[0.5px] border-[#FFFFFF33]">
            <div className="text-2xl"><Image src="/emoji-icons/grape.svg" className="size-6.5" alt="grape icon" width={26} height={26} /></div>
            <DialogClose className="cursor-pointer"><X /></DialogClose>
          </div>

          {/*<div className="bg-black p-4 rounded-lg space-y-2 border border-[#5c5c5c30]">
            <div className="text-sm text-gray-400">You're Selling</div>
            <div className="text-3xl font-semibold">{sellAmount || "0.00"}</div>

            <div className="flex items-center justify-between">
              <div className="text-red-400 text-xs">Max 0.00</div>
              <div className="bg-[#1c1c1c] rounded-full px-3 py-1 flex items-center space-x-2">
                <span className="text-sm font-medium">{sellToken}</span>
                <span className="text-white text-xs">▼</span>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              {["Clear", "25%", "50%", "Custom", "Max"].map((btn, i) => (
                <button
                  key={i}
                  onClick={() => setSellAmount(btn === "Clear" ? "" : "0.00")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    btn === "Clear"
                      ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                      : "bg-[#1c1c1c] text-gray-300"
                  }`}
                >
                  {btn}
                </button>
              ))}
              <button
                onClick={handleSwap}
                className="ml-auto bg-[#1c1c1c] p-2 rounded-full text-gray-400 hover:text-white"
              >
                <ArrowLeftRight size={16} />
              </button>
            </div>
          </div>*\}

          {/* <div className="bg-black p-4 rounded-lg space-y-2 border border-[#5c5c5c30]">
            <div className="text-sm text-gray-400">You're Buying</div>
            <div className="text-3xl font-semibold">{buyAmount || "0.00"}</div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">0.00</div>
              <Select onValueChange={(value) => setBuyToken(value)}>
                <SelectTrigger className="w-[180px] bg-[#1c1c1c] rounded-full px-3 py-1 flex items-center space-x-2">
                  <SelectValue defaultValue="light" placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          {/* <button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white text-center py-3 rounded-lg font-medium text-lg">
            Enter an amount
          </button> */}

          {/* <div className="text-center text-sm text-gray-500 pt-2 border-t border-[#333]">
            <p className="flex justify-center items-center gap-1">
              <span>🅿️</span> Powered by Panora Exchange
            </p>
          </div> */}
          {/* <PanoraSwapWidget /> */}
        </div>
      </DialogContent>
    </div>
  );
}
