"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';

/**
 * Inner component that uses useSearchParams - MUST be wrapped in Suspense for Next.js 15
 * This is a hard requirement - the build will fail without it
 */
function LoginPageContent() {
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

    // If user is authenticated (from Privy), redirect to profile
    // Don't wait for isAuthenticated from our hook - that depends on backend sync
    // which might take time. Privy authentication is enough to proceed.
    if (authenticated && !hasRedirected) {
      // Give it a moment for the sync to start, then redirect
      const redirectTimer = setTimeout(() => {
        setHasRedirected(true);
        router.replace('/profile');
      }, 1000); // Small delay to let sync start
      
      return () => clearTimeout(redirectTimer);
    }

    // If NOT authenticated and NOT an OAuth callback, trigger login modal
    // This is the main purpose of the /login page - let users log in!
    if (!authenticated && !isOAuthCallback && !hasTriggeredLogin && ready) {
      setHasTriggeredLogin(true);
      console.log('🔄 User visited /login - opening Privy login modal');
      try {
        login();
      } catch (error) {
        console.error('Failed to trigger login:', error);
      }
      return;
    }

    // For OAuth callbacks, wait for authentication with a timeout
    if (isOAuthCallback && !authenticated) {
      console.log('⏳ OAuth callback detected - waiting for authentication...');
      
      // Set a timeout - if authentication doesn't complete in 30 seconds, show error
      const timeout = setTimeout(() => {
        if (!authenticated) {
          console.error('❌ OAuth callback timeout - authentication did not complete');
          // Could redirect to home with an error message, or show error on page
        }
      }, 30000);
      
      return () => clearTimeout(timeout);
    }
  }, [ready, authenticated, isAuthenticated, isLoading, router, searchParams, hasRedirected, hasTriggeredLogin, login]);

  // Check if this is an OAuth callback
  const isOAuthCallback = searchParams.get('privy_oauth_state') || 
                          searchParams.get('privy_oauth_code') ||
                          searchParams.get('privy_oauth_provider');

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated (from Privy), show redirecting message
  // Don't wait for isAuthenticated from our hook - backend sync happens in background
  if (authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">
            {isOAuthCallback ? 'Completing login...' : 'Redirecting to profile...'}
          </p>
        </div>
      </div>
    );
  }

  // OAuth callback but not authenticated yet - show processing message
  if (isOAuthCallback && !authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Completing login...</p>
          <p className="mt-2 text-gray-400 text-sm">Please wait while we finish setting up your account</p>
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

/**
 * Login page to handle OAuth callbacks from Privy
 * This page is required for OAuth redirects to work properly
 * 
 * CRITICAL: Wrapped in Suspense to satisfy Next.js 15 requirement for useSearchParams()
 * DO NOT REMOVE - the build will fail without this wrapper
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

