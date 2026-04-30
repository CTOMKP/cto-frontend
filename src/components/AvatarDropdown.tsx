"use client";

import React, { useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QRCode from 'qrcode';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';
import { usePrivy } from '@privy-io/react-auth';
import { Check, MoveDown, MoveUp, SquareArrowOutUpRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import FallbackImage from './FallbackImage';
import { getCloudFrontUrl } from '@/lib/image-url-helper';
import { useWalletBalance } from '@/app/profile/features/wallet-balance/useWalletBalance';
import WalletBalanceContent from '@/app/profile/features/wallet-balance/WalletBalanceContent';
import { Button } from './ui/button';
import { useRewardProgress, resetUserRewardProgress } from '@/lib/userRewardProgress';
import { useResolvedMovementWallet } from '@/hooks/useResolvedMovementWallet';
import { useSessionStore } from '@/lib/sessionStore';

export default function AvatarDropdown() {
  const storedAvatarUrl = useSessionStore((s) => s.avatarUrl);
  const sessionEmail = useSessionStore((s) => s.email);
  const sessionUsername = useSessionStore((s) => s.username);
  const avatarUrl = useMemo(
    () => (storedAvatarUrl ? getCloudFrontUrl(storedAvatarUrl) : null),
    [storedAvatarUrl],
  );
  const [copiedAddress, setCopiedAddress] = useState(false);
  const {
    rankLevel,
    rankLabel,
    currentXP,
    nextLevelXP,
    progressPct,
  } = useRewardProgress();
  const router = useRouter();
  const { logout } = usePrivyAuth();
  const { user } = usePrivy();
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const generateQRCode = async (address: string) => {
    try {
      return await QRCode.toDataURL(address, {
        width: 200,
        margin: 1,
        color: {
          dark: '#FFFFFF',
          light: '#17171C', // Your background color
        },
      });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return null;
    }
  };

  const email = user?.email?.address || sessionEmail || '';
  const username = sessionUsername || email.split('@')[0] || 'User';

  const movementWalletQuery = useResolvedMovementWallet({ preferStorage: true });
  const movementWalletAddress = movementWalletQuery.data?.movementWallet?.address ?? null;
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [isDeposit, setIsDeposit] = useState(false);
  const { walletAssets, selectedAsset, setSelectedAsset, isLoading } = useWalletBalance();

  // Calculate wallet balance from selected asset
  const walletBalance = selectedAsset?.value || 0;

  // Primary wallet address is Movement wallet address (matching profile page)
  const primaryWalletAddress = movementWalletAddress || '';

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast.success('Address copied!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    resetUserRewardProgress();
    router.push('/listings');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='mx-8.5'>
        <div className="relative flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20] overflow-hidden">
          {avatarUrl ? (
            <div className='size-9 rounded-full'>
              <FallbackImage
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-[#FFFFFF0D] flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {email.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#010101] text-white p-6 w-[300px] border-2 border-[#86868630]">
        {/* Profile Section */}
        <div className="mb-4 pb-4 border-b-[0.5px] border-[#FFFFFF20]">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <FallbackImage
                  src={avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl text-white font-bold">
                  {email.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg truncate">{username}</h3>
                <Image
                  src="/badge.svg"
                  alt="badge"
                  width={15}
                  height={15}
                  loading="lazy"
                />
              </div>
              <p className="text-sm text-white/70">
                Level {rankLevel} - {rankLabel}
              </p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/70">Level Progress</span>
              <span className="text-xs text-white/70">
                {currentXP} XP · {progressPct}%
              </span>
            </div>
            <div className="w-full h-1 bg-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="mb-4 pb-4 border-b-[0.5px] border-[#FFFFFF20]">
          {!isDeposit ? (
            <div>
              <WalletBalanceContent
                balanceVisible={balanceVisible}
                onToggleVisibility={() => setBalanceVisible(!balanceVisible)}
                isLoading={isLoading}
                walletAssets={walletAssets}
                selectedAsset={selectedAsset}
                onSelectAsset={setSelectedAsset}
                walletBalance={walletBalance}
                balanceTextSize="20px"
              />

              <div className="mt-5 flex items-center gap-2">
                <Button
                onClick={() => {
                  generateQRCode(primaryWalletAddress as string).then(qrUrl => {
                    if (qrUrl) {
                      setIsDeposit(true);
                      setQrCodeUrl(qrUrl);
                      setShowQR(true);
                    }
                  });
                }} 
                className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] flex-1 h-12 py-3.5 px-6 rounded-full">
                  {" "}
                  <MoveDown /> Deposit
                </Button>
                <div className="bg-gradient-to-r from-[#FF0075]/50 via-[#FF4A15]/50 to-[#FFCB45]/50 p-[1px] rounded-full flex-1">
                  <Button
                    className="bg-[#010101] h-12 w-full py-3.5 px-6 rounded-full text-white border-none">
                    {" "}
                    <MoveUp /> Withdraw
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {showQR && qrCodeUrl && (
                <div>
                  <div className='bg-white/6 rounded-lg py-3 px-2.5'>
                  <div className="flex justify-center mb-6">
                  <img src={qrCodeUrl as string} alt="Wallet QR Code" className="w-48 h-41" />
                </div>

                <span className='text-[#A1A1AA] text-sm'>Movement address</span>
                  <div className="flex items-center gap-2">
                      <span className="text-white/70 flex-1 truncate font-mono">
                        {primaryWalletAddress ? (
                          `${primaryWalletAddress.slice(0, 10)}...${primaryWalletAddress.slice(-8)}`
                        ) : (
                          'No wallet connected'
                        )}
                      </span>
                      {primaryWalletAddress && (
                        <button
                          onClick={() => copyAddress(primaryWalletAddress)}
                          className="text-white/70 hover:text-white transition-colors p-1"
                        >
                          {copiedAddress ? (
                            <Check size={14} className="text-[#16C784]" />
                          ) : (
                            <Image
                              src="/copy.svg"
                              alt="copy"
                              width={14}
                              height={14}
                              loading="lazy"
                            />
                          )}
                        </button>
                      )}
                    </div>
                </div>

                <p className='text-xs leading-[100%] text-white my-5'>This address can only receive Coins from the Movement network. Sending tokens from another network will result in loss of funds.</p>
                <Button onClick={() => setIsDeposit(false)} className='w-full cta-gradient rounded-full py-3.5 px-6'>Done</Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation Links */}
        <div className="space-y-2 mb-4">
          <Link
            href="/profile"
            className="block mb-3"
          >
            <div
              className="rounded-lg p-[1px] transition-all duration-300"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                className="rounded-lg w-full px-2 py-2 text-left"
                style={{
                  background: "#010101",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <span className="text-white">Profile</span>
              </div>
            </div>
          </Link>
          <Link
            href="/#"
            className="block"
          >
            <div
              className="rounded-lg p-[1px] transition-all duration-300"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                className="rounded-lg w-full px-2 py-2"
                style={{
                  background: "#010101",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <span className="text-sm text-white">Settings</span>
              </div>
            </div>
          </Link>
          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div
              className="rounded-lg p-[1px] transition-all duration-300"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                className="rounded-lg w-full px-2 py-2 flex justify-between items-center gap-2"
                style={{
                  background: "#010101",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <span className="text-sm text-white">Contact Support</span>
                <SquareArrowOutUpRight size={14} />
              </div>
            </div>
          </Link>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 border-[0.2px] border-white/20 hover:bg-[#FFFFFF1A] rounded-lg text-white font-medium transition-colors"
        >
          Log out
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

