"use client";

import { usePrivy } from '@privy-io/react-auth';
import { useCreateWallet } from '@privy-io/react-auth/extended-chains';
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
  const [isCreatingMovementWallet, setIsCreatingMovementWallet] = useState(false);
  const syncedUserIdRef = useRef<string | null>(null);
  const hasSyncedRef = useRef(false);
  const isProcessingRef = useRef(false);

  // Update isAuthenticated based on Privy state and localStorage
  useEffect(() => {
    const token = localStorage.getItem('cto_auth_token');
    setIsAuthenticated(authenticated && !!token);
  }, [authenticated]);

  // Wait for Privy to fully load linkedAccounts (with retries)
  const waitForPrivyAccounts = async (maxRetries = 5, delayMs = 500): Promise<boolean> => {
    if (!user) return false;
    
    for (let i = 0; i < maxRetries; i++) {
      // Check if linkedAccounts is loaded and has items
      if (user?.linkedAccounts && user.linkedAccounts.length > 0) {
        console.log(`✅ Privy accounts loaded after ${i + 1} attempt(s)`);
        return true;
      }
      
      if (i < maxRetries - 1) {
        console.log(`⏳ Waiting for Privy accounts to load... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.warn('⚠️ Privy accounts not fully loaded, proceeding anyway...');
    return false;
  };

  // Sync with backend when authenticated - only once per user
  // MATCHES TEST FRONTEND LOGIC EXACTLY: Simple guards, separate function
  useEffect(() => {
    // Match test frontend EXACTLY: simple guards (no ready check, no complex refs)
    if (!authenticated || !user || isSyncing || isCreatingMovementWallet) {
      return;
    }

    // CRITICAL: Check ref to prevent concurrent processing
    // This must be checked BEFORE any async operations
    if (isProcessingRef.current) {
      console.log('⏭️ Already processing, skipping duplicate run');
      return;
    }

    const userId = user.id;
    const existingToken = localStorage.getItem('cto_auth_token');
    const existingUserId = localStorage.getItem('cto_user_id');

    // Skip if already synced for this user
    if (syncedUserIdRef.current === userId || (existingToken && existingUserId === userId)) {
      setIsAuthenticated(true);
      return;
    }

    // Only sync once per session unless user changes
    if (hasSyncedRef.current && syncedUserIdRef.current === userId) {
      return;
    }

    // Set processing flag IMMEDIATELY, synchronously, before any async operations
    isProcessingRef.current = true;

    const performSync = async () => {
      if (isSyncing) {
        isProcessingRef.current = false;
        return;
      }
      
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
        // STEP 1: Wait for Privy accounts to load
        await waitForPrivyAccounts();
        
        // STEP 2: Sync with backend FIRST (like test frontend)
        const token = await getAccessToken();
        if (!token) {
          throw new Error('No Privy token available');
        }
        
        console.log('🔄 Syncing with backend FIRST (matching test frontend logic)...');
        let backendSyncResult;
        try {
          backendSyncResult = await privyService.syncUser(token);
          console.log('✅ Backend sync completed:', backendSyncResult);
        } catch (syncError) {
          console.error('❌ Backend sync failed:', syncError);
          // If sync fails, we'll still try to check Privy wallets
          backendSyncResult = null;
        }
        
        // STEP 3: Check if user has Movement wallet in backend
        // Match test frontend: check for 'movement' or 'MOVEMENT' (backend format)
        // Also check for 'aptos' since Privy returns that for Movement wallets
        const backendHasMovementWallet = backendSyncResult?.wallets?.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (w: any) => w.chainType === 'movement' || w.blockchain === 'MOVEMENT' || w.chainType === 'aptos'
        );
        
        // STEP 4: Check if user has Movement wallet in Privy (check again after sync)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const movementWallet = getMovementWallet(user as any);
        const privyHasMovementWallet = !!movementWallet;
        
        console.log('📊 Wallet Status Check:');
        console.log(`  - Backend has Movement wallet: ${backendHasMovementWallet}`);
        console.log(`  - Privy has Movement wallet: ${privyHasMovementWallet}`);
        
        // STEP 5: Only create wallet if BOTH backend and Privy don't have it
        // Match test frontend EXACTLY: simple check, no complex refs
        if (!backendHasMovementWallet && !privyHasMovementWallet && typeof createWallet === 'function') {
          setIsCreatingMovementWallet(true);
          console.log('🔄 Creating Movement wallet (missing in both backend and Privy)...');
          
          try {
            // Create Movement wallet with 10 second timeout (matching test frontend)
            // Match test frontend: Just try to create, don't check for existing embedded wallets first
            // Privy may allow multiple wallets of different chain types
            /* eslint-disable @typescript-eslint/no-explicit-any */
            const walletCreationPromise = createMovementWallet(user as any, createWallet as any);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Wallet creation timeout')), 10000)
            );
            
            const newWallet = await Promise.race([walletCreationPromise, timeoutPromise]);
            /* eslint-enable @typescript-eslint/no-explicit-any */
            console.log('✅ Movement wallet created:', newWallet);
            
            // Match test frontend: Don't verify returned wallet's chainType
            // Privy may return existing Ethereum wallet, but Aptos wallet will appear in user.linkedAccounts
            // Give Privy a moment to finish internal setup (match test frontend: 1 second)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Double-check wallet exists (match test frontend: simple check)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const verifyWallet = getMovementWallet(user as any);
            if (verifyWallet) {
              console.log('✅ Wallet verified:', verifyWallet.address);
            } else {
              console.warn('⚠️ Wallet created but not immediately available, proceeding anyway...');
            }
            
            // Re-sync with backend after wallet creation
            console.log('🔄 Re-syncing with backend after wallet creation...');
            try {
              const freshToken = await getAccessToken();
              if (freshToken) {
                await privyService.syncUser(freshToken);
              }
            } catch (resyncError) {
              console.error('❌ Backend re-sync failed:', resyncError);
              // Continue anyway
            }
          } catch (walletError: unknown) {
            const errorMessage = walletError instanceof Error ? walletError.message : 'Unknown error';
            
            // Check if wallet was actually created despite the error/timeout
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const checkWallet = getMovementWallet(user as any);
            if (checkWallet) {
              console.log('✅ Wallet exists despite error, proceeding...');
              // Re-sync with backend since wallet exists
              try {
                const freshToken = await getAccessToken();
                if (freshToken) {
                  await privyService.syncUser(freshToken);
                }
              } catch (resyncError) {
                console.error('❌ Backend re-sync failed:', resyncError);
              }
            } else {
              // If error is "User already has an embedded wallet", that's expected
              if (errorMessage.includes('already has an embedded wallet') || 
                  errorMessage.includes('embedded wallet')) {
                console.warn('⚠️ User already has an embedded wallet - Privy limitation');
                console.warn('⚠️ Continuing with authentication - existing wallets will be synced');
              } else {
                console.error('❌ Failed to create Movement wallet:', walletError);
                console.error('Error message:', errorMessage);
              }
            }
            // Continue anyway - wallet creation is not critical for authentication
          } finally {
            setIsCreatingMovementWallet(false);
          }
        } else {
          if (movementWallet) {
            console.log('✅ User already has Movement wallet, skipping creation');
            console.log(`  - Privy wallet: ${movementWallet.address}`);
          } else if (backendHasMovementWallet) {
            console.log('✅ Backend has Movement wallet, skipping creation');
          }
        }
        
        clearTimeout(timeoutId);
        syncedUserIdRef.current = userId;
        hasSyncedRef.current = true;
        setIsAuthenticated(true);
        console.log('✅ Authentication flow completed, isAuthenticated set to true');
        
        // Force a small delay to ensure state updates propagate
        await new Promise(resolve => setTimeout(resolve, 100));
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
        isProcessingRef.current = false; // Reset processing flag
        console.log('✅ isSyncing set to false');
      }
    };

    performSync();
    // Match test frontend EXACTLY: depend on authenticated and user
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, user]);

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




