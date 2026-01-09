"use client";

import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';
import { usePrivy } from '@privy-io/react-auth';
import { Check, SquareArrowOutUpRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { BackendWallet } from '@/types/privy';
import FallbackImage from './FallbackImage';
import { getCloudFrontUrl } from '@/lib/image-url-helper';

export default function AvatarDropdown() {
  // Initialize exactly like profile page - read raw URL from localStorage
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url');
      console.log('[AvatarDropdown] 🎯 Initial state - raw from localStorage:', raw);
      return raw; // Return raw URL, transformation happens in useEffect (like profile page)
    }
    return null;
  });
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const level = 4;
  const currentXP = 45;
  const nextLevelXP = 150;
  const router = useRouter();
  const { logout } = usePrivyAuth();
  const { user } = usePrivy();

  // Set email and username on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userEmail = user?.email?.address || localStorage.getItem('cto_user_email') || '';
      setEmail(userEmail);
      const storedUsername = localStorage.getItem('cto_user_username') || userEmail.split('@')[0] || 'User';
      setUsername(storedUsername);
    }
  }, [user]);

  // Listen for avatar updates from PFP flow - EXACT COPY from profile page
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[AvatarDropdown] 🔄 useEffect running, current avatarUrl state:', avatarUrl);

    // Listen for custom event (dispatched by pfpService)
    const handleAvatarUpdate = () => {
      console.log('[AvatarDropdown] 📢 avatarUpdated event received');
      const rawUrl = localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url');
      console.log('[AvatarDropdown] 📢 Raw URL from localStorage:', rawUrl);
      if (rawUrl) {
        const newAvatarUrl = getCloudFrontUrl(rawUrl);
        console.log('[AvatarDropdown] 📢 Transformed URL:', newAvatarUrl, 'Current state:', avatarUrl);
        if (newAvatarUrl !== avatarUrl) {
          console.log('[AvatarDropdown] ✅ Updating avatarUrl state to:', newAvatarUrl);
          setAvatarUrl(newAvatarUrl);
        } else {
          console.log('[AvatarDropdown] ⏭️ URLs match, skipping update');
        }
      } else {
        console.log('[AvatarDropdown] ⚠️ No raw URL found in localStorage');
      }
    };

    // Listen for localStorage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      console.log('[AvatarDropdown] 💾 Storage event:', e.key, e.newValue);
      if ((e.key === 'cto_user_avatar_url' || e.key === 'profile_avatar_url') && e.newValue) {
        const cloudfrontUrl = getCloudFrontUrl(e.newValue);
        console.log('[AvatarDropdown] ✅ Updating from storage event:', cloudfrontUrl);
        setAvatarUrl(cloudfrontUrl);
      }
    };

    // Check localStorage periodically (same-tab updates)
    const checkAvatar = () => {
      const rawUrl = localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url');
      if (rawUrl) {
        const cloudfrontUrl = getCloudFrontUrl(rawUrl);
        if (cloudfrontUrl !== avatarUrl) {
          console.log('[AvatarDropdown] ⏰ Periodic check - updating from', avatarUrl, 'to', cloudfrontUrl);
          setAvatarUrl(cloudfrontUrl);
        }
      } else if (avatarUrl) {
        console.log('[AvatarDropdown] ⏰ Periodic check - clearing avatar (no localStorage value)');
        setAvatarUrl(null);
      }
    };

    // Transform immediately on mount (like profile page)
    checkAvatar();

    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(checkAvatar, 1000);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [avatarUrl]);

  // Get Movement/Aptos wallet address (primary wallet) - matching profile page logic
  const [movementWalletAddress, setMovementWalletAddress] = React.useState<string | null>(null);

  // Check Movement wallet from Privy's linkedAccounts (like profile page)
  const checkMovementWallet = React.useCallback(() => {
    if (!user?.linkedAccounts) return;

    const movementWalletAccount = user.linkedAccounts.find((account) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const acc = account as any;
      return acc.type === 'wallet' && acc.chainType === 'aptos';
    });

    if (movementWalletAccount) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const acc = movementWalletAccount as any;
      if (acc.address) {
        setMovementWalletAddress(acc.address);
      }
    }
  }, [user?.linkedAccounts]);

  // Load wallets and find Movement wallet - matching profile page logic
  React.useEffect(() => {
    if (!user) return;

    // First, try to load from localStorage
    const walletsJson = localStorage.getItem('cto_user_wallets');
    if (walletsJson) {
      try {
        interface WalletWithMovement extends BackendWallet {
          blockchain?: string;
          walletClient?: string;
        }
        const wallets = JSON.parse(walletsJson) as WalletWithMovement[];
        
        // Find Movement wallet from localStorage wallets
        const movementWallet = wallets.find((w: WalletWithMovement) => 
          w.blockchain === 'MOVEMENT' ||
          w.blockchain === 'APTOS' ||
          w.chainType === 'aptos' ||
          w.walletClient === 'APTOS_EMBEDDED'
        );
        
        if (movementWallet?.address) {
          setMovementWalletAddress(movementWallet.address);
          return;
        }
      } catch (e) {
        console.error('Failed to parse wallets:', e);
      }
    }

    // Fallback: check Privy linkedAccounts
    checkMovementWallet();
  }, [user, checkMovementWallet]);

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
    router.push('/listings');
  };

  const xpProgress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='mx-8.5'>
        <div className="relative flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20] overflow-hidden">
            {avatarUrl ? (
            <div className='size-9'>
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
              <p className="text-sm text-white/70">Level {level} - Senior Sapling</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/70">XP Progress</span>
              <span className="text-xs text-white/70">{currentXP} / {nextLevelXP} XP</span>
            </div>
            <div className="w-full h-1 bg-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="mb-4 pb-4 border-b-[0.5px] border-[#FFFFFF20]">
          <div className="flex items-center gap-2 p-2 bg-[#FFFFFF0D] rounded-lg">
            <span className="text-xs text-white/70 flex-1 truncate font-mono">
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

        {/* Navigation Links */}
        <div className="space-y-2 mb-4">
          <Link
            href="/profile"
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
          <a
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
                className="rounded-lg w-full px-2 py-2 flex items-center gap-2"
                style={{
                  background: "#010101",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <span className="text-sm text-white">Contact Support</span>
                <SquareArrowOutUpRight size={14} />
              </div>
            </div>
          </a>
        </div>

        {/* Profile Link with Gradient Border */}
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
              className="rounded-lg w-full px-4 py-3 text-center"
              style={{
                background: "#010101",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <span className="text-white font-medium">Profile</span>
            </div>
          </div>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-[#FFFFFF0D] hover:bg-[#FFFFFF1A] rounded-lg text-white font-medium transition-colors"
        >
          Log out
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

