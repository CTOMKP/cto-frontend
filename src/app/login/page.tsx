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
  const { authenticated, ready } = usePrivy();
  const { isAuthenticated, isLoading } = usePrivyAuth();
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

    // If not authenticated and not an OAuth callback, redirect to home after delay
    // Give OAuth callbacks more time to process (10 seconds)
    const timeout = setTimeout(() => {
      if (!authenticated && !isOAuthCallback && !hasRedirected) {
        setHasRedirected(true);
        router.replace('/');
      } else if (!authenticated && isOAuthCallback && !hasRedirected) {
        // OAuth callback but still not authenticated after 10 seconds - might be processing
        // Don't redirect yet, let it continue
        console.log('⏳ OAuth callback still processing...');
      }
    }, isOAuthCallback ? 10000 : 5000);

    return () => clearTimeout(timeout);
  }, [ready, authenticated, isAuthenticated, isLoading, router, searchParams, hasRedirected]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white">
          {isLoading ? 'Completing login...' : 'Redirecting...'}
        </p>
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

