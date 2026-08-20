"use client";

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useCreateWallet } from '@privy-io/react-auth/extended-chains';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { privyService } from '@/services/privyService';
import { createMovementWallet, getMovementWallet } from '@/lib/movement-wallet';
import { authService } from '@/services/authService';
import { getAuthToken, getUserId } from '@/lib/authSession';
import { profileKeys } from '@/lib/queryKeys';
import { bindSessionStoreListeners, useSessionStore } from '@/lib/sessionStore';
import { findMovementWalletInBackend } from '@/services/walletsService';

// Module-level Set to track processing user IDs across ALL hook instances
// This prevents multiple parallel runs even if hook is instantiated multiple times
const processingUserIds = new Set<string>();

export function usePrivyAuth() {
  const { 
    authenticated, 
    ready, 
    user, 
    login, 
    logout: privyLogout, 
    getAccessToken 
  } = usePrivy();

  const queryClient = useQueryClient();
  
  const router = useRouter();
  const { createWallet } = useCreateWallet();
  const { wallets: ethereumWallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    id?: string;
    email?: string;
    name?: string | null;
    walletId?: string | null;
  } | null>(null);

  useEffect(() => {
    bindSessionStoreListeners();
  }, []);

  // After PFP save (avatarUpdated), refresh profile cache so UI doesn't keep a stale avatarUrl
  useEffect(() => {
    const onAvatarUpdated = () => {
      useSessionStore.getState().hydrateFromStorage();
      void queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    };
    window.addEventListener("avatarUpdated", onAvatarUpdated);
    return () => window.removeEventListener("avatarUpdated", onAvatarUpdated);
  }, [queryClient]);

  // Once Privy has settled, never leave the navbar stuck on a blank placeholder.
  // Stale localStorage tokens must not block showing Login when Privy says logged out.
  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      setIsAuthenticated(false);
      setIsLoading(false);
      if (!getAuthToken()) {
        useSessionStore.getState().clear();
      }
    }
  }, [ready, authenticated]);

  // Sync with backend when Privy becomes authenticated
  useEffect(() => {
    if (!ready || !authenticated || !user) return;

    const userId = user.id;

    setIsAuthenticated(true);

    // Do not sync or create Movement while Privy is still provisioning the
    // automatic Ethereum and Solana wallets.
    const linkedAccounts = Array.isArray(user.linkedAccounts) ? user.linkedAccounts : [];
    const hasEthereumWallet = ethereumWallets.some((wallet) => {
      const candidate = wallet as { chainType?: string; address?: string };
      return (candidate.chainType === 'ethereum' || candidate.address?.startsWith('0x')) && !!candidate.address;
    }) || linkedAccounts.some((account) => {
      const candidate = account as { type?: string; chainType?: string; address?: string };
      return candidate.type === 'wallet' && candidate.chainType === 'ethereum' && !!candidate.address;
    });
    const hasSolanaWallet = solanaWallets.length > 0 || linkedAccounts.some((account) => {
      const candidate = account as { type?: string; chainType?: string; address?: string };
      return candidate.type === 'wallet' && candidate.chainType === 'solana' && !!candidate.address;
    });

    if (!hasEthereumWallet || !hasSolanaWallet) {
      setIsLoading(false);
      return;
    }

    if (processingUserIds.has(userId)) {
      return;
    }

    const existingToken = getAuthToken();
    const existingUserId = getUserId();
    if (existingToken && existingUserId === userId) {
      setIsLoading(false);
      return;
    }

    processingUserIds.add(userId);
    void handleMovementWalletAndSync(userId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, user?.id, user?.linkedAccounts?.length, ready, ethereumWallets.length, solanaWallets.length]);

  // Handle Movement wallet creation and backend sync (like test frontend)
  const handleMovementWalletAndSync = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Ethereum and Solana are ready (guarded by the effect above).
      // Persist both before creating the separate Movement wallet.
      const syncResult = await syncWithBackend();
      
      if (!syncResult) {
        throw new Error('Initial backend synchronization failed');
        }
        
      // Step 3: Check if user has Movement wallet in backend or Privy
      const backendHasMovementWallet = !!findMovementWalletInBackend(
        Array.isArray(syncResult.wallets) ? syncResult.wallets : [],
      );
      
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const movementWallet = getMovementWallet(user as any);
        const privyHasMovementWallet = !!movementWallet;
      const hasMoveWallet = backendHasMovementWallet || privyHasMovementWallet;

      // Step 4: Create wallet if needed
      if (!hasMoveWallet) {
          try {
          setIsLoading(true);
          
          // Create Movement wallet with 15 second timeout (like test frontend)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const walletCreationPromise = createMovementWallet(user as any, createWallet as any);
            const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Wallet creation timed out')), 15000)
            );
            
            await Promise.race([walletCreationPromise, timeoutPromise]);
            
          // CRITICAL: Give Privy indexing time (matching test frontend strategy)
          await new Promise(resolve => setTimeout(resolve, 1500));
            
          // Step 5: Final Sync to save the new wallet (like test frontend)
          await syncWithBackend();
          } catch (walletError: unknown) {
            const errorMessage = walletError instanceof Error ? walletError.message : 'Unknown error';
          console.error('❌ Movement wallet setup failed:', walletError);
          
          // If it's already created, we just proceed
          if (errorMessage.includes('already has an embedded wallet')) {
            await syncWithBackend();
            } else {
            // Still sync even if wallet creation failed
            await syncWithBackend();
          }
          }
        } else {
          }

      // Step 6: Set authenticated (no redirect - let user stay on current page)
        setIsAuthenticated(true);
      setIsLoading(false);
        
      // Clean up
      processingUserIds.delete(userId);
      } catch (error) {
      console.error('❌ Authentication flow failed:', error);
      setIsLoading(false);
      processingUserIds.delete(userId);
      
      // Even if sync fails, check if we have a token now
        const token = getAuthToken();
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
    }
  };

  // Sync with backend (like test frontend)
  const syncWithBackend = useCallback(async () => {
    if (!user || !authenticated) return null;
    
    try {
      const privyToken = await getAccessToken();
      if (!privyToken) {
        throw new Error('No Privy access token available');
      }
  
      const backendSyncResult = await privyService.syncUser(privyToken, getAccessToken);

      // Backend synchronization is the required operation. A profile cache
      // refresh can be cancelled by navigation or a weak connection and must
      // not turn a successful wallet sync into an authentication failure.
      try {
        const profile = await queryClient.fetchQuery({
          queryKey: profileKeys.detail(),
          queryFn: ({ signal }) => authService.fetchProfile(signal),
        });

        if (profile) {
          setUserData({
            id: String(profile.id),
            email: profile.email,
            name: profile.name,
            walletId: profile.walletId,
          });
          useSessionStore.getState().setUserId(String(profile.id));
          useSessionStore.getState().setEmail(profile.email ?? null);
          useSessionStore.getState().setUsername(profile.name ?? null);
          useSessionStore.getState().hydrateFromStorage();
        }
      } catch (profileError) {
        console.warn('Profile refresh after wallet sync was interrupted:', profileError);
      }
      useSessionStore.getState().setToken(getAuthToken());
  
      return backendSyncResult;
    } catch (error) {
      console.error('❌ Backend sync call failed:', error);
      return null;
    }
  }, [user, authenticated, getAccessToken, queryClient]);

  const handleLogin = useCallback(async () => {
    try {
      await login();
      // After login, Privy will update authenticated state, which triggers sync via useEffect
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [login]);

  const handleLogout = useCallback(async () => {
    try {
      // Clear Privy session
      await privyLogout();

      // Drop cached server state (profile, notifications, etc.)
      queryClient.clear();
      
      // Clear all localStorage data
      privyService.logout();
      
      // Clear sync tracking
      if (user?.id) {
        processingUserIds.delete(user.id);
      }
      
      // Reset state
      setIsAuthenticated(false);
      useSessionStore.getState().clear();
      
      // Force page reload to clear all UI state (like test frontend)
      window.location.href = '/listings';
    } catch (error) {
      console.error('Logout failed:', error);
      queryClient.clear();
      // Even if Privy logout fails, clear localStorage
      privyService.logout();
      if (user?.id) {
        processingUserIds.delete(user.id);
      }
      setIsAuthenticated(false);
      useSessionStore.getState().clear();
      router.push('/listings');
      throw error;
    }
  }, [privyLogout, queryClient, router, user?.id]);

  return {
    user,
    userData,
    setUserData,
    isAuthenticated,
    /** Privy session flag — use for nav login/logout UI (resolves as soon as Privy is ready). */
    privyAuthenticated: authenticated,
    isLoading: isLoading || !ready,
    login: handleLogin,
    logout: handleLogout,
    getAccessToken,
    ready,
  };
}
