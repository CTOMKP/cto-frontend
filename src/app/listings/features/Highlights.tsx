import React, { useState } from 'react'
import { Button } from '../../../components/ui/button'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import TrendingCoins from './TrendingCoins'
import TrendingCommunity from './TrendingCommunity'
// import Breadcrumbs from './Breadcrumbs'
import { ApiCoinItem } from '@/types/api'

// Define the API item type to match the actual data structure

export default function Highlights({
  apiData,
  isLoading,
}: {
  apiData: ApiCoinItem[];
  isLoading: boolean;
}) {
  const [isHidden, setIsHidden] = useState(false);
  
  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };
  
  return (
    <div className='text-white w-[87%] mx-auto'>
      <div className='flex items-center justify-between mt-4 mb-2 p-2'>
        <div className='flex items-center gap-1'>
          <h1 className='text-2xl'>Highligts</h1><Image className='mt-1' src="/emoji-icons/highlight-star.svg" alt="highlight-star" width={16} height={16} />
          {isHidden && (
            <Button 
              onClick={toggleVisibility}
              className='h-8 rounded-lg border-[0.2px] border-[#FFFFFF20] ml-2'
            >
              <Eye size={14} />
            </Button>
          )}
        </div>

        {!isHidden && (
          <div className='flex items-center gap-2'>
            <Button className='h-8 rounded-lg border-[0.2px] border-[#FFFFFF20]'><Image src="/customise.svg" alt="customise" width={13.33} height={12} /> Customize</Button>
            <Button 
              onClick={toggleVisibility}
              className='h-8 rounded-lg border-[0.2px] border-[#FFFFFF20]'
            >
              <EyeOff size={14} />
            </Button>
          </div>
        )}
      </div>

      {!isHidden && (
        <div className='flex flex-col lg:flex-row items-center gap-2 w-full overflow-x-auto pb-5'>
            <div className='w-full lg:w-1/2'>
              <TrendingCoins apiData={apiData} isLoading={isLoading} />
            </div>
            <div className='w-full lg:w-1/2'>
              <TrendingCommunity apiData={apiData} isLoading={isLoading} />
            </div>
            {/* <Breadcrumbs /> */}
        </div>
      )}
    </div>
  )
}
