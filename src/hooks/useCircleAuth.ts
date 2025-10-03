"use client";

import { useState, useEffect } from 'react';
import { circleAuthService, CircleUser, CircleLoginResponse } from '@/services/circle-auth';

interface CircleAuthState {
  user: CircleUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useCircleAuth() {
  const [state, setState] = useState<CircleAuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        // Try CTO-CircleWallet pattern first (working pattern)
        const storedEmail = localStorage.getItem('cto_user_email');
        const storedToken = localStorage.getItem('cto_auth_token');
        
        if (storedEmail && storedToken) {
          const userData = {
            id: storedEmail,
            email: storedEmail,
            status: 'active'
          };
          setState({
            user: userData,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          return;
        }
        
        // Fallback to circle_user pattern
        const storedUser = localStorage.getItem('circle_user');
        const storedCircleToken = localStorage.getItem('circle_token');
        
        if (storedUser && storedCircleToken) {
          const parsedUser = JSON.parse(storedUser);
          setState({
            user: parsedUser,
            token: storedCircleToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to load authentication state' 
        }));
      }
    };

    loadAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Use email as userId for login (backend might expect email as userId)
      const response: CircleLoginResponse = await circleAuthService.login(email, password);
      
      // Store in localStorage using CTO-CircleWallet pattern
      localStorage.setItem('cto_user_email', response.user.email);
      localStorage.setItem('cto_auth_token', response.token);
      
      // Also store in circle_user format for compatibility
      localStorage.setItem('circle_user', JSON.stringify(response.user));
      localStorage.setItem('circle_token', response.token);
      
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const register = async (userId: string, email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await circleAuthService.createUser(userId, email, password);
      
      // After successful registration, automatically log in
      await login(email, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const logout = (): void => {
    // Clear localStorage using both patterns
    localStorage.removeItem('cto_user_email');
    localStorage.removeItem('cto_auth_token');
    localStorage.removeItem('cto_wallet_id');
    localStorage.removeItem('circle_user');
    localStorage.removeItem('circle_token');
    
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    login,
    register,
    logout,
    clearError
  };
}