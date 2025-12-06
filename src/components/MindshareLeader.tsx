import React from 'react'
import Image from "next/image";

const mockData = [
    {
        name: 'Meow',
        ticker: 'MEW',
        mentions: 4.5
    },
    {
        name: 'Meow',
        ticker: 'MEW',
        mentions: 4.5
    }
]

export default function MindshareLeader() {
  return (
    <div className='flex items-center'>
      <span className='flex items-center mr-2'><p className='text-[#0042ED]'>Mindshare leader</p> <Image loading="lazy" src="/emoji-icons/speaker.svg" alt="/gaining-traction" width={15.5} height={15.5}/></span>

        {mockData.map((item, index) => (
            <div key={index} className={`flex items-center gap-1 ${index === 0 ? '' : 'ml-3'}`}>
                <span className='text-[#393939]'>#{index + 1}</span>
                <Image loading="lazy" src="/default-trending-coin-img.png" alt="default-trending-coin-img" width={16} height={16} />
                <span className='text-[#393939]'>{item.ticker}</span>
                <span className={`${index === 1 ? 'text-[#0042ED]' : 'text-[#E86738]'}`}>{item.mentions}k Metions</span>
            </div>
        ))}
    </div>
  )
}
