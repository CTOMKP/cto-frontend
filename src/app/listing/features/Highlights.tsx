import React from 'react'
import { Button } from '../../../components/ui/button'
import Image from 'next/image'
import TrendingCoins from './TrendingCoins'
import TrendingCommunity from './TrendingCommunity'
import Breadcrumbs from './Breadcrumbs'

export default function Highlights() {
  return (
    <div className='text-white w-[87%] mx-auto'>
      <div className='flex items-center justify-between mt-4 mb-2 p-2'>
        <div className='flex items-center gap-1'>
          <h1 className='text-2xl'>Highligts</h1><Image className='mt-1' src="/emoji-icons/highlight-star.svg" alt="highlight-star" width={16} height={16} />
        </div>

        <div className='flex items-center gap-2'>
          <Button className='h-8 rounded-lg border-[0.2px] border-[#FFFFFF20]'><Image src="/customise.svg" alt="customise" width={13.33} height={12} /> Customize</Button>
          <Button className='h-8 rounded-lg border-[0.2px] border-[#FFFFFF20]'><Image src="/eye-closed.svg" alt="customise" width={13.89} height={12} /></Button>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <TrendingCoins />
        <TrendingCommunity />
        <Breadcrumbs />
        {/* <div className='flex flex-col justify-between min-h-[317px]'>
          
        </div> */}
      </div>
    </div>
  )
}
