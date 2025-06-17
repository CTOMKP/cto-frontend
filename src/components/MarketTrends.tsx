import React from 'react';
import { ChevronDown } from 'lucide-react';
import MindshareLeader from './MindshareLeader';

const mockData = [
    {
        name: 'Meow',
        ticker: 'MEW',
        percentage: 0.08,
        timeFrame: '1hr'
    },
    {
        name: 'Meow',
        ticker: 'MEW',
        percentage:0.2,
        timeFrame: '1hr'
    },
    {
        name: 'Meow',
        ticker: 'MEW',
        percentage: 0.001,
        timeFrame: '1hr'
    },
    {
        name: 'Meow',
        ticker: 'MEW',
        percentage: 20,
        timeFrame: '1hr'
    },
    {
        name: 'Meow',
        ticker: 'MEW',
        percentage: 20,
        timeFrame: '1hr'
    }
]

export default function MarketTrends() {
  return (
    <div className='bg-[#FFCB45] h-9 flex items-center justify-between text-xs pr-2'>
        <div className='flex items-center'>
        <span className='w-[98px] flex justify-center'><img src="/market-trends-heart.svg" alt="market-trends-heart" /></span>
 
        <span className='flex items-center mr-2'><p className='text-[#FC461D]'>Gaining traction</p> <img src="/emoji-icons/gaining-traction.svg" alt="/gaining-traction" width={16} height={16}/></span>

        {mockData.map((item, index) => (
            <div key={index} className={`flex items-center gap-1 ${index === 0 ? '' : 'ml-3'}`}>
                <span>#{index + 1}</span>
                <img src="/default-trending-coin-img.png" alt="default-trending-coin-img" width={16} height={16} />
                <span>{item.ticker}</span>
                <span className='flex items-center text-[#008C5E]'><ChevronDown stroke='false' className='border-none' fill='#008C5E' /> {item.percentage}%({item.timeFrame}) </span>
            </div>
        ))}
        </div>

        <MindshareLeader />
    </div>
  )
}
