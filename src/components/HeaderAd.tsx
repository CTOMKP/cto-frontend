'use client'

import { useState } from "react"
import { Button } from "./ui/button";

export default function HeaderAd() {
  const [isShowing, setIsShowing] = useState(true);

  return (
    <div className={`!bg-linear-to-r from-[#FF5340] to-[#FFFFFF] to-110%  flex relative justify-center items-center h-13 ${isShowing ? '' : 'hidden'}`}>
      <p className="text-[12px] z-10">Trade 🍇 on @emojicoindotfun – Don’t Miss the Squeeze</p>
      <div className="absolute right-10 lg:right-20 flex justify-end items-center gap-[65px] lg:gap-[130px]">
        <Button className="bg-[#95325E] text-[12px] rounded-[30px] w-fit text-white flex items-center">
          Trade now <img src="/arrow-right.svg" alt="arrow-right" height={16} width={16}/>
        </Button>

        <Button onClick={() => setIsShowing(false)} className="p-0 w-fit"><img src="/close.svg" alt="close ad" height={12.36} width={12.36}/></Button>
      </div>
      <img className="absolute left-[228px]" src="/homepage/header-ad/coin-design.svg" alt="coin-design" height={49} width={49} />
      <img className="absolute left-[338px] top-[20px]" src="/homepage/header-ad/star-1.svg" alt="star-1" height={25} width={22} />
      <img className="absolute right-[345px] top-[20px]" src="/homepage/header-ad/star-2.svg" alt="star-2" height={21} width={21} />
      <img className="absolute right-[552px] top-[20px]" src="/homepage/header-ad/star-3.svg" alt="star-3" height={12} width={12} />
    </div>
  )
}
