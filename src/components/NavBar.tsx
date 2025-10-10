"use client";

import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import Image from "next/image";
import NavbarSearch from "./NavbarSearch";
import WatchList from "./WatchList";
import Notifications from "./Notifications";
import LoginButton from "./LoginButton";
import HarvestGrape from "./HarvestGrape";
import { useCircleAuth } from "@/hooks/useCircleAuth";
// import { useWallet } from "@aptos-labs/wallet-adapter-react";
// import { useKeylessAccounts } from "../core/useKeylessAccounts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp } from "lucide-react";
import NavDropdownMenu from "./DropdownMenu";
import { usePathname } from "next/navigation";

const ExploreCategoryLinks = [
  { name: "Animals", href: "#" },
  { name: "Food & Drinks", href: "#" },
  { name: "Elon Musk-Inspired", href: "#" },
  { name: "Lifestyle and Well-being", href: "#" },
  { name: "Finance and Business", href: "#" },
  { name: "Entertainment & Media", href: "#" },
  { name: "Sports & Fitness", href: "#" },
  { name: "Technology & Science", href: "#" },
  { name: "Arts & Culture", href: "#" },
]

export default function NavBar() {
  const { isAuthenticated } = useCircleAuth();
  // const { connected } = useWallet();
  // const { activeAccount } = useKeylessAccounts();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/faq') return null

  return (
    <div className="flex items-center justify-between h-26">
      <div className="flex items-center">
        <NavDropdownMenu />
        <Image src="/nav-bar/logo.svg" alt="logo" width={188} height={51} />
      </div>

      <div className="flex items-center mx-6">
        <NavigationMenu className="text-white">
          <NavigationMenuList>
            <NavigationMenuItem>
              <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger className="flex gap-2 items-center font-normal text-base">Discover {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#010101] text-sm font-normal text-[#FFFFFFB2] w-[534px] !border-2 !border-[#86868630] p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <NavigationMenuLink className="px-0" asChild>
                      <Link href="#">Listing</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink className="px-0" asChild>
                      <Link href="#">Discovery Hub</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink className="px-0">
                      <div className="flex items-center justify-between">
                        <Link href="#">CTO Vision</Link>
                        <span className="text-[#C44FE2] text-[10px] bg-[#C44FE20D] rounded-[3px] px-[7px] py-1.5">Soon!</span>
                      </div>
                    </NavigationMenuLink>
                  </div>

                  <div>
                    <div className="pb-4.5 mb-4 border-b-[0.5px] border-[#FFFFFF20]">
                      <span className="text-sm px-2 font-normal text-white">Categories</span>
                    </div>
                    
                    <div>
                      {ExploreCategoryLinks.map((category, index) => (
                        <NavigationMenuLink key={index} asChild>
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
                              <Link
                                href={category.href}
                                className="block w-full"
                              >
                                {category.name}
                              </Link>
                            </div>
                          </div>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
              </DropdownMenu>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link className="text-base" href="#">Marketplace</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link className="text-base" href="#">Forum</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link className="text-base" href="#">
                  <span className="flex gap-1 items-center">
                    <Image src="/nav-bar/polygon.svg" alt="polygon" width={16} height={16} /> Earn
                  </span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center">
        <div className="flex items-center gap-1">
          <NavbarSearch />
          <WatchList />
          <Notifications />
        </div>

        {isAuthenticated ? <HarvestGrape /> : <LoginButton />}
        {/* {connected || activeAccount ? <HarvestGrape /> : <LoginButton />} */}
      </div>
    </div>
  );
}
