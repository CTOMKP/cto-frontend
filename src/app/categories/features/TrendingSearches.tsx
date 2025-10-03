import React from 'react'
import { Button } from '../../../components/ui/button'

const TrendingSearchesFilter = [
    {
        name: 'CTO Vision',
        value: 'CTO Vision',
    },
    {
        name: 'CTO Vision',
        value: 'CTO Vision',
    },
    {
        name: 'CTO Vision',
        value: 'CTO Vision',
    },
    {
        name: 'CTO Vision',
        value: 'CTO Vision',
    },
    {
        name: 'CTO Vision',
        value: 'CTO Vision',
    },
    {
        name: 'CTO Vision',
        value: 'CTO Vision',
    },
    {
        name: 'CTO Vision',
        value: 'CTO Vision',
    },
    {
        name: 'CTO Vision',
        value: 'CTO Vision',
    },
]

export default function TrendingSearches() {
  return (
    <div className='flex items-center'>
      <span className='text-[#FFFFFFB2]'>Trending searches :</span>
      <Button className='p-0 h-fit !w-fit px-2 py-1 text-xs font-bold rounded-lg cta-gradient mx-4'>All</Button>
      <div className='space-x-4'>
        {TrendingSearchesFilter.map((filter, index) => (
        <Button key={index} className='text-xs font-bold w-fit p-0 h-fit px-2 py-1 rounded-lg bg-[#17171C]'>{filter.name}</Button>
      ))}
      </div>
    </div>
  )
}
