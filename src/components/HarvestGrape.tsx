import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import PfpSelection from './PfpSelection';

export default function HarvestGrape() {
  return (
    <Dialog>
      <DialogTrigger className="mr-5 ml-9 flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20]">
        <Image src="/kurator.png" alt="kurator" className='size-[36px]' width={36} height={36} />
      </DialogTrigger>
      <DialogContent className="bg-black border-[2px] p-6 border-[#86868630] text-white min-w-[413px] overflow-hidden rounded-xl">
        <PfpSelection />
      </DialogContent>
    </Dialog>
  )
}
