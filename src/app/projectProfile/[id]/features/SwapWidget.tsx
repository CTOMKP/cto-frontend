"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SwapWidget() {
  const [sellPercent, setSellPercent] = useState<'clear' | '25' | '50' | '75' | 'max'>('clear');

  return (
    <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] w-full p-[1px] rounded-xl inline-block">
      <div className="bg-[#010101] rounded-xl p-2">
        <div className="bg-white/3 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-white/70 font-medium">
              You&apos;re Selling
            </span>
            <span className="text-white text-xs">
              <span
                className="mr-1"
                style={{
                  background: "linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Max
              </span>
              0.00
            </span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <Input
              type="number"
              placeholder="0.00"
              className="text-white max-w-[200px] w-fit bg-transparent border-none !text-[24px] placeholder:text-[24px] placeholder:text-white appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <div className="flex rounded-[26px] bg-white/2 p-2 justify-center items-center gap-2">
              <Image
                width={24}
                height={24}
                className="size-6 rounded-full"
                src={"/listings-chains/aptos.png"}
                alt={"listings-chains"}
              />
              <span>APT</span>
              <ChevronDown
                size={20}
                color="#FFFFFF"
                className="text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/5 p-1.5 rounded-[16px] h-9.5 flex justify-between items-center w-full gap-1.5">
              <Button
                className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === 'clear' ? 'cta-gradient' : ''}`}
                onClick={(e) => { e.preventDefault(); setSellPercent('clear'); }}
              >
                Clear
              </Button>
              <Button
                className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === '25' ? 'cta-gradient' : ''}`}
                onClick={(e) => { e.preventDefault(); setSellPercent('25'); }}
              >
                25%
              </Button>
              <Button
                className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === '50' ? 'cta-gradient' : ''}`}
                onClick={(e) => { e.preventDefault(); setSellPercent('50'); }}
              >
                50%
              </Button>
              <Button
                className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === '75' ? 'cta-gradient' : ''}`}
                onClick={(e) => { e.preventDefault(); setSellPercent('75'); }}
              >
                75%
              </Button>
              <Button
                className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === 'max' ? 'cta-gradient' : ''}`}
                onClick={(e) => { e.preventDefault(); setSellPercent('max'); }}
              >
                Max
              </Button>
            </div>

            <Button className="p-0 bg-[#FF4A15005] py-[5px] w-10 px-[13px] rounded-full">
              <Image
                src={"/convert.svg"}
                alt={"convert"}
                width={14}
                height={14}
              />
            </Button>
          </div>
        </div>

        <div className="flex justify-center relative">
          <Button className="absolute -top-3.5 z-10 bg-[#010101] border-[0.2px] border-white/20 size-13 p-0 rounded-full">
            <span className="size-7 rounded-full flex justify-center items-center">
              <Image
                src={"/switch-diagonal.svg"}
                alt={"switch"}
                width={16}
                height={16}
              />
            </span>
          </Button>
        </div>

        <div className="bg-white/3 p-4 rounded-lg mt-2">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-white/70 font-medium">
              You&apos;re Selling
            </span>
            <span className="text-white text-xs">
              <span
                className="mr-1"
                style={{
                  background: "linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Max
              </span>
              0.00
            </span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <Input
              type="number"
              placeholder="0.00"
              className="text-white max-w-[200px] w-fit bg-transparent border-none !text-[24px] placeholder:text-[24px] placeholder:text-white appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <div className="flex rounded-[26px] bg-white/2 p-2 justify-center items-center gap-2">
              <Image
                width={24}
                height={24}
                className="size-6 rounded-full"
                src={"/listings-chains/solana.png"}
                alt={"listings-chains"}
              />
              <span>SOL</span>
              <ChevronDown
                size={20}
                color="#FFFFFF"
                className="text-white"
              />
            </div>
          </div>
        </div>

        <Button className="w-full mt-4 cta-gradient">Swap</Button>

        <div className="flex bg-white/3 rounded-lg justify-center mt-4 py-4.5 items-center gap-1">
          <Image
            className="rounded-full"
            src={"/panora-logo.jpg"}
            alt={"panora-logo"}
            width={13}
            height={13}
          />
          <p className="text-xs text-white/70">
            Powered by Panora Exchange
          </p>
        </div>
      </div>
    </div>
  );
}

