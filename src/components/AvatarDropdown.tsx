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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const level = 4;
  const currentXP = 45;
  const nextLevelXP = 150;
  const router = useRouter();
  const { logout } = usePrivyAuth();
  const { user } = usePrivy();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateAvatar = () => {
        const rawUrl = localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url');
        // Transform backend URLs to CloudFront URLs
        const cloudfrontUrl = rawUrl ? getCloudFrontUrl(rawUrl) : null;
        setAvatarUrl(cloudfrontUrl);
      };
      
      updateAvatar();
      const userEmail = user?.email?.address || localStorage.getItem('cto_user_email') || '';
      setEmail(userEmail);
      // Get username from localStorage or use email prefix
      const storedUsername = localStorage.getItem('cto_user_username') || userEmail.split('@')[0] || 'User';
      setUsername(storedUsername);

      // Listen for storage changes (when avatar is updated)
      window.addEventListener('storage', updateAvatar);
      return () => window.removeEventListener('storage', updateAvatar);
    }
  }, [user]);

  // Get primary wallet address
  const primaryWalletAddress = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const walletsJson = localStorage.getItem('cto_user_wallets');
      if (walletsJson) {
        try {
          const wallets = JSON.parse(walletsJson) as BackendWallet[];
          type WalletWithPrimary = BackendWallet & { isPrimary?: boolean };
          const primaryWallet = wallets.find((w: WalletWithPrimary) => w.isPrimary) || wallets[0];
          return primaryWallet?.address || '';
        } catch (e) {
          console.error('Failed to parse wallets:', e);
        }
      }
    }
    return '';
  }, []);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast.success('Address copied!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const xpProgress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='mx-8.5'>
        <span className="relative flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20]">
          <span className="relative bg-[#FFFFFF0D] rounded-full size-9 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <FallbackImage
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover rounded-full"
              />
            ) : (
              <span className="text-white text-xs font-bold">
                {email.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </span>
        </span>
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
                  className="object-cover rounded-full"
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

