"use client";

import { usePrivy } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';
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

  // Update isAuthenticated based on Privy state and localStorage
  useEffect(() => {
    const token = localStorage.getItem('cto_auth_token');
    setIsAuthenticated(authenticated && !!token);
  }, [authenticated]);

  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const token = await getAccessToken();
      if (token) {
        await privyService.syncUser(token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [getAccessToken, isSyncing]);

  // Sync with backend when authenticated
  useEffect(() => {
    if (authenticated && user && ready && !isSyncing) {
      handleSync();
    }
  }, [authenticated, user, ready, isSyncing, handleSync]);

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
      await privyLogout();
      privyService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
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




