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
import WatchList from "./WatchList";
import Notifications from "./Notifications";
import LoginButton from "./LoginButton";
import HarvestGrape from "./HarvestGrape";
import AvatarDropdown from "./AvatarDropdown";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp } from "lucide-react";
import NavDropdownMenu from "./DropdownMenu";
import { usePathname } from "next/navigation";
import NavBarChats from "./NavBarChats";
import { useSessionStore } from "@/lib/sessionStore";
import {
  DISCOVERY_CATEGORIES,
  getDiscoveryCategoryHref,
} from "@/lib/discoveryCategories";

const gradientHoverHandlers = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.background =
      "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.background = "transparent";
  },
};

const discoverNavItems: {
  label: string;
  href: string;
  revealsCategories?: boolean;
}[] = [
  { label: "Listing", href: "/listings" },
  { label: "Discovery Hub", href: "/categories", revealsCategories: true },
];

export default function NavBar() {
  const { isAuthenticated, ready, isLoading: authLoading } = usePrivyAuth();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const hasAvatar = useSessionStore((s) => s.hasAvatar);
  const pathname = usePathname();

  // Single "auth resolved" signal: only show auth-dependent UI when we know the real state
  const authResolved = !authLoading;

  useEffect(() => {
    if (!authResolved || !isAuthenticated) {
      useSessionStore.getState().setHasAvatar(false);
    }
  }, [authResolved, isAuthenticated]);

  if (pathname === "/" || pathname === "/faq") return null;

  return (
    <div className="flex justify-between h-fit">
      <div className="flex items-center">
        <div className="border-r-[0.2px] mr-4 border-[#FFFFFF20] h-full flex justify-center items-center">
          <NavDropdownMenu />
        </div>
        <div className="flex items-center gap-10">
          <Link href="/listings">
          <Image
            loading="lazy"
            src="/nav-bar/logo.svg"
            alt="logo"
            width={188}
            height={51}
          />
          </Link>

          <div className="flex items-center mx-6 mt-3 h-26">
            <NavigationMenu className="text-white">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <DropdownMenu
                    open={isDropdownOpen}
                    onOpenChange={(open) => {
                      setDropdownOpen(open);
                      if (!open) setShowCategories(false);
                    }}
                  >
                    <DropdownMenuTrigger className="flex gap-2 items-center font-normal text-base">
                      Discover{" "}
                      {isDropdownOpen ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className={`bg-[#010101] text-sm font-normal text-[#FFFFFFB2] !border-2 !border-[#86868630] p-6 transition-[width] duration-200 ${
                        showCategories ? "w-[534px]" : "w-[280px]"
                      }`}
                      onMouseLeave={() => setShowCategories(false)}
                    >
                      <div className="flex gap-4">
                        <div className="min-w-[220px]">
                          {discoverNavItems.map((item) => (
                            <NavigationMenuLink key={item.label} className="px-0 block mb-1">
                              <Link
                                href={item.href}
                                className="block rounded-lg p-[1px] transition-all duration-300"
                                style={{ background: "transparent" }}
                                {...gradientHoverHandlers}
                                onMouseEnter={(e) => {
                                  gradientHoverHandlers.onMouseEnter(e);
                                  setShowCategories(!!item.revealsCategories);
                                }}
                              >
                                <div
                                  className="rounded-lg w-full h-full px-2 py-2"
                                  style={{
                                    background: "#010101",
                                    transition: "all 0.3s ease-in-out",
                                  }}
                                >
                                  {item.label}
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                          <NavigationMenuLink className="px-0">
                            <div
                              className="rounded-lg p-[1px] transition-all duration-300"
                              style={{ background: "transparent" }}
                              {...gradientHoverHandlers}
                              onMouseEnter={() => setShowCategories(false)}
                            >
                              <div
                                className="rounded-lg w-full h-full px-2 py-1"
                                style={{
                                  background: "#010101",
                                  transition: "all 0.3s ease-in-out",
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[#FFFFFFB2]">CTO Vision</span>
                                  <span className="text-[#C44FE2] text-[10px] bg-[#C44FE20D] rounded-[3px] px-[7px] py-1.5">
                                    Soon!
                                  </span>
                                </div>
                              </div>
                            </div>
                          </NavigationMenuLink>
                        </div>

                        {showCategories ? (
                          <div
                            className="flex-1 border-l-[0.5px] border-[#FFFFFF20] pl-4"
                            onMouseEnter={() => setShowCategories(true)}
                          >
                            <div className="pb-4.5 mb-4 border-b-[0.5px] border-[#FFFFFF20]">
                              <span className="text-sm px-2 font-normal text-white">
                                Categories
                              </span>
                            </div>

                            <div className="max-h-[320px] overflow-y-auto pr-1">
                              {DISCOVERY_CATEGORIES.map((category) => (
                                <NavigationMenuLink
                                  key={category.slug}
                                  className="px-0 block mb-1"
                                >
                                  <Link
                                    href={getDiscoveryCategoryHref(category.slug)}
                                    className="block rounded-lg p-[1px] transition-all duration-300"
                                    style={{ background: "transparent" }}
                                    {...gradientHoverHandlers}
                                    onClick={() => setDropdownOpen(false)}
                                  >
                                    <div
                                      className="rounded-lg w-full h-full p-2"
                                      style={{
                                        background: "#010101",
                                        transition: "all 0.3s ease-in-out",
                                      }}
                                    >
                                      {category.name}
                                    </div>
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link className="text-base" href="/marketplace">
                      Marketplace
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link className="text-base" href="#">
                      Forum
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link
                      className="text-base"
                      href={process.env.NEXT_PUBLIC_CREATOR_PROGRAM_URL || "https://earn.ctomarketplace.com"}
                    >
                      <span className="flex gap-1 items-center">
                        <Image
                          loading="lazy"
                          src="/nav-bar/polygon.svg"
                          alt="polygon"
                          width={16}
                          height={16}
                        />{" "}
                        Earn
                      </span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        {authResolved && isAuthenticated ? (
          <div className="flex items-center gap-1">
            <NavBarChats />
            <WatchList />
            <Notifications />
          </div>
        ) : null}

        <div className="border-l-[0.2px] ml-4 border-[#FFFFFF20] h-full flex items-center justify-center gap-2">
          {!authResolved ? (
            <div className="w-20 h-9" aria-hidden />
          ) : isAuthenticated ? (
            <>
              <div style={{ display: hasAvatar ? 'none' : 'block' }}>
                <HarvestGrape />
              </div>
              {hasAvatar && <AvatarDropdown />}
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </div>
  );
}
