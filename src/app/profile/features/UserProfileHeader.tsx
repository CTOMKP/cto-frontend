"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Edit, LogOut, Check } from 'lucide-react';
import { X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { useUpdateUserMutation } from "@/hooks/useUpdateUserMutation";
import { useSessionStore } from "@/lib/sessionStore";
import { pfpService } from "@/services/pfpService";
import {
  PROFILE_AVATAR_META_KEY,
  PROFILE_AVATAR_URL_KEY,
  USER_AVATAR_URL_KEY,
} from "@/lib/authSession";

interface UserProfileHeaderProps {
  avatarUrl: string | null;
  email: string;
  primaryWalletAddress: string;
  /** e.g. "Solana wallet" when primary is Solana, "Movement wallet" when falling back */
  primaryWalletLabel: string;
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
  primaryWalletLabel,
  copiedAddress,
  onCopyAddress,
  walletsDialogOpen,
  onWalletsDialogOpenChange,
  walletsDialogContent,
}: UserProfileHeaderProps) {
  const [nameEditOpen, setNameEditOpen] = useState(false);
  const [tempName, setTempName] = useState<string>("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { userData, setUserData } = usePrivyAuth();
  const sessionUserId = useSessionStore((s) => s.userId);
  const sessionEmail = useSessionStore((s) => s.email);
  const setAvatarUrl = useSessionStore((s) => s.setAvatarUrl);
  const updateUserMutation = useUpdateUserMutation();

  /** Keep username independent from wallet/email fallbacks. */
  const displayName = (userData?.name || "").trim() || "User";

  useEffect(() => {
    if (!nameEditOpen) return;
    setTempName(displayName);
  }, [nameEditOpen, displayName]);

  const handleSaveName = () => {
    const nextName = tempName.trim();
    if (nextName.length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    const userId = sessionUserId || sessionEmail || email;

    updateUserMutation.mutate(
      { userId, updates: { name: nextName } },
      {
        onSuccess: (updated) => {
          const finalName = updated?.name ?? nextName;
          setUserData((prev) => ({
            ...prev,
            name: finalName,
          }));
          setNameEditOpen(false);
          toast.success("Name updated.");
        },
      },
    );
  };

  /** Same upload flow as cto-test-frontend ProfilePage: presign → S3 → PUT /auth/users/me */
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userId = sessionUserId || sessionEmail || email;
    if (!userId) {
      toast.error("Please log in to update your profile picture.");
      e.target.value = "";
      return;
    }

    try {
      setAvatarUploading(true);
      const { viewUrl, key } = await pfpService.uploadProfileImage(file, userId);

      try {
        await updateUserMutation.mutateAsync({
          userId,
          updates: { avatarUrl: viewUrl },
        });
      } catch {
        // useUpdateUserMutation already toasts
        return;
      }

      localStorage.setItem(USER_AVATAR_URL_KEY, viewUrl);
      localStorage.setItem(PROFILE_AVATAR_URL_KEY, viewUrl);
      if (key) {
        localStorage.setItem(PROFILE_AVATAR_META_KEY, JSON.stringify({ key }));
      }
      setAvatarUrl(viewUrl);
      window.dispatchEvent(new Event("avatarUpdated"));
      toast.success("Avatar uploaded");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to upload avatar";
      toast.error(message);
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-start justify-between mb-4 border-[0.5px] border-white/20 py-5 px-3 rounded-lg bg-[#FFFFFF]/3">
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <div className="relative w-full h-full rounded-full overflow-hidden border-[0.6px] border-white">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
                loading="lazy"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                {email.charAt(0).toUpperCase()}
              </div>
            )}
            {avatarUploading ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border border-white/30 bg-[#17171C] text-white shadow-md transition-colors hover:bg-[#27272A] disabled:opacity-60"
            aria-label="Change profile picture"
            title="Change profile picture"
          >
            <Camera size={14} />
          </button>

          <input
            ref={avatarInputRef}
            id="profile-avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarChange}
            disabled={avatarUploading}
            aria-label="Upload avatar image"
          />
        </div>
        <div>
          <div className="">
            <h1 className="text-white/70 font-semibold mb-2">
              Username
            </h1>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setNameEditOpen(true)}
                className="font-bold text-[32px] leading-none text-left hover:text-white/85 transition-colors"
                aria-label="Edit username"
              >
                {displayName}
              </button>

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
                        disabled={updateUserMutation.isPending}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/20 text-white/70 hover:bg-white/10"
                        disabled={updateUserMutation.isPending}
                        onClick={() => setNameEditOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="cta-gradient"
                        disabled={updateUserMutation.isPending}
                        onClick={handleSaveName}
                      >
                        {updateUserMutation.isPending ? "Saving..." : "Save"}
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
            {primaryWalletAddress ? (
              <>
                <p className="text-white/70 text-sm font-semibold">
                  {primaryWalletLabel}{" "}
                  <span className="bg-white/20 rounded-[25px] p-1 font-normal">
                    {primaryWalletAddress.slice(0, 8)}...
                    {primaryWalletAddress.slice(-8)}
                  </span>
                </p>
                <button
                  type="button"
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
              </>
            ) : (
              <p className="text-white/50 text-sm">No wallet address to display</p>
            )}
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

