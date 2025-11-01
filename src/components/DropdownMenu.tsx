import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MoveUpRight } from "lucide-react";

export default function NavDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="mx-12 p-0">
        <Image src="/nav-bar/menu.svg" alt="menu" width={18} height={19} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="bg-[#010101] text-sm font-normal text-[#FFFFFFB2] w-76 !border-2 !border-[#86868630] p-4">
        <div>
          <div
            className="rounded-lg group p-[0.8px] transition-all duration-300"
            style={{
              background: "transparent",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              className="rounded-lg w-full h-full p-2"
              style={{
                background: "#010101",
                borderRadius: "8px",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Link href="#" className="block w-full">
                Docs
              </Link>
            </div>
          </div>
        </div>
        <div>
          <div
            className="rounded-lg group p-[0.8px] transition-all duration-300"
            style={{
              background: "transparent",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              className="rounded-lg flex w-full h-full p-2"
              style={{
                background: "#010101",
                borderRadius: "8px",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Link href="#" className="!block flex-1 items-center justify-between !w-full">
                <div className="w-full flex justify-between items-center">
                    <span>Ads</span>
                    <span className="text-[#FFDD0FB2] text-[10px] bg-[#FFDD0F0D] rounded-[3px] px-[7px] py-1.5">new!</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div>
          <div
            className="rounded-lg group p-[0.8px] transition-all duration-300"
            style={{
              background: "transparent",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              className="rounded-lg flex w-full h-full p-2"
              style={{
                background: "#010101",
                borderRadius: "8px",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Link href="#" className="!block flex-1 items-center justify-between !w-full">
                <div className="w-full flex justify-between items-center">
                    <span>Contact Support</span>
                    <MoveUpRight size={10} color="#FFFFFFB2"/>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div>
          <div
            className="rounded-lg group p-[0.8px] transition-all duration-300"
            style={{
              background: "transparent",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              className="rounded-lg flex w-full h-full p-2"
              style={{
                background: "#010101",
                borderRadius: "8px",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Link href="#" className="!block flex-1 items-center justify-between !w-full">
                Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF33] h-[1px] my-4"></div>

        
        <div>
          <div
            className="rounded-lg group p-[0.8px] transition-all duration-300"
            style={{
              background: "transparent",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              className="rounded-lg flex w-full h-full p-2"
              style={{
                background: "#010101",
                borderRadius: "8px",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <div className="flex-1 items-center justify-between cursor-pointer w-full">
                <div className="w-full flex justify-between items-center">
                    <span>Language</span>
                    <span className="flex items-center">English <ChevronRight color="#FFFFFFB2" size={18}/></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div
            className="rounded-lg group p-[0.8px] transition-all duration-300"
            style={{
              background: "transparent",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              className="rounded-lg flex w-full h-full p-2"
              style={{
                background: "#010101",
                borderRadius: "8px",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <div className="flex-1 items-center justify-between cursor-pointer w-full">
                <div className="w-full flex justify-between items-center">
                    <span>Currency</span>
                    <span className="flex items-center">USD <ChevronRight color="#FFFFFFB2" size={18}/></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full rounded-lg border-[0.2px] border-[#FFFFFF20] h-8.5 mt-4 mb-6">{"</> API"}</Button>

        <div className="p-3 rounded-lg bg-[#FFFFFF0A]">
          <h1 className="font-bold text-base text-white">Dev&apos;s gone? You&apos;re not</h1>
          <p className="text-xs mt-2 mb-4">If your community is still building, then you deserve all the spotlight</p>
          <Link href="/list-asset" className="w-full flex justify-center items-center rounded-lg h-8.5 cta-gradient text-white">Apply for Listing</Link>
        </div>

        <div className="flex justify-center items-center gap-4 mt-6">
          <span className="flex justify-center items-center size-9.5 bg-[#1A1A1A] rounded-full">
              <Image src="/globe2.svg" alt="globe" className="size-5.5" width={22} height={22} />
          </span>
          <span className="flex justify-center items-center size-9.5 bg-[#1A1A1A] rounded-full">
              <Image src="/x-white.svg" alt="x" className="size-3.5" width={14} height={14} />
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
