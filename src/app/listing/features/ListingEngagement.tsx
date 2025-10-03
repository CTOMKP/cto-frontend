import React from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export default function ListingEngagement() {
  return (
    <div className='h-7 w-16 rounded-lg flex justify-center items-center gap-1 font-bold bg-[#17171C]'>
      <ThumbsUp size={9} color='#FFFFFF50' /> <span>12k</span> <ThumbsDown size={9} color='#FFFFFF50' />
    </div>
  )
}
