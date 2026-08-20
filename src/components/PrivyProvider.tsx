"use client";

import React, { useMemo } from 'react';
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import RewardProgressSync from '@/components/RewardProgressSync';
import { getSolanaRpcUrl } from '@/lib/solanaRpc';

interface PrivyProviderProps {
  children: React.ReactNode;
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  const solanaRpcs = useMemo(() => {
    const bundle = (http: string) => {
      const ws = /^https:/i.test(http)
        ? http.replace(/^https:/i, 'wss:')
        : /^http:/i.test(http)
          ? http.replace(/^http:/i, 'ws:')
          : http;
      return {
        rpc: createSolanaRpc(http),
        rpcSubscriptions: createSolanaRpcSubscriptions(ws),
      };
    };
    return {
      'solana:devnet': bundle(getSolanaRpcUrl('devnet')),
      'solana:mainnet': bundle(getSolanaRpcUrl('mainnet-beta')),
    };
  }, []);

  // Add global error handler for Privy (must be called before any early returns)
  React.useEffect(() => {
    const handlePrivyError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('walletProxy')) {
        console.warn('Privy walletProxy error - this is usually temporary:', event.error);
        event.preventDefault();
      }
      
      if (event.error?.message?.includes('TimeoutError') || 
          event.error?.message?.includes('oauth') ||
          event.error?.message?.includes('auth.privy.io')) {
        console.warn('Privy OAuth error - this might be temporary:', event.error);
      }
    };

    window.addEventListener('error', handlePrivyError);
    return () => window.removeEventListener('error', handlePrivyError);
  }, []);

  if (!privyAppId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-600 mb-4">
            Privy App ID is not configured. Please check your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProviderBase
      appId={privyAppId}
      config={{
        solana: { rpcs: solanaRpcs },
        embeddedWallets: {
          // Authentication must not be blocked by wallet provisioning. Wallets are
          // created and synchronized after login by usePrivyAuth.
          ethereum: { createOnLogin: 'off' },
          solana: { createOnLogin: 'off' },
        },
        loginMethods: ['email', 'wallet', 'google'],
        appearance: {
          theme: '#010101',
          accentColor: '#8B5CF6',
          logo: '/logo.png',
          showWalletLoginFirst: true,
        },
      }}
    >
      <RewardProgressSync />
      {children}
    </PrivyProviderBase>
  );
}
