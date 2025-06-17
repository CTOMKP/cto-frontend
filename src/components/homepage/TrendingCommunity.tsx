import React from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const mockData = [
    {
        name: '$ROGERS',
        communityScore: 0.7
    },
    {
        name: '$ROGERS',
        communityScore: 0.7
    },
    {
        name: '$ROGERS',
        communityScore: 0.7
    }
]

export default function TrendingCommunity() {
  return (
    <Card className="w-[333px] p-3 border border-[#FF007510]">
    <CardHeader className='px-0'>
        <CardTitle className='flex items-center gap-1 text-base font-bold'>
            <img
            src="/emoji-icons/gaining-traction.svg"
            alt="gaining-traction"
            width={16}
            height={16}
          />
          Community trending{" "}
          <img
            className="mt-0.5"
            src="/info.svg"
            alt="info"
            width={13}
            height={13}
          />
        </CardTitle>
    </CardHeader>
    <CardContent className="px-0 -mt-4">
        <div className='flex items-center justify-between text-xs text-[#FFFFFF80] text-fold mb-4'>
            <h2># Hashtag</h2>
            <h2>Community score</h2>
        </div>

        <div className='flex flex-col gap-4'>
            {mockData.map((data, index) => (
            <div key={index} className=' flex items-center justify-between'>
                <p className='text-xs font-medium'>{index + 1} {data.name}</p>
                <span className='flex items-center gap-1'><img src="/communitry-score-icons/bad-red.svg" alt="bad-red" /> <p className='text-[10px] text-[#FFFFFF80]'>{data.communityScore}%</p></span>
            </div>
        ))}
        </div>
    </CardContent>
    </Card>
  )
}
