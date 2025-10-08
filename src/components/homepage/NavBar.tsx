"use client"

import React, { useState } from 'react'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '../ui/navigation-menu';
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenu, DropdownMenuItem } from '../ui/dropdown-menu';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';

export default function NavBar() {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
  return (
    <div className="flex items-center w-full max-w-[1168px] justify-between p-4 md:p-6 bg-[#FFFFFF08] rounded-2xl">
      {/* Logo - Desktop uses logo.svg, Mobile uses logo.png */}
      <div>
        <Image 
          src="/nav-bar/logo.svg" 
          alt="logo" 
          width={188} 
          height={51} 
          className="hidden md:block"
        />
        <Image 
          src="/logo.png" 
          alt="logo" 
          width={40} 
          height={40} 
          className="block md:hidden"
        />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center mx-6">
        <NavigationMenu className="text-white">
          <NavigationMenuList>
            <NavigationMenuItem>
              <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger className="flex gap-2 items-center font-normal text-base">
                Community {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#010101] text-sm font-normal text-[#FFFFFFB2] !border-2 !border-[#86868630] p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <NavigationMenuLink className="px-0" asChild>
                      <Link href="#">FAQ</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink className="px-0" asChild>
                      <Link href="#">Docs</Link>
                    </NavigationMenuLink>
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
                <Link className="text-base" href="#">FAQ</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link className="text-base" href="#">Docs</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Desktop CTA Button */}
      <Link className='cta-gradient hidden md:flex justify-center items-center rounded-lg h-10 w-30.5 px-4' href={'/listings'}>
        Launch App
      </Link>

      {/* Mobile Hamburger Menu */}
      <div className="flex md:hidden items-center gap-2">
        <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <DropdownMenuTrigger className="text-white p-2">
            <Menu size={24} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#010101] text-white !border-2 !border-[#86868630] p-4 mr-4">
            <DropdownMenuItem asChild>
              <Link href="#" className="text-base py-2 cursor-pointer">Community</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#" className="text-base py-2 cursor-pointer">FAQ</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#" className="text-base py-2 cursor-pointer">Docs</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link 
                href="/listings" 
                className="cta-gradient flex justify-center items-center rounded-lg h-10 mt-2 cursor-pointer"
              >
                Launch App
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
