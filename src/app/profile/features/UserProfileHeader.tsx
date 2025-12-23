"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, LogOut, Check } from 'lucide-react';
import { X } from 'lucide-react';

interface UserProfileHeaderProps {
  avatarUrl: string | null;
  email: string;
  primaryWalletAddress: string;
  copiedAddress: boolean;
  onCopyAddress: (address: string) => void;
  walletsDialogOpen: boolean;
  onWalletsDialogOpenChange: (open: boolean) => void;
  walletsDialogContent: React.ReactNode;
}

export default function UserProfileHeader({
  avatarUrl,
  email,
  primaryWalletAddress,
  copiedAddress,
  onCopyAddress,
  walletsDialogOpen,
  onWalletsDialogOpenChange,
  walletsDialogContent,
}: UserProfileHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4 border-[0.5px] border-white/20 py-5 px-3 rounded-lg bg-[#FFFFFF]/3">
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              fill
              className="object-cover size-15 rounded-full border-[0.6px] border-white"
              loading="lazy"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
              {email.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="">
            <h1 className="text-white/70 font-semibold mb-2">
              Username
            </h1>
            <div className="flex items-center gap-1">
              <h2 className="font-bold text-[32px] ">User234353hgfk</h2>
              <Edit size={14} />
            </div>
            {/* <h2 className="text-2xl font-bold text-white">
                {email.split('@')[0] || 'User'}
              </h2> */}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-white/70 font-semibold">
              Smart wallet{" "}
              <span className="bg-white/20 rounded-[25px] p-1 font-normal">
                {primaryWalletAddress.slice(0, 8)}...
                {primaryWalletAddress.slice(-8)}
              </span>
            </p>
            <button
              onClick={() => onCopyAddress(primaryWalletAddress)}
              className="text-white/70 hover:text-white transition-colors bg-white/20 rounded-[25px] p-1"
            >
              {copiedAddress ? (
                <Check size={14} className="text-[#16C784]" />
              ) : (
                <Image
                  src="/copy.svg"
                  alt="copy"
                  width={14}
                  height={14}
                />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between items-end self-stretch">
        <Button className="p-2 w-fit bg-none ronded-lg border-[0.2px] border-white/20">
          <LogOut size={32} />
        </Button>
        <Dialog open={walletsDialogOpen} onOpenChange={onWalletsDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="text-[#9F9FA9] p-2 ronded-lg border-[0.2px] border-white/20">
              View wallets
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#010101] text-white border-2 border-[#86868630] max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="flex !flex-row justify-between items-center pb-4 border-b-[0.5px] border-[#FFFFFF20]">
              <DialogTitle className="font-bold text-xl">💼 Your Wallets</DialogTitle>
              <button
                onClick={() => onWalletsDialogOpenChange(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </DialogHeader>
            {walletsDialogContent}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

