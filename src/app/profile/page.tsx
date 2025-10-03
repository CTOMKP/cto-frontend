"use client";

import React, { useState, useEffect } from 'react';
import { useCircleAuth } from '../../hooks/useCircleAuth';
import { useCircleWallet } from '../../hooks/useCircleWallet';
import { BalanceSection } from '../../components/Profile/BalanceSection';
import { WalletInfo } from '../../components/Profile/WalletInfo';
import { QRCodeDisplay } from '../../components/Wallet/QRCodeDisplay';
import { TopUpSection } from '../../components/Profile/TopUpSection';
import { WithdrawSection } from '@/components/Profile/WithdrawSection';
import { ActivitiesSection } from '../../components/Profile/ActivitiesSection';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useCircleAuth();
  const { 
    wallet, 
    balances, 
    isLoading: walletLoading, 
    refreshBalances,
    error: walletError,
    clearError
  } = useCircleWallet(user?.id);

  const [showQRModal, setShowQRModal] = useState(false);

  // Check if user is actually authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Force redirect to login if not authenticated
      window.location.href = '/';
    }
  }, [authLoading, isAuthenticated]);

  const handleRefreshBalances = async () => {
    try {
      await refreshBalances();
      toast.success('Balances refreshed!');
    } catch {
      toast.error('Failed to refresh balances');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <p className="text-gray-400">Welcome back, {user.email}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowQRModal(true)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Show QR Code
              </button>
              <button
                onClick={handleRefreshBalances}
                disabled={walletLoading}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {walletLoading ? 'Refreshing...' : 'Refresh Balances'}
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet Info & QR Code */}
          <div className="lg:col-span-1 space-y-6">
            <WalletInfo wallet={wallet} onShowQR={() => setShowQRModal(true)} />
            
            {/* QR Code Button */}
            {wallet && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="w-full cta-gradient text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Show QR Code
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Balances & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Section */}
            <BalanceSection 
              balances={balances} 
              isLoading={walletLoading}
              onRefresh={handleRefreshBalances}
              walletError={walletError}
              clearError={clearError}
            />

            {/* Top Up Section */}
            {wallet && <TopUpSection wallet={wallet} />}

            {/* Withdraw Section */}
            {wallet && <WithdrawSection wallet={wallet} balances={balances} />}

            {/* Activities Section */}
            {wallet && <ActivitiesSection wallet={wallet} />}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && wallet && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-800 w-96 shadow-lg rounded-md bg-gray-900">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Fund Your Wallet
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <QRCodeDisplay
                data={{ address: wallet.address }}
                title="Your Wallet Address"
                description="Scan this QR code or copy the address to send funds to your wallet"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}