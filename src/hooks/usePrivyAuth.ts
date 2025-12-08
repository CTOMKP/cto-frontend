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
      
      // Set a maximum timeout to prevent infinite loading (30 seconds)
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Authentication sync taking too long, forcing completion...');
        const token = localStorage.getItem('cto_auth_token');
        if (token) {
          setIsAuthenticated(true);
          setIsSyncing(false);
        }
      }, 30000);
      
      try {
        const token = await getAccessToken();
        if (token) {
          // First, check if user needs a Movement wallet and create it if needed
          // Only attempt once per user ID to prevent multiple attempts
          if (user && typeof createWallet === 'function' && walletCreationAttemptedRef.current !== userId) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const movementWallet = getMovementWallet(user as any);
              
              if (!movementWallet) {
                walletCreationAttemptedRef.current = userId;
                console.log('🔄 No Movement wallet found in Privy, attempting to create one...');
                console.log('🔄 createWallet function available:', !!createWallet);
                console.log('🔄 User linkedAccounts:', user.linkedAccounts?.length || 0);
                
                // Check if user already has an embedded wallet (Privy limitation)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const hasEmbeddedWallet = (user as any).linkedAccounts?.some(
                  (account: any) => account.type === 'wallet' && 
                                   (account.walletClientType === 'privy' || account.connectorType === 'embedded')
                );

                if (hasEmbeddedWallet) {
                  console.warn('⚠️ User already has an embedded wallet. Privy only allows one embedded wallet per user.');
                  console.warn('⚠️ Movement wallet cannot be created via createWallet. This is a Privy limitation.');
                  console.warn('⚠️ Continuing with authentication - existing wallets will be synced.');
                } else {
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const newWallet = await Promise.race([
                      createMovementWallet(user as any, createWallet as any),
                      new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Wallet creation timeout')), 5000)
                      )
                    ]);
                    console.log('✅ Movement wallet creation returned:', newWallet);
                  } catch (walletError: unknown) {
                    const errorMessage = walletError instanceof Error ? walletError.message : 'Unknown error';
                    
                    // If error is "User already has an embedded wallet", that's expected
                    if (errorMessage.includes('already has an embedded wallet') || 
                        errorMessage.includes('embedded wallet')) {
                      console.warn('⚠️ User already has an embedded wallet - Privy limitation');
                      console.warn('⚠️ Continuing with authentication - existing wallets will be synced');
                    } else {
                      console.error('❌ Failed to create Movement wallet:', walletError);
                      console.error('Error message:', errorMessage);
                    }
                    // Continue anyway - wallet creation is not critical for authentication
                  }
                }
              } else {
                console.log('✅ Movement wallet already exists:', movementWallet.address);
              }
            } catch (error) {
              console.error('❌ Error checking for Movement wallet:', error);
              // Continue with sync anyway
            }
          }
          
          // Now sync with backend (this will include any existing wallets)
          console.log('🔄 Syncing with backend...');
          await privyService.syncUser(token);
          console.log('✅ Backend sync completed');
          
          clearTimeout(timeoutId);
          syncedUserIdRef.current = userId;
          hasSyncedRef.current = true;
          setIsAuthenticated(true);
          console.log('✅ Authentication flow completed, isAuthenticated set to true');
          
          // Force a small delay to ensure state updates propagate
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ Failed to sync with backend:', error);
        // Even if sync fails, try to set authenticated if we have a token
        const token = localStorage.getItem('cto_auth_token');
        if (token) {
          console.log('⚠️ Sync failed but token exists, setting authenticated anyway');
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setIsSyncing(false);
        console.log('✅ isSyncing set to false');
      }
    };

    performSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, user?.id, ready]);

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




