"use client";

import { usePrivy, useCreateWallet } from '@privy-io/react-auth';
import { useCallback, useEffect, useState, useRef } from 'react';
import { privyService } from '@/services/privyService';
import { createMovementWallet, getMovementWallet } from '@/lib/movement-wallet';
import { PrivyUser } from '@/types/privy';

export function usePrivyAuth() {
  const { 
    authenticated, 
    ready, 
    user, 
    login, 
    logout: privyLogout, 
    getAccessToken 
  } = usePrivy();
  
  const { createWallet } = useCreateWallet();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const syncedUserIdRef = useRef<string | null>(null);
  const hasSyncedRef = useRef(false);
  const walletCreationAttemptedRef = useRef<string | null>(null);

  // Update isAuthenticated based on Privy state and localStorage
  useEffect(() => {
    const token = localStorage.getItem('cto_auth_token');
    setIsAuthenticated(authenticated && !!token);
  }, [authenticated]);

  // Sync with backend when authenticated - only once per user
  useEffect(() => {
    // Don't sync if already syncing, not ready, not authenticated, or no user
    if (!ready || !authenticated || !user || isSyncing) {
      return;
    }

    const userId = user.id;
    const existingToken = localStorage.getItem('cto_auth_token');
    const existingUserId = localStorage.getItem('cto_user_id');

    // Skip sync if:
    // 1. We've already synced for this user ID
    // 2. We have a valid token and it matches the current user
    if (syncedUserIdRef.current === userId || (existingToken && existingUserId === userId)) {
      setIsAuthenticated(true);
      return;
    }

    // Only sync once per session unless user changes
    if (hasSyncedRef.current && syncedUserIdRef.current === userId) {
      return;
    }

    const performSync = async () => {
      if (isSyncing) return;
      
      setIsSyncing(true);
      try {
        const token = await getAccessToken();
        if (token) {
          // First, check if user needs a Movement wallet and create it if needed
          // This should happen BEFORE sync to avoid retry loops
          if (user && createWallet && walletCreationAttemptedRef.current !== userId) {
            const movementWallet = getMovementWallet(user as PrivyUser);
            
            if (!movementWallet) {
              walletCreationAttemptedRef.current = userId;
              console.log('🔄 No Movement wallet found in Privy, creating one...');
              try {
                await createMovementWallet(user as PrivyUser, createWallet);
                console.log('✅ Movement wallet created');
                // Give Privy a moment to register the wallet
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (walletError) {
                console.error('⚠️ Failed to create Movement wallet:', walletError);
                // Continue anyway - wallet creation is not critical for authentication
              }
            }
          }
          
          // Now sync with backend (this will include the newly created wallet if it was created)
          const syncResult = await privyService.syncUser(token);
          syncedUserIdRef.current = userId;
          hasSyncedRef.current = true;
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to sync with backend:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    performSync();
  }, [authenticated, user?.id, ready, getAccessToken, isSyncing, user, createWallet]);

  const handleLogin = useCallback(async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [login]);

  const handleLogout = useCallback(async () => {
    try {
      // Clear Privy session
      await privyLogout();
      
      // Clear all localStorage data
      privyService.logout();
      
      // Reset authentication state
      setIsAuthenticated(false);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if Privy logout fails, clear localStorage
      privyService.logout();
      setIsAuthenticated(false);
      throw error;
    }
  }, [privyLogout]);

  return {
    user,
    isAuthenticated,
    isLoading: !ready || isSyncing,
    login: handleLogin,
    logout: handleLogout,
    getAccessToken,
    ready,
  };
}




