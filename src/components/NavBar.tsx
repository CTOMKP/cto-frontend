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
import { usePrivy } from "@privy-io/react-auth";
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
];

export default function NavBar() {
  const { isAuthenticated } = usePrivyAuth();
  const { authenticated: privyAuthenticated, ready } = usePrivy();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(false);
  const pathname = usePathname();


  const showAuthenticatedUI = (privyAuthenticated && ready) || isAuthenticated;

  // Check if user has avatar and listen for changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkAvatar = () => {
        if (showAuthenticatedUI) {
          const avatarUrl = localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url');
          setHasAvatar(!!avatarUrl);
        } else {
          setHasAvatar(false);
        }
      };

      // Check immediately
      checkAvatar();

      const interval = setInterval(checkAvatar, 500);

      window.addEventListener('storage', checkAvatar);

      window.addEventListener('avatarUpdated', checkAvatar);

      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', checkAvatar);
        window.removeEventListener('avatarUpdated', checkAvatar);
      };
    }
  }, [showAuthenticatedUI]);

  if (pathname === "/" || pathname === "/faq") return null;

  return (
    <div className="flex justify-between h-fit">
      <div className="flex items-center">
        <div className="border-r-[0.2px] mr-4 border-[#FFFFFF20] h-full flex justify-center items-center">
          <NavDropdownMenu />
        </div>
        <div className="flex items-center gap-10">
          <Image
            loading="lazy"
            src="/nav-bar/logo.svg"
            alt="logo"
            width={188}
            height={51}
          />

          <div className="flex items-center mx-6 mt-3 h-26">
            <NavigationMenu className="text-white">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <DropdownMenu
                    open={isDropdownOpen}
                    onOpenChange={setDropdownOpen}
                  >
                    <DropdownMenuTrigger className="flex gap-2 items-center font-normal text-base">
                      Discover{" "}
                      {isDropdownOpen ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#010101] text-sm font-normal text-[#FFFFFFB2] w-[534px] !border-2 !border-[#86868630] p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          {[
                            {
                              label: "Listing",
                              href: "/listings",
                            },
                            {
                              label: "Discovery Hub",
                              href: "/categories",
                            },
                          ].map((item) => (
                            <NavigationMenuLink
                              key={item.label}
                              className="px-0"
                            >
                              <div
                                className="rounded-lg p-[1px] transition-all duration-300"
                                style={{ background: "transparent" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                              >
                                <div
                                  className="rounded-lg w-full h-full px-2 py-2"
                                  style={{
                                    background: "#010101",
                                    transition: "all 0.3s ease-in-out",
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <Link href={item.href}>{item.label}</Link>
                                  </div>
                                </div>
                              </div>
                            </NavigationMenuLink>
                          ))}
                          <NavigationMenuLink className="px-0">
                            <div
                              className="rounded-lg p-[1px] transition-all duration-300"
                              style={{ background: "transparent" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "transparent";
                              }}
                            >
                              <div
                                className="rounded-lg w-full h-full px-2 py-1"
                                style={{
                                  background: "#010101",
                                  transition: "all 0.3s ease-in-out",
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <Link href="#">CTO Vision</Link>
                                  <span className="text-[#C44FE2] text-[10px] bg-[#C44FE20D] rounded-[3px] px-[7px] py-1.5">
                                    Soon!
                                  </span>
                                </div>
                              </div>
                            </div>
                          </NavigationMenuLink>
                        </div>

                        <div>
                          <div className="pb-4.5 mb-4 border-b-[0.5px] border-[#FFFFFF20]">
                            <span className="text-sm px-2 font-normal text-white">
                              Categories
                            </span>
                          </div>

                          <div>
                            {ExploreCategoryLinks.map((category, index) => (
                              <NavigationMenuLink key={index} asChild>
                                <div
                                  className="rounded-lg group p-[1px] transition-all duration-300"
                                  style={{
                                    background: "transparent",
                                    borderRadius: "8px",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                      "transparent";
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
                    <Link className="text-base" href="#">
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
                    <Link className="text-base" href="#">
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
        {showAuthenticatedUI ? (
          <div className="flex items-center gap-1">
            <NavBarChats />
            <WatchList />
            <Notifications />
          </div>
        ) : null}

        <div className="border-l-[0.2px] ml-4 border-[#FFFFFF20] h-full flex items-center justify-center gap-2">
          {showAuthenticatedUI ? (
            <>
              {hasAvatar ? <AvatarDropdown /> : <HarvestGrape />}
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </div>
  );
}
