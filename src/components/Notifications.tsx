import { Badge } from "@/components/ui/badge"

export default function Notifications() {
  return (
    <div>
      <span className='relative flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20]'>
        <span className='bg-[#FFFFFF0D] rounded-sm size-7 flex items-center justify-center'>
            <img src="/notification.svg" alt="watchlist" width={15} height={15}/>
        </span>
         <Badge className="h-4 absolute top-1 right-1 text-[10px] font-bold text-white cta-gradient min-w-4 rounded-full px-1 font-mono tabular-nums">
          <span>8</span>
        </Badge>
      </span>
    </div>
  )
}
