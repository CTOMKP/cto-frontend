"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Link } from 'lucide-react';

export default function SocialAccounts() {
  return (
    <div className="min-w-[190px] rounded-lg space-y-2.5 border-[0.5px] border-white/20 p-3">
      <h3 className="text-[#FFFFFF]/70 font-semibold mb-4">
        Social accounts
      </h3>

      <div className="flex items-center justify-between">
        <span className="size-1 rounded-full bg-[#006FC9]"></span>{" "}
        <span className="text-sm">Telegram</span>
        <Button className="p-2 w-fit bg-none rounded-lg border-[0.2px] border-white/20">
          <LogOut size={30} />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <span className="size-1 rounded-full bg-[#006FC9]"></span>{" "}
        <span className="text-sm">Telegram</span>
        <Button className="p-2 w-fit bg-none rounded-lg border-[0.2px] border-white/20">
          <LogOut size={30} />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <span className="size-1 rounded-full bg-[#C71624]"></span>{" "}
        <span className="text-sm">Discord</span>
        <Button className="p-2 w-fit bg-none rounded-lg border-[0.2px] border-white/20">
          <Link size={14} />
        </Button>
      </div>
    </div>
  );
}

