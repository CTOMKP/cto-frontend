'use client'

import { Input } from "./ui/input";
import { useState } from "react";

export default function NavbarSearch() {
    const [searchTerm, setSearchTerm] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(searchTerm) 
    }
  return (
    <div>
        <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
            <img className="absolute left-2" src="/search.svg" alt="search" width={13.33} height={13.33}/>
            <Input onChange={(e) => setSearchTerm(e.target.value)} className="pl-7 h-[52px] w-[363px] rounded-[8px] text-base text-white placeholder:text-[#FFFFFF80] border-[0.2px] border-[#FFFFFF20] focus:!border-[0.2px] focus:!border-white focus-visible:ring-0" placeholder="Search Token, Contract or Users" />
            <span className="absolute right-2 bg-[#FFFFFF0D] text-[#FFFFFF80] rounded-[4px] flex justify-center items-center text-xs w-[39px] h-[24px]">Ctrl k</span>
        </div>
        </form>
    </div>
  )
}
