import React from 'react'
import { Button } from './ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from 'next/link'
import NavbarSearch from './NavbarSearch'
import WatchList from './WatchList'
import Notifications from './Notifications'
import LoginButton from './LoginButton'

export default function NavBar() {
  return (
    <div className='flex items-center justify-between h-26'>
      <div className='flex items-center'>
        <div className='border-r-[0.2px] border-[#FFFFFF20] h-full'>
          <Button className='mx-12 p-0'><img src="/nav-bar/menu.svg" alt="menu" width={18} height={19}/></Button>
        </div>
        <img src="/nav-bar/logo.svg" alt="logo" width={188} height={51}/>
      </div>

      <div className='flex items-center mx-6'>
      <NavigationMenu className='text-white text-base'>
        <NavigationMenuList>
          <NavigationMenuItem>
          <NavigationMenuTrigger>Listing</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="#">Components</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#">Documentation</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#">Blocks</Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="#">Marketplace</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="#">Forum</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="#"><span className='flex gap-1 items-center'><img src="/nav-bar/polygon.svg" alt="" /> Earn</span></Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      </div>
      
      <div className='flex items-center'>
        <div className='flex items-center gap-1'>
          <NavbarSearch />
          <WatchList />
          <Notifications />
        </div>

        <LoginButton />
      </div>
    </div>
  )
}
