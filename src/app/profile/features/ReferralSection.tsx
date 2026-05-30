"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

export default function ReferralSection() {
  return (
    <div className="rounded-lg border-[0.5px] border-white/20 p-3 w-full">
      <h3 className="text-white/70 mb-4 font-semibold">
        Invite friends
      </h3>
      <p className="mb-6">
        Share your code and get 20% Rebates anytime a referred friend
        completes a trade
      </p>

      <div className="flex items-center justify-between py-3 px-2 rounded-lg border-[0.2px] border-white/20">
        <p className="text-white/50 ">
          https://CTOmarketplace.com/referal.98hydv
        </p>
        <Button className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] py-2 px-1 rounded-lg">
          Invite friends
        </Button>
      </div>
    </div>
  );
}

