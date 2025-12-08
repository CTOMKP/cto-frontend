"use client";

import { usePrivy } from '@privy-io/react-auth';
import { useCallback, useEffect, useState, useRef } from 'react';
import { privyService } from '@/services/privyService';

export function usePrivyAuth() {
  const { 
    authenticated, 
    ready, 
    user, 
    login, 
    logout: privyLogout, 
    getAccessToken 
  } = usePrivy();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const syncedUserIdRef = useRef<string | null>(null);
  const hasSyncedRef = useRef(false);

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
          await privyService.syncUser(token);
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
  }, [authenticated, user?.id, ready, getAccessToken, isSyncing]);

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




