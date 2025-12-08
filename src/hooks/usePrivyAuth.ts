"use client";

import { usePrivy, useCreateWallet } from '@privy-io/react-auth';
import { useCallback, useEffect, useState, useRef } from 'react';
import { privyService } from '@/services/privyService';
import { createMovementWallet, getMovementWallet } from '@/lib/movement-wallet';

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
            // Use 'any' types to match test frontend implementation
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const movementWallet = getMovementWallet(user as any);
            
            if (!movementWallet) {
              walletCreationAttemptedRef.current = userId;
              console.log('🔄 No Movement wallet found in Privy, creating one...');
              console.log('🔄 createWallet function available:', !!createWallet);
              console.log('🔄 User linkedAccounts:', user.linkedAccounts?.length || 0);
              
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const newWallet = await createMovementWallet(user as any, createWallet as any);
                console.log('✅ Movement wallet creation returned:', newWallet);
                
                // Verify wallet was actually created by checking Privy user again
                // Wait a bit for Privy to update the user object
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Re-check if wallet exists (user object might have updated)
                // Note: user object might not update immediately, so we continue anyway
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const verifyWallet = getMovementWallet(user as any);
                if (verifyWallet) {
                  console.log('✅ Movement wallet verified in Privy:', verifyWallet.address);
                } else {
                  console.warn('⚠️ Movement wallet created but not yet visible in Privy user object');
                  console.warn('⚠️ This is normal - wallet may take a few seconds to appear in Privy');
                  console.warn('⚠️ Continuing with authentication - wallet will sync on next login');
                }
              } catch (walletError: unknown) {
                console.error('❌ Failed to create Movement wallet:', walletError);
                const errorMessage = walletError instanceof Error ? walletError.message : 'Unknown error';
                const errorStack = walletError instanceof Error ? walletError.stack : undefined;
                console.error('Error message:', errorMessage);
                console.error('Error stack:', errorStack);
                // Continue anyway - wallet creation is not critical for authentication
                // User can manually create wallet later if needed
              }
            } else {
              console.log('✅ Movement wallet already exists:', movementWallet.address);
            }
          } else if (!createWallet) {
            console.warn('⚠️ createWallet function not available from useCreateWallet hook');
          }
          
          // Now sync with backend (this will include the newly created wallet if it was created)
          console.log('🔄 Syncing with backend...');
          await privyService.syncUser(token);
          console.log('✅ Backend sync completed');
          
          syncedUserIdRef.current = userId;
          hasSyncedRef.current = true;
          setIsAuthenticated(true);
          console.log('✅ Authentication flow completed, isAuthenticated set to true');
        }
      } catch (error) {
        console.error('❌ Failed to sync with backend:', error);
        // Even if sync fails, clear the loading state so user isn't stuck
        setIsAuthenticated(false);
      } finally {
        setIsSyncing(false);
        console.log('✅ isSyncing set to false');
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




