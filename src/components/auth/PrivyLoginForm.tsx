"use client";

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { MoonLoader } from 'react-spinners';

interface PrivyLoginFormProps {
  onClose?: () => void;
}

export function PrivyLoginForm({ onClose }: PrivyLoginFormProps) {
  const { login, ready, authenticated } = usePrivy();

  const handleLogin = async () => {
    try {
      await login();
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (!ready) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <MoonLoader color="#ffffff" size={50} />
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">You&apos;re Logged In!</h2>
        <p className="text-gray-400">Redirecting to your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to CTO Marketplace</h2>
        <p className="text-gray-400">Secure authentication powered by Privy</p>
      </div>

      <Button
        onClick={handleLogin}
        className="w-full cta-gradient py-6 text-lg font-semibold"
      >
        🔐 Login with Privy
      </Button>

      <div className="mt-6 p-4 bg-blue-50/10 rounded-xl">
        <h3 className="font-semibold text-blue-300 mb-2">✨ What is Privy?</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✅ Secure wallet-based authentication</li>
          <li>✅ Email & social login options</li>
          <li>✅ Embedded wallets (no extension needed)</li>
          <li>✅ Connect external wallets (MetaMask, Phantom, etc.)</li>
        </ul>
      </div>
    </div>
  );
}




