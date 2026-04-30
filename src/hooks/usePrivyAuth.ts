"use client";

import { usePrivy } from '@privy-io/react-auth';
import { useCreateWallet } from '@privy-io/react-auth/extended-chains';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { privyService } from '@/services/privyService';
import { createMovementWallet, getMovementWallet } from '@/lib/movement-wallet';
import { authService } from '@/services/authService';
import { getAuthToken, getUserId } from '@/lib/authSession';
import { profileKeys } from '@/lib/queryKeys';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    id?: string;
    email?: string;
    name?: string | null;
    walletId?: string | null;
  } | null>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }
  }, [ready, authenticated]);

  // Check authentication status on mount (ONCE) - prioritize localStorage like test frontend
  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run once on mount

  // Check auth status - prioritize localStorage like test frontend
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // SECOND: If no localStorage token, check Privy state
      if (authenticated && user && ready) {
        await syncWithBackend();
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [authenticated, user, ready]);

  // CRITICAL: Sync with backend when Privy becomes authenticated (like test frontend)
  // This should run EVERY TIME Privy authenticates, not just when localStorage is empty
  useEffect(() => {
    // Match test frontend EXACTLY: same guards
    if (!authenticated || !user || !ready) {
      // If Privy is not authenticated, ensure isAuthenticated is false
      if (!authenticated) {
    const token = getAuthToken();
        // Only set to false if there's no token in localStorage
        if (!token) {
          setIsAuthenticated(false);
        }
      }
      return;
    }

    const userId = user.id;
    
    // Set authenticated immediately when Privy authenticates (before sync completes)
    // This ensures UI updates immediately after login
    setIsAuthenticated(true);
    
    // CRITICAL: Check module-level Set FIRST to prevent parallel runs
    if (processingUserIds.has(userId)) {
      return;
    }
    
    // Check if we've already synced for this user in this session
    const existingToken = getAuthToken();
    const existingUserId = getUserId();
    if (existingToken && existingUserId === userId) {
      setIsLoading(false);
      return;
    }

    // Mark as processing IMMEDIATELY (synchronously) BEFORE any async operations
    processingUserIds.add(userId);
    
    // Trigger sync (like test frontend)
    handleMovementWalletAndSync(userId);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, user?.id, ready]);

  // Wait for Privy to fully load linkedAccounts (with retries)
  const waitForPrivyAccounts = async (maxRetries = 10, delayMs = 500): Promise<boolean> => {
    if (!user) return false;
    
    for (let i = 0; i < maxRetries; i++) {
      if (user?.linkedAccounts && user.linkedAccounts.length > 0) {
        return true;
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    return false;
  };

  // Handle Movement wallet creation and backend sync (like test frontend)
  const handleMovementWalletAndSync = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Step 1: Wait for Privy accounts to load
        await waitForPrivyAccounts();
        
      // Step 2: Initial Sync with backend FIRST (like test frontend)
      const syncResult = await syncWithBackend();
      
      if (!syncResult) {
        throw new Error('Initial backend synchronization failed');
        }
        
      // Step 3: Check if user has Movement wallet in backend or Privy
      const backendHasMovementWallet = syncResult.wallets?.some(
        (w) => w.blockchain === 'MOVEMENT' || w.blockchain === 'APTOS' || w.chainType === 'aptos' || w.chainType === 'movement'
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
      }
  
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
      router.push('/listings');
      throw error;
    }
  }, [privyLogout, queryClient, router, user?.id]);

  return {
    user,
    userData,
    setUserData,
    isAuthenticated,
    isLoading: isLoading || !ready,
    login: handleLogin,
    logout: handleLogout,
    getAccessToken,
    ready,
  };
}
