"use client"

import React, { useState } from 'react'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '../ui/navigation-menu';
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenu } from '../ui/dropdown-menu';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';

export default function NavBar() {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    
  return (
    <div className="flex items-center w-[1168px] justify-between p-6 bg-[#FFFFFF08] rounded-2xl">
      <div>
        <Image src="/nav-bar/logo.svg" alt="logo" width={188} height={51} />
      </div>

      <div className="flex items-center mx-6">
        <NavigationMenu className="text-white">
          <NavigationMenuList>
            <NavigationMenuItem>
              <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger className="flex gap-2 items-center font-normal text-base">Community {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</DropdownMenuTrigger>
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

        <Button className='cta-gradient rounded-lg h-10 w-30.5'>Join waitlist</Button>
      </div>
  )
}
