"use client";

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import PfpSelection from './PfpSelection';

export default function HarvestGrape() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Animation phases for blinking/pulsing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger className="mx-8.5 relative flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20] overflow-visible">
        {/* Pulsing background glow */}
        {/* <div 
          className={`absolute inset-0 rounded-lg transition-all duration-500 ${
            animationPhase === 0 ? 'bg-gradient-to-r from-[#FF0075] to-[#FFCB45] opacity-75 scale-100' :
            animationPhase === 1 ? 'bg-gradient-to-r from-[#FF0075] to-[#FFCB45] opacity-100 scale-110' :
            animationPhase === 2 ? 'bg-gradient-to-r from-[#FF0075] to-[#FFCB45] opacity-90 scale-105' :
            'bg-gradient-to-r from-[#FF0075] to-[#FFCB45] opacity-100 scale-115'
          } animate-pulse blur-sm`}
        /> */}
        
        {/* Main button with animation */}
        <div 
          className={`relative flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20] bg-black/80 backdrop-blur-sm transition-all duration-500 transform ${
            animationPhase === 0 ? 'scale-100 rotate-0' :
            animationPhase === 1 ? 'scale-110 rotate-2' :
            animationPhase === 2 ? 'scale-105 rotate-0' :
            'scale-115 rotate-1'
          } hover:scale-125 hover:rotate-3 cursor-pointer`}
        >
          <Image 
            loading="lazy"
            src="/pfp.gif" 
            alt="pfp" 
            className='size-[36px] transition-transform duration-300 hover:scale-110' 
            width={36} 
            height={36} 
          />
          
          {/* Sparkle effects */}
          {/* <div className="absolute -top-1 -right-1 text-yellow-400 animate-pulse text-xs">✨</div>
          <div className="absolute -bottom-1 -left-1 text-pink-400 animate-pulse text-xs">⭐</div> */}
        </div>
      </DialogTrigger>
      <DialogContent className="bg-black border-[2px] p-6 border-[#86868630] text-white min-w-[413px] overflow-auto max-h-full rounded-xl hover-scrollbar">
        <PfpSelection />
      </DialogContent>
    </Dialog>
  )
}
