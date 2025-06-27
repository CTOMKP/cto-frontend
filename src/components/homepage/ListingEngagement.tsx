import React from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export default function ListingEngagement() {
  return (
    <div className='h-[18px] w-13 rounded-lg flex justify-center items-center gap-1 text-[10px] font-bold bg-[#17171C]'>
      <ThumbsUp size={9} color='#FFFFFF20' /> <span>12k</span> <ThumbsDown size={9} color='#FFFFFF20' />
    </div>
  )
}
