"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';

/**
 * Login page to handle OAuth callbacks from Privy
 * This page is required for OAuth redirects to work properly
 */
export default function LoginPage() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const { isAuthenticated, isLoading } = usePrivyAuth();

  useEffect(() => {
    // Wait for Privy to be ready
    if (!ready) {
      return;
    }

    // If user is authenticated, redirect to profile
    if (authenticated && isAuthenticated) {
      router.replace('/profile');
      return;
    }

    // If not authenticated after a short delay, redirect to home
    // This handles cases where OAuth callback fails
    const timeout = setTimeout(() => {
      if (!authenticated) {
        router.replace('/');
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [ready, authenticated, isAuthenticated, router]);

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

