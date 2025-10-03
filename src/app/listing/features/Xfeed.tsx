import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import Image from 'next/image'

export default function Xfeed() {
  return (
    <Card className="w-[333px] p-3 border border-[#FF007510]">
    <CardHeader className='px-0'>
        <CardTitle className='flex items-start justify-between text-base font-bold'>
            <div className='flex items-center gap-1'>
            <Image
            src="/homepage/trending-coins/default-coin.png"
            alt="profile pic"
            width={24}
            height={24}
            className='rounded-full border-[0.36px] border-white'
          />
          Kikachukwu
          <Image
            className="mt-0.5"
            src="/x-verified-badge.svg"
            alt="info"
            width={14}
            height={14}
          />

          <span className='text-[#6E767D] font-light text-xs'>1 sec ago.</span>
        </div>
        
        <span className='size-7 flex justify-center items-center rounded-[5px] border-[0.13px] border-[#FFFFFF20]'>
            <Image src="/x-white.svg" alt="x-white-logo" width={16} height={16} />
        </span>
        </CardTitle>
    </CardHeader>
    <CardContent className="px-0 -mt-4 flex items-start gap-2">
        <Image src="/x-default-img.png" alt="x-default-img" width={95} height={65} className='rounded-[2px]' />
        <p className='text-[#D9D9D9] text-xs font-medium text-wrap'>At the <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45]'>@web3lagos</span> yesterday was so much fun met a lot of great guys made the whole experience worth is <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45]'>$trump</span></p>
    </CardContent>
    </Card>
  )
}
