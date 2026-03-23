"use client";

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import { BackendWallet, PrivyWalletAccount, PrivyUser } from '@/types/privy';

// Helper interface for wallet with Movement/Aptos support
interface WalletWithMovement extends BackendWallet {
  blockchain?: string;
  walletClient?: string;
}

import UserProfileHeader from './features/UserProfileHeader';
import LevelXPProgress from './features/LevelXPProgress';
import ReferralSection from './features/ReferralSection';
import SocialAccounts from './features/SocialAccounts';
import WalletBalance from './features/WalletBalance';
import PortfolioSection from './features/PortfolioSection';
import TransactionHistory from './features/TransactionHistory';
import WalletsDialog from './features/WalletsDialog';

export default function ProfilePage() {
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  // Keep allWallets for potential future use (displaying all wallets)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allWallets, setAllWallets] = useState<BackendWallet[]>([]);
  const [movementWalletAddress, setMovementWalletAddress] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [walletsDialogOpen, setWalletsDialogOpen] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const walletsLoadedRef = React.useRef<string | null>(null);

  // Check Movement wallet from Privy's linkedAccounts (like test frontend)
  // Define this FIRST so it can be used in loadWallets
  const checkMovementWallet = React.useCallback(() => {
    if (!user?.linkedAccounts) return;

    const movementWalletAccount = user.linkedAccounts.find((account) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const acc = account as any;
      return acc.type === 'wallet' && acc.chainType === 'aptos';
    });

    // Access address property (Privy wallet accounts have address)
    if (movementWalletAccount) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const acc = movementWalletAccount as any;
      if (acc.address) {
        setMovementWalletAddress(acc.address);
      }
    }
  }, [user?.linkedAccounts]);

  const loadWallets = React.useCallback(async () => {
    try {
      // First, try to load from localStorage (faster and more reliable)
      const userId = localStorage.getItem('cto_user_id');
      let walletsJson: string | null = null;
      
      // Only use user-specific key format, no fallback to generic key
      if (userId) {
        walletsJson = localStorage.getItem(`cto_user_wallets_${userId}`);
      }
      if (walletsJson) {
        try {
          const wallets = JSON.parse(walletsJson);
          
          // Find Movement wallet from wallets (Movement wallet is already included in the data)
          const movementWallet = wallets.find((w: WalletWithMovement) => 
            w.blockchain === 'MOVEMENT' ||
            w.blockchain === 'APTOS' ||
            w.chainType === 'aptos' ||
            w.walletClient === 'APTOS_EMBEDDED'
          );
          if (movementWallet?.address) {
            setMovementWalletAddress(movementWallet.address);
          }

          setAllWallets(wallets);
          return;
        } catch (parseError) {
          console.error('Failed to parse wallets from localStorage:', parseError);
        }
      }
      
      // Fallback: Fetch from backend if localStorage is empty or invalid
      const token = localStorage.getItem('cto_auth_token');
      
      if (!token || !userId) {
        // No token or user ID, can't fetch from backend
        return;
      }

      console.log('🔄 Fetching wallets from backend...');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await axios.get(
        `${backendUrl}/api/v1/auth/privy/wallets`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.wallets) {
        const wallets = response.data.wallets;
        
        // Find Movement wallet from backend wallets (Movement wallet is already included)
        const movementWallet = wallets.find((w: WalletWithMovement) => 
          w.blockchain === 'MOVEMENT' ||
          w.blockchain === 'APTOS' ||
          w.chainType === 'aptos' ||
          w.walletClient === 'APTOS_EMBEDDED'
        );
        if (movementWallet?.address) {
          setMovementWalletAddress(movementWallet.address);
        }

        setAllWallets(wallets);
        
        // Update localStorage with fresh data
        if (userId) {
          localStorage.setItem(`cto_user_wallets_${userId}`, JSON.stringify(wallets));
        }
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
    }
  }, []);

  useEffect(() => {
    if (authenticated && user && ready) {
      const userId = user.id;
      if (walletsLoadedRef.current !== userId) {
        checkMovementWallet();
        loadWallets();
        walletsLoadedRef.current = userId;
      }
    }
  }, [authenticated, user, ready, checkMovementWallet, loadWallets]);

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     router.push('/');
  //   } catch (error) {
  //     console.error('Logout failed:', error);
  //   }
  // };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast.success('Address copied!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Please login to view your profile</p>
        </div>
      </div>
    );
  }

  // Use movementWalletAddress state (set from backend wallets or Privy linkedAccounts)
  // This matches the test frontend pattern
  const email = user?.email?.address || user?.wallet?.address || 'Privy User';
  
  const avatarUrl = typeof window !== 'undefined' 
    ? localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url')
    : null;

  // Combine Privy wallets with backend wallets
  // Privy's user.linkedAccounts is LinkedAccountWithMetadata[], so we need to filter and cast
  const privyWallets = user?.linkedAccounts?.filter(
    (account) => account.type === 'wallet'
  ) as PrivyWalletAccount[] || [];
  const displayWallets = allWallets.length > 0 ? allWallets : privyWallets;
  
  // Deduplicate wallets by address to prevent duplicate display
  const uniqueWallets = displayWallets.filter((wallet, index, self) => 
    index === self.findIndex((w) => w.address.toLowerCase() === wallet.address.toLowerCase())
  );

  // Sort wallets to put Movement/Aptos wallet first
  const sortedWallets = [...uniqueWallets].sort((a, b) => {
    const isMovementWallet = (wallet: BackendWallet | PrivyWalletAccount) => {
      const chainType = 'chainType' in wallet ? wallet.chainType : undefined;
      const blockchain = 'blockchain' in wallet ? wallet.blockchain : undefined;
      const chainUpper = ((chainType || blockchain || '').toUpperCase());
      return chainUpper === 'MOVEMENT' || chainUpper === 'APTOS' || chainType === 'aptos';
    };
    
    const isMovementA = isMovementWallet(a);
    const isMovementB = isMovementWallet(b);
    
    // Movement/Aptos wallets come first
    if (isMovementA && !isMovementB) return -1;
    if (!isMovementA && isMovementB) return 1;
    return 0; // Keep original order for non-Movement wallets
  });

  // Primary wallet address for display (Movement wallet only)
  // Prioritize movementWalletAddress state (from backend or Privy check)
  const primaryWalletAddress = movementWalletAddress || '';

  // Calculate wallet stats
  // const cosmosWallets = uniqueWallets.filter(w => {
  //   const { chainType, blockchain } = getWalletChainInfo(w);
  //   const chain = (chainType || blockchain || '').toLowerCase();
  //   return chain === 'cosmos' || chain === 'osmosis' || chain === 'juno';
  // }).length;

  // const evmWallets = uniqueWallets.filter(w => {
  //   const { chainType, blockchain } = getWalletChainInfo(w);
  //   const chain = (chainType || blockchain || '').toLowerCase();
  //   return chain === 'ethereum' || chain === 'base' || chain === 'polygon' || chain === 'arbitrum' || chain === 'optimism';
  // }).length;

  // Achievement task data for donut chart
  const achievementData = [
    { name: 'Memecoins', value: 65, color: '#16C784' },
    { name: 'Stablecoins', value: 25, color: '#6B7280' },
    { name: 'Others', value: 10, color: '#EF4444' },
  ];

  return (
    <div className="pt-[50px]">
      <div className="2xl:mx-25 lg:mx-12 mx-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Left Container - User Profile, Level/XP, Achievement Task, Wallet Stats */}
          <div className="border-none w-full">
            <UserProfileHeader
              avatarUrl={avatarUrl}
              email={email}
              primaryWalletAddress={primaryWalletAddress}
              copiedAddress={copiedAddress}
              onCopyAddress={copyAddress}
              walletsDialogOpen={walletsDialogOpen}
              onWalletsDialogOpenChange={setWalletsDialogOpen}
              walletsDialogContent={
                <WalletsDialog
                  uniqueWallets={sortedWallets}
                  user={user as PrivyUser}
                  primaryWalletAddress={movementWalletAddress}
                />
              }
            />

            <LevelXPProgress />

            <div className="flex gap-4">
              <ReferralSection />
              <SocialAccounts />
            </div>
          </div>

          {/* Right Column - My Assets */}
          <div className='h-full flex flex-col'>
            <WalletBalance primaryWalletAddress={primaryWalletAddress} />

            <PortfolioSection achievementData={achievementData} />
          </div>
        </div>

        <TransactionHistory />
      </div>
    </div>
  );
}
