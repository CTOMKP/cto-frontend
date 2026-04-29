"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, LogOut, Check } from 'lucide-react';
import { X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { getUserEmail, getUserId, USER_NAME_KEY } from "@/lib/authSession";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { profileKeys } from "@/lib/queryKeys";

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
  const [nameEditOpen, setNameEditOpen] = useState(false);
  const [tempName, setTempName] = useState<string>("");
  const [isSavingName, setIsSavingName] = useState(false);

  const fallbackName = email?.includes("@") ? email.split("@")[0] : email;

  const { userData, setUserData } = usePrivyAuth();
  const queryClient = useQueryClient();

  const displayName = userData?.name || fallbackName || "User";

  useEffect(() => {
    if (!nameEditOpen) return;
    setTempName(displayName);
  }, [nameEditOpen, displayName]);

  const handleSaveName = async () => {
    const nextName = tempName.trim();
    if (nextName.length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    setIsSavingName(true);
    try {
      const userId = getUserId() || getUserEmail() || email;

      const updated = await authService.updateUser(userId, { name: nextName });
      const finalName = updated?.name ?? nextName;
      localStorage.setItem(USER_NAME_KEY, finalName);
      await queryClient.invalidateQueries({ queryKey: profileKeys.all });
      setUserData((prev) => ({
        ...prev,
        name: finalName,
      }));
      setNameEditOpen(false);
      toast.success("Name updated.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update name.";
      toast.error(message);
    } finally {
      setIsSavingName(false);
    }
  };

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
              <h2 className="font-bold text-[32px]">{displayName}</h2>

              <Dialog open={nameEditOpen} onOpenChange={setNameEditOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-fit p-0 text-white/70 hover:text-white"
                    aria-label="Edit name"
                  >
                    <Edit size={14} />
                  </Button>
                </DialogTrigger>

                <DialogContent className="bg-[#010101] text-white border-2 border-[#86868630] max-w-[520px]">
                  <DialogHeader className="pb-4 border-b-[0.5px] border-[#FFFFFF20]">
                    <DialogTitle className="font-bold text-xl">Edit name</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white/70" htmlFor="nameInput">
                        Name
                      </label>
                      <Input
                        id="nameInput"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        autoFocus
                        disabled={isSavingName}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/20 text-white/70 hover:bg-white/10"
                        disabled={isSavingName}
                        onClick={() => setNameEditOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="cta-gradient"
                        disabled={isSavingName}
                        onClick={handleSaveName}
                      >
                        {isSavingName ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* <h2 className="text-2xl font-bold text-white">
                {email.split('@')[0] || 'User'}
              </h2> */}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-white/70 text-sm font-semibold">
              Movement wallet{" "}
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
          <DialogContent className="bg-[#010101] text-white border-2 border-[#86868630] max-w-2xl max-h-[80vh] overflow-y-auto hover-scrollbar">
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

