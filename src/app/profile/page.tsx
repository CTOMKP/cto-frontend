"use client";

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getMovementWallet } from '@/lib/movement-wallet';
import axios from 'axios';
import { BackendWallet, PrivyWalletAccount, PrivyUser } from '@/types/privy';

// Helper function to get wallet chain info
function getWalletChainInfo(wallet: BackendWallet | PrivyWalletAccount) {
  const chainType = 'chainType' in wallet ? wallet.chainType : undefined;
  const blockchain = 'blockchain' in wallet ? wallet.blockchain : undefined;
  return { chainType, blockchain };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  const { logout } = usePrivyAuth();
  const [allWallets, setAllWallets] = useState<BackendWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const walletsLoadedRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (authenticated && user && ready) {
      const userId = user.id;
      // Only load wallets once per user, or if user changed
      if (walletsLoadedRef.current !== userId) {
        loadWallets();
        walletsLoadedRef.current = userId;
      }
    }
  }, [authenticated, user?.id, ready]);

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      // First, try to load from localStorage
      const walletsJson = localStorage.getItem('cto_user_wallets');
      if (walletsJson) {
        try {
          const wallets = JSON.parse(walletsJson);
          setAllWallets(wallets);
          setIsLoading(false);
          return;
        } catch (parseError) {
          console.error('Failed to parse wallets from localStorage:', parseError);
        }
      }

      // Fallback: Fetch from backend
      const token = localStorage.getItem('cto_auth_token');
      const userId = localStorage.getItem('cto_user_id');
      
      if (!token || !userId) {
        setIsLoading(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await axios.get(
        `${backendUrl}/api/auth/privy/wallets`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.wallets) {
        const wallets = response.data.wallets;
        setAllWallets(wallets);
        localStorage.setItem('cto_user_wallets', JSON.stringify(wallets));
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!ready || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Please login to view your profile</p>
        </div>
      </div>
    );
  }

  // Combine Privy wallets with backend wallets
  // Privy's user.linkedAccounts is LinkedAccountWithMetadata[], so we need to filter and cast
  const privyWallets = user?.linkedAccounts?.filter(
    (account) => account.type === 'wallet'
  ) as PrivyWalletAccount[] || [];
  const displayWallets = allWallets.length > 0 ? allWallets : privyWallets;
  const email = user?.email?.address || user?.wallet?.address || 'Privy User';
  // Cast user to PrivyUser for getMovementWallet
  const movementWallet = getMovementWallet(user as PrivyUser);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <p className="text-gray-400">Welcome back, {email}</p>
              <p className="text-sm text-gray-500 mt-1">Privy ID: {user?.id}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallets Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">💼 Your Wallets</h2>
          
          {displayWallets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No wallets found</p>
              <p className="text-sm text-gray-500">Wallets should be created automatically on login</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayWallets.map((wallet: BackendWallet | PrivyWalletAccount, index: number) => {
                const { chainType, blockchain } = getWalletChainInfo(wallet);
                const chain = (chainType || blockchain || '').toLowerCase();
                const chainUpper = (chainType || blockchain || '').toUpperCase();
                
                return (
                <div key={index} className="border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {(chain === 'ethereum' || chainUpper === 'ETHEREUM') && '⟠'}
                          {(chain === 'solana' || chainUpper === 'SOLANA') && '◎'}
                          {(chain === 'base' || chainUpper === 'BASE') && '🔵'}
                          {(chain === 'polygon' || chainUpper === 'POLYGON') && '🟣'}
                          {(chain === 'aptos' || chainUpper === 'APTOS' || chainUpper === 'MOVEMENT') && '🅰️'}
                        </span>
                        <span className="font-semibold text-white capitalize">
                          {chainUpper === 'MOVEMENT' 
                            ? 'Movement Wallet' 
                            : (chain || 'Unknown') + ' Wallet'}
                        </span>
                        {index === 0 && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-sm text-gray-400 break-all">
                        {wallet.address}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(wallet.address);
                        toast.success('Address copied!');
                      }}
                      className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm ml-4"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* Movement Wallet Info */}
          {movementWallet && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                <span className="text-2xl">🅰️</span>
                <span>Movement Wallet</span>
              </h3>
              <p className="text-sm text-green-300 mb-2">
                ✅ Your Movement wallet is ready!
              </p>
              <p className="text-xs text-green-400 font-mono break-all bg-black/50 p-2 rounded">
                {movementWallet.address}
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-300 mb-2">💡 About Your Wallets</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>✅ All wallets are managed securely by Privy</li>
            <li>✅ Embedded wallets work across all devices</li>
            <li>✅ You can also connect external wallets (MetaMask, Phantom, etc.)</li>
            <li>✅ Private keys are never stored on our servers</li>
            <li>✅ Multi-chain support: Ethereum, Solana, Base, Polygon, Movement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
