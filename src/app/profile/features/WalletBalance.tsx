"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, EyeOff, ChevronDown, ChevronUp, MoveDown, MoveUp, ArrowUpDown, Wallet } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import axios from 'axios';
import { BackendWallet, PrivyWalletAccount, PrivyUser } from '@/types/privy';
import { getMovementWallet } from '@/lib/movement-wallet';

interface WalletAsset {
  name: string;
  value: number;
  logo?: string | null;
  address: string;
  chainType: string;
}

// Helper function to get wallet chain info
function getWalletChainInfo(wallet: BackendWallet | PrivyWalletAccount) {
  const chainType = 'chainType' in wallet ? wallet.chainType : undefined;
  const blockchain = 'blockchain' in wallet ? wallet.blockchain : undefined;
  return { chainType, blockchain };
}

// Helper function to get chain display name
function getChainDisplayName(chainType?: string, blockchain?: string): string {
  const chain = (chainType || blockchain || '').toLowerCase();
  const chainUpper = (chainType || blockchain || '').toUpperCase();
  
  if (chainUpper === 'MOVEMENT') return 'Movement';
  if (chain === 'ethereum' || chainUpper === 'ETHEREUM') return 'Ethereum';
  if (chain === 'solana' || chainUpper === 'SOLANA') return 'Solana';
  if (chain === 'base' || chainUpper === 'BASE') return 'Base';
  if (chain === 'polygon' || chainUpper === 'POLYGON') return 'Polygon';
  if (chain === 'aptos' || chainUpper === 'APTOS') return 'Aptos';
  return chain || 'Unknown';
}

// Helper function to get chain image path
function getChainImage(chainType?: string, blockchain?: string): string {
  const chain = (chainType || blockchain || '').toLowerCase();
  const chainUpper = (chainType || blockchain || '').toUpperCase();
  
  const chainMap: Record<string, string> = {
    'solana': '/listings-chains/solana.png',
    'ethereum': '/listings-chains/ethereum.png',
    'bsc': '/listings-chains/bnb.png',
    'sui': '/listings-chains/sui.jpg',
    'base': '/listings-chains/base.png',
    'aptos': '/listings-chains/aptos.png',
    'movement': '/listings-chains/movement.png',
    'near': '/listings-chains/near.png',
    'osmosis': '/listings-chains/osmosis.jpg',
    'polygon': '/listings-chains/ethereum.png', // Polygon uses Ethereum image as fallback
  };
  
  // Check for exact matches first
  if (chainMap[chain]) {
    return chainMap[chain];
  }
  
  // Check for uppercase matches
  if (chainUpper === 'MOVEMENT') return '/listings-chains/movement.png';
  if (chainUpper === 'ETHEREUM') return '/listings-chains/ethereum.png';
  if (chainUpper === 'SOLANA') return '/listings-chains/solana.png';
  if (chainUpper === 'BASE') return '/listings-chains/base.png';
  if (chainUpper === 'POLYGON') return '/listings-chains/ethereum.png';
  if (chainUpper === 'APTOS') return '/listings-chains/aptos.png';
  
  // Default fallback
  return '/listings-chains/solana.png';
}

// Map chain types to Privy API chain enum values
function mapToPrivyChain(chainType?: string, blockchain?: string): string | null {
  const chain = (chainType || blockchain || '').toLowerCase();
  const chainUpper = (chainType || blockchain || '').toUpperCase();
  
  const chainMap: Record<string, string> = {
    'ethereum': 'ethereum',
    'base': 'base',
    'polygon': 'polygon',
    'solana': 'solana',
    'aptos': 'solana', // Aptos/Movement wallets use solana for balance check in Privy
    'movement': 'solana',
  };
  
  if (chainMap[chain]) {
    return chainMap[chain];
  }
  
  // Handle uppercase
  const upperMap: Record<string, string> = {
    'ETHEREUM': 'ethereum',
    'BASE': 'base',
    'POLYGON': 'polygon',
    'SOLANA': 'solana',
    'APTOS': 'solana',
    'MOVEMENT': 'solana',
  };
  
  if (upperMap[chainUpper]) {
    return upperMap[chainUpper];
  }
  
  return null;
}

// Map chain types to Privy API asset enum values
function mapToPrivyAsset(chainType?: string, blockchain?: string): string | null {
  const chain = (chainType || blockchain || '').toLowerCase();
  const chainUpper = (chainType || blockchain || '').toUpperCase();
  
  const assetMap: Record<string, string> = {
    'ethereum': 'eth',
    'base': 'eth',
    'polygon': 'pol',
    'solana': 'sol',
    'aptos': 'aptos', // Using SOL as fallback for Aptos/Movement
    'movement': 'aptos',
  };
  
  if (assetMap[chain]) {
    return assetMap[chain];
  }
  
  const upperMap: Record<string, string> = {
    'ETHEREUM': 'eth',
    'BASE': 'eth',
    'POLYGON': 'pol',
    'SOLANA': 'sol',
    'APTOS': 'aptos',
    'MOVEMENT': 'aptos',
  };
  
  if (upperMap[chainUpper]) {
    return upperMap[chainUpper];
  }
  
  return null;
}

// Fetch balance for a wallet using Privy API
// See: https://docs.privy.io/api-reference/wallets/get-balance#get-balance
async function fetchWalletBalance(wallet: BackendWallet | PrivyWalletAccount): Promise<number> {
  try {
    // Privy API requires wallet ID - only works for PrivyWalletAccount with valid ID
    if (!('id' in wallet) || !wallet.id) {
      console.warn('Wallet ID not available for Privy balance API');
      return 0;
    }
    
    const { chainType, blockchain } = getWalletChainInfo(wallet);
    const privyChain = mapToPrivyChain(chainType, blockchain);
    const privyAsset = mapToPrivyAsset(chainType, blockchain);
    
    if (!privyChain || !privyAsset) {
      console.warn(`Unsupported chain for Privy balance API: ${chainType || blockchain}`);
      return 0;
    }
    
    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const privyAppSecret = process.env.NEXT_PUBLIC_PRIVY_APP_SECRET;
    
    // Note: App secret should ideally be stored on backend for security
    // This is a frontend implementation per user's request
    if (!privyAppId || !privyAppSecret) {
      console.warn('Privy App ID or Secret not configured');
      return 0;
    }
    
    // Create Basic Auth header: base64(appId:appSecret)
    const authString = Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');
    
    const url = new URL(`https://api.privy.io/v1/wallets/${wallet.id}/balance`);
    url.searchParams.set('chain', privyChain);
    url.searchParams.set('asset', privyAsset);
    url.searchParams.set('include_currency', 'usd');
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'privy-app-id': privyAppId,
      },
    });
    
    if (!response.ok) {
      console.error(`Privy balance API error: ${response.status} ${response.statusText}`);
      return 0;
    }
    
    const data = await response.json();
    
    if (data.balances && data.balances.length > 0) {
      // Get the first balance and return USD value if available, otherwise use native asset value
      const balance = data.balances[0];
      if (balance.display_values?.usd) {
        return parseFloat(balance.display_values.usd);
      }
      // Fallback to native asset value if USD not available
      if (balance.display_values && Object.values(balance.display_values).length > 0) {
        const nativeValue = Object.values(balance.display_values)[0];
        return typeof nativeValue === 'string' ? parseFloat(nativeValue) : 0;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error fetching wallet balance from Privy:', error);
    return 0;
  }
}

export default function WalletBalance() {
  const { user, authenticated, ready } = usePrivy();
  const [walletAssets, setWalletAssets] = useState<WalletAsset[]>([]);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<WalletAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const walletsLoadedRef = useRef<string | null>(null);

  const loadWallets = useCallback(async () => {
    try {
      setIsLoading(true);
      let wallets: BackendWallet[] = [];

      // Try localStorage first
      const walletsJson = localStorage.getItem('cto_user_wallets');
      if (walletsJson) {
        try {
          wallets = JSON.parse(walletsJson);
        } catch (parseError) {
          console.error('Failed to parse wallets from localStorage:', parseError);
        }
      }

      // If no wallets in localStorage, fetch from backend
      if (wallets.length === 0) {
        const token = localStorage.getItem('cto_auth_token');
        const userId = localStorage.getItem('cto_user_id');
        
        if (token && userId) {
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
            wallets = response.data.wallets;
            localStorage.setItem('cto_user_wallets', JSON.stringify(wallets));
          }
        }
      }

      // Combine with Privy wallets
      const privyWallets = user?.linkedAccounts?.filter(
        (account) => account.type === 'wallet'
      ) as PrivyWalletAccount[] || [];
      
      const displayWallets = wallets.length > 0 ? wallets : privyWallets;
      
      // Deduplicate wallets
      const uniqueWallets = displayWallets.filter((wallet, index, self) => 
        index === self.findIndex((w) => w.address.toLowerCase() === wallet.address.toLowerCase())
      );

      // Add Movement wallet if not already in list
      const movementWallet = user ? getMovementWallet(user as PrivyUser) : null;
      if (movementWallet && !uniqueWallets.some(w => 
        w.address.toLowerCase() === movementWallet.address.toLowerCase()
      )) {
        uniqueWallets.push({
          address: movementWallet.address,
          chainType: 'aptos',
          blockchain: 'MOVEMENT',
        } as BackendWallet);
      }

      // Fetch balances for all wallets
      const assetsWithBalances = await Promise.all(
        uniqueWallets.map(async (wallet) => {
          const { chainType, blockchain } = getWalletChainInfo(wallet);
          const chainName = getChainDisplayName(chainType, blockchain);
          const chainImage = getChainImage(chainType, blockchain);
          const balance = await fetchWalletBalance(wallet);
          
          return {
            name: chainName,
            value: balance,
            logo: chainImage,
            address: wallet.address,
            chainType: chainType || blockchain || '',
          };
        })
      );

      setWalletAssets(assetsWithBalances);
      if (assetsWithBalances.length > 0) {
        setSelectedAsset(assetsWithBalances[0]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load wallets:', error);
      setIsLoading(false);
    }
  }, [user]);

  // Load wallets
  useEffect(() => {
    if (authenticated && user && ready) {
      const userId = user.id;
      if (walletsLoadedRef.current !== userId) {
        loadWallets();
        walletsLoadedRef.current = userId;
      }
    }
  }, [authenticated, user, ready, loadWallets]);

  // Calculate wallet balance from selected asset
  const walletBalance = selectedAsset?.value || 0;
  return (
    <div className="rounded-lg border-[0.5px] border-white/20 p-5">
      {/* Wallet Balance Header */}
      <div className="bg-white/6 rounded-lg py-3 px-2.5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="text-sm text-[#A1A1AA] flex items-center gap-2.5">
              <Wallet size={18} /> Wallet Balance:
            </div>
          </div>
          <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex w-full justify-center mb-4">
          {isLoading ? (
            <div className="text-white/50 text-sm">Loading wallets...</div>
          ) : walletAssets.length === 0 ? (
            <div className="text-white/50 text-sm">No wallets found</div>
          ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="border-[0.5px] border-[#27272A] rounded-lg py-2 px-1 text-white/50 flex items-center gap-2">
                  {selectedAsset?.logo ? (
                  <div className="relative w-4 h-4">
                    <Image
                      src={selectedAsset.logo}
                      alt={selectedAsset.name}
                      fill
                      className="object-contain rounded-full"
                      loading="lazy"
                    />
                  </div>
                  ) : (
                    selectedAsset && (
                      <div className="w-4 h-4 flex items-center justify-center text-xs">
                        {selectedAsset.name.charAt(0)}
                      </div>
                    )
                  )}
                  {selectedAsset?.name || 'Select Wallet'} <ChevronDown size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#010101] text-white border-[0.5px] border-[#27272A] min-w-[200px]">
                {walletAssets.map((asset, index) => (
                <DropdownMenuItem
                  key={index}
                    onClick={() => setSelectedAsset(asset)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/10 focus:bg-white/10"
                >
                  {asset.logo ? (
                    <div className="relative w-6 h-6">
                      <Image
                        src={asset.logo}
                        alt={asset.name}
                        fill
                        className="object-contain rounded-full"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 flex items-center justify-center text-xs">
                      {asset.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-white font-medium flex-1">{asset.name}</span>
                  <span className="text-white/70 text-sm">
                      ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>

        {/* Balance Display */}
        <div className="mb-6">
          {balanceVisible ? (
            <div className="flex justify-center gap-2">
              <span className="text-[58px] font-semibold text-white">
                ${walletBalance.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="text-4xl font-bold text-white text-center">
              ••••••
            </div>
          )}
        </div>

        <div className="flex justify-center items-center">
          <span
            className={`flex font-medium items-center text-xs text-[#16C784]`}
          >
            <ChevronUp
              size={16}
              stroke="false"
              className="border-none p-0 -mb-0.5"
              fill="#16C784"
            />
            <span className="font-medium">6.00%</span>

            <span className="text-xs text-[#16C784]">
              ($1,5960,324)
            </span>
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Button className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] flex-1 h-12 py-3.5 px-6 rounded-full">
          {" "}
          <MoveDown /> Deposit
        </Button>
        <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-full flex-1">
          <Button className="bg-[#010101] h-12 w-full py-3.5 px-6 rounded-full text-white border-none">
            {" "}
            <MoveUp /> Withdraw
          </Button>
        </div>
        <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-full">
          <Button className="bg-[#010101] size-12 rounded-full text-white border-none">
            {" "}
            <ArrowUpDown />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      {/* <div className="flex gap-3 mb-6">
        <Button className="flex-1 cta-gradient text-white">
          Deposit
        </Button>
        <Button className="flex-1 cta-gradient text-white">
          Withdraw
        </Button>
        <Button className="flex-1 cta-gradient text-white">
          Transfer
        </Button>
      </div> */}

      {/* Asset Breakdown */}
      {/* <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-400">Assets</h3>
        {assets.map((asset, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src={asset.logo}
                  alt={asset.name}
                  fill
                  className="object-contain"
                  loading="lazy"
                />
              </div>
              <span className="text-white font-medium">
                {asset.name}
              </span>
            </div>
            <span className="text-white font-semibold">
              ${asset.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div> */}
    </div>
  );
}

