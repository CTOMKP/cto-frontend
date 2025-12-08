"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';

/**
 * Login page to handle OAuth callbacks from Privy and manual login
 * - If user is authenticated: redirect to profile
 * - If user is NOT authenticated: automatically trigger Privy login modal
 * - Handles OAuth callbacks properly
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, ready, login } = usePrivy();
  const { isAuthenticated, isLoading } = usePrivyAuth();
  const [hasTriggeredLogin, setHasTriggeredLogin] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Wait for Privy to be ready
    if (!ready) {
      return;
    }

    // Check if this is an OAuth callback
    const isOAuthCallback = searchParams.get('privy_oauth_state') || 
                            searchParams.get('privy_oauth_code') ||
                            searchParams.get('privy_oauth_provider');

    // If user is authenticated and sync is complete, redirect to profile
    if (authenticated && isAuthenticated && !isLoading && !hasRedirected) {
      setHasRedirected(true);
      router.replace('/profile');
      return;
    }

    // If NOT authenticated and NOT an OAuth callback, trigger login automatically
    // This is the main use case - user navigates to /login to log in!
    if (!authenticated && !isOAuthCallback && !hasTriggeredLogin && ready) {
      setHasTriggeredLogin(true);
      console.log('🔄 User navigated to /login - triggering Privy login modal');
      try {
        login();
      } catch (error) {
        console.error('Failed to trigger login:', error);
        // Don't redirect on error - let user try again or use the LoginButton
      }
      return;
    }

    // For OAuth callbacks, just wait for authentication to complete
    // The usePrivyAuth hook will handle the sync and redirect
    if (isOAuthCallback && !authenticated) {
      console.log('⏳ OAuth callback detected - waiting for authentication...');
      // Don't set a timeout - let the OAuth flow complete naturally
      return;
    }
  }, [ready, authenticated, isAuthenticated, isLoading, router, searchParams, hasRedirected, hasTriggeredLogin, login]);

  // Show loading state while Privy initializes or during OAuth callback
  if (!ready || (searchParams.get('privy_oauth_state') && !authenticated)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">
            {isLoading ? 'Completing login...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, show brief loading while redirecting
  if (authenticated && isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Redirecting to profile...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and login was triggered, show message
  // The Privy modal should be open at this point
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white">Opening login...</p>
        <p className="mt-2 text-gray-400 text-sm">If the login modal didn&apos;t open, click the Login button in the navbar</p>
      </div>
    </div>
  );
}

