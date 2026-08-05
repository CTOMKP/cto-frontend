"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { BackendWallet, PrivyWalletAccount, PrivyUser } from '@/types/privy';

import { useProfileQuery } from '@/hooks/useProfileQuery';
import walletsService from '@/services/walletsService';
import { useResolvedMovementWallet } from '@/hooks/useResolvedMovementWallet';
import { useSessionStore } from '@/lib/sessionStore';
import UserProfileHeader from './features/UserProfileHeader';
import LevelXPProgress from './features/LevelXPProgress';
import ReferralSection from './features/ReferralSection';
import SocialAccounts from './features/SocialAccounts';
import WalletsDialog from './features/WalletsDialog';
import { resolvePrivySolanaAddress } from '@/lib/solanaTransaction';
import dynamic from 'next/dynamic';

const WalletBalance = dynamic(() => import('./features/WalletBalance'), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-lg border border-white/10 bg-white/5 animate-pulse mb-4" />
  ),
});
const PortfolioSection = dynamic(() => import('./features/PortfolioSection'), {
  ssr: false,
});
const TransactionHistory = dynamic(() => import('./features/TransactionHistory'), {
  ssr: false,
  loading: () => (
    <div className="mt-4 h-64 rounded-lg border border-white/10 bg-white/5 animate-pulse" />
  ),
});
export default function ProfilePage() {
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  const { wallets: privyMainWallets } = useWallets();
  const { wallets: solanaScopedWallets } = useSolanaWallets();
  const sessionUserId = useSessionStore((s) => s.userId);
  const storedAvatarUrl = useSessionStore((s) => s.avatarUrl);
  const profileQuery = useProfileQuery({ enabled: !!(ready && authenticated) });

  // Prefer stored avatar (updated immediately on PFP save), same as cto-test-frontend
  const avatarUrl = useMemo(
    () => storedAvatarUrl ?? profileQuery.data?.avatarUrl ?? null,
    [profileQuery.data?.avatarUrl, storedAvatarUrl],
  );

  useEffect(() => {
    if (profileQuery.isSuccess) {
      useSessionStore.getState().hydrateFromStorage();
    }
  }, [profileQuery.isSuccess, profileQuery.dataUpdatedAt]);
  // Keep allWallets for potential future use (displaying all wallets)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allWallets, setAllWallets] = useState<BackendWallet[]>([]);
  const movementWalletQuery = useResolvedMovementWallet({ preferStorage: true });
  const movementWalletAddress = movementWalletQuery.data?.movementWallet?.address ?? null;
  const solanaWalletAddress = React.useMemo(
    () =>
      resolvePrivySolanaAddress(privyMainWallets as unknown[], solanaScopedWallets as unknown[] | undefined),
    [privyMainWallets, solanaScopedWallets],
  );
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [walletsDialogOpen, setWalletsDialogOpen] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const walletsLoadedRef = React.useRef<string | null>(null);

  const loadWallets = React.useCallback(async () => {
    try {
      const wallets = await walletsService.listPrivyWallets({
        userId: sessionUserId || user?.id || null,
        preferStorage: true,
      });
      if (!wallets.length) return;

      setAllWallets(wallets);
    } catch (error) {
      console.error('Failed to load wallets:', error);
    }
  }, [sessionUserId, user?.id]);

  useEffect(() => {
    if (authenticated && user && ready) {
      const userId = user.id;
      if (walletsLoadedRef.current !== userId) {
        loadWallets();
        walletsLoadedRef.current = userId;
      }
    }
  }, [authenticated, user, ready, loadWallets]);

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

  // Keep display identity email-only; don't fallback to wallet address.
  const email = user?.email?.address || 'Privy User';
  
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

  const sortedWallets = [...uniqueWallets].sort((a, b) => {
    const chainMeta = (wallet: BackendWallet | PrivyWalletAccount) => {
      const chainType = 'chainType' in wallet ? wallet.chainType : undefined;
      const blockchain = 'blockchain' in wallet ? wallet.blockchain : undefined;
      return { chainType, blockchain, chainUpper: (chainType || blockchain || '').toUpperCase() };
    };
    const isSolanaWallet = (wallet: BackendWallet | PrivyWalletAccount) => {
      const { chainType, chainUpper } = chainMeta(wallet);
      return chainUpper === 'SOLANA' || chainType === 'solana';
    };
    const isMovementWallet = (wallet: BackendWallet | PrivyWalletAccount) => {
      const { chainType, chainUpper } = chainMeta(wallet);
      return chainUpper === 'MOVEMENT' || chainUpper === 'APTOS' || chainType === 'aptos';
    };
    const rank = (w: BackendWallet | PrivyWalletAccount) => {
      if (isSolanaWallet(w)) return 0;
      if (isMovementWallet(w)) return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });

  /** Prefer Solana (payments / deposits); fall back to Movement when no Solana wallet in Privy. */
  const primaryWalletAddress = solanaWalletAddress || movementWalletAddress || '';
  const primaryWalletLabel = solanaWalletAddress
    ? 'Solana wallet'
    : movementWalletAddress
      ? 'Movement wallet'
      : 'Wallet';

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
        {profileQuery.isError && (
          <div className="mb-4 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex flex-wrap items-center justify-between gap-2">
            <span>{profileQuery.error instanceof Error ? profileQuery.error.message : 'Could not refresh profile.'}</span>
            <button
              type="button"
              onClick={() => void profileQuery.refetch()}
              className="underline text-red-100 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Left Container - User Profile, Level/XP, Achievement Task, Wallet Stats */}
          <div className="border-none w-full">
            <UserProfileHeader
              avatarUrl={avatarUrl}
              email={email}
              primaryWalletAddress={primaryWalletAddress}
              primaryWalletLabel={primaryWalletLabel}
              copiedAddress={copiedAddress}
              onCopyAddress={copyAddress}
              walletsDialogOpen={walletsDialogOpen}
              onWalletsDialogOpenChange={setWalletsDialogOpen}
              walletsDialogContent={
                <WalletsDialog
                  uniqueWallets={sortedWallets}
                  user={user as PrivyUser}
                  primaryWalletAddress={solanaWalletAddress || movementWalletAddress}
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
            <WalletBalance
              solanaWalletAddress={solanaWalletAddress}
              movementWalletAddress={movementWalletAddress}
            />

            <PortfolioSection achievementData={achievementData} />
          </div>
        </div>

        <TransactionHistory />
      </div>
    </div>
  );
}
