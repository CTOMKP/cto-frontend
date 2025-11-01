"use client";

import React from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Step3() {
  return (
    <div className="mt-6 space-y-4">
      <div>
      <label htmlFor="title" className="font-medium">
        Title
        </label>

        <Input id='title' placeholder="Ex “Aptos NFT Artist for Hire”... " className="bg-white/5 border-[0.2px] h-12 mt-4 rounded-lg border-white/20" />
      </div>

      <div>
      <label htmlFor="description" className="font-medium">
        Description
        </label>

        <Input id='description' placeholder="Explain what you're offering or what you're looking for..." className="bg-white/5 border-[0.2px] h-12 mt-4 rounded-lg border-white/20" />
      </div>

      <div>
        <label className="font-medium">
        Additional links(<span className='text-white/50'>Optional</span>)
        </label>
        
        <span className='flex items-center justify-center max-w-60 h-12 gap-2 rounded-lg border-[0.2px] border-white/20 mt-4'>
            <Plus size={16} color='#FFFFFF' />
            <p className='text-white/50'>Add a link</p>
          </span>
      </div>

      <Button className="font-medium mt-4 mb-6 w-full gap-2 bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-lg h-9">
      Save & View status of listing
      </Button>
    </div>
  );
}
