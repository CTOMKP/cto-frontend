"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SquareArrowOutUpRight } from 'lucide-react';
import { movementWalletService, WalletTransaction } from '@/services/movementWalletService';
import { usePrivy } from '@privy-io/react-auth';
import { getMovementWallet } from '@/lib/movement-wallet';
import { PrivyUser } from '@/types/privy';
import axios from 'axios';
import { BackendWallet } from '@/types/privy';

export default function TransactionHistory() {
  const { user } = usePrivy();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);

  // Find and set wallet ID (EXACTLY like test frontend MovementWalletActivity.tsx)
  useEffect(() => {
    const findAndSetWallet = async () => {
      // STEP 1: Check localStorage first (like test frontend line 77)
      let walletId: string | null = localStorage.getItem('cto_wallet_id');

      if (!walletId) {
        // STEP 2: If not in localStorage, fetch from API (like test frontend lines 49-76)
        const movementWallet = user ? getMovementWallet(user as PrivyUser) : null;
        if (!movementWallet) {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('cto_auth_token');
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';
        
        try {
          const response = await axios.get(
            `${backendUrl}/api/v1/auth/privy/wallets`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          // Handle nested response from TransformInterceptor (like test frontend line 55)
          const walletsData = response.data?.data?.wallets || response.data?.wallets || [];

          // Prioritize the wallet that matches the current Privy account (like test frontend lines 58-65)
          let moveWallet = walletsData.find(
            (w: BackendWallet) =>
              w.address?.toLowerCase() === movementWallet.address.toLowerCase() &&
              (w.blockchain === 'MOVEMENT' ||
                w.blockchain === 'APTOS' ||
                w.chainType?.toLowerCase() === 'aptos' ||
                w.chainType?.toLowerCase() === 'movement')
          );

          // Fallback to any Movement wallet if no match found (like test frontend lines 68-72)
          if (!moveWallet) {
            moveWallet = walletsData.find(
              (w: BackendWallet) =>
                w.blockchain === 'MOVEMENT' || w.blockchain === 'APTOS'
            );
          }

          if (moveWallet?.id) {
            walletId = moveWallet.id;
            // Store wallet ID in localStorage (like test frontend line 77)
            localStorage.setItem('cto_wallet_id', moveWallet.id);
            console.log('✅ Found Movement wallet directly:', moveWallet.id);
          }
        } catch (error) {
          console.error('❌ Direct wallet fetch failed', error);
        }
      }

      if (walletId) {
        setActiveWalletId(walletId);
      } else {
        setLoading(false);
      }
    };

    findAndSetWallet();
  }, [user]);

  // Load transactions (EXACTLY like test frontend loadData function)
  const loadTransactions = useCallback(async () => {
    if (!activeWalletId) return;
    
    try {
      setLoading(true);
      // Fetch transactions (like test frontend line 131)
      const txData = await movementWalletService.getTransactions(activeWalletId, 50); // Get more transactions for history
      setTransactions(txData);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [activeWalletId]);

  // Load transactions when wallet ID is available (like test frontend line 256-262)
  useEffect(() => {
    if (activeWalletId) {
      loadTransactions();
    }
  }, [activeWalletId, loadTransactions]);

  // Format transaction amount (EXACTLY like test frontend lines 452-459)
  const formatTransactionAmount = (tx: WalletTransaction): string => {
    const isUSDC = tx.tokenSymbol?.toLowerCase().includes('usdc');
    const divisor = isUSDC ? 1000000 : 100000000;
    const decimals = isUSDC ? 2 : 2;
    const amount = parseFloat(tx.amount) / divisor;
    const symbol = isUSDC ? 'USDC' : 'MOVE';
    return `${amount.toFixed(decimals)} ${symbol}`;
  };

  // Format transaction value in USDC (for display in Value column)
  const formatTransactionValue = (tx: WalletTransaction): string => {
    const isUSDC = tx.tokenSymbol?.toLowerCase().includes('usdc');
    if (isUSDC) {
      const amount = parseFloat(tx.amount) / 1000000;
      return `$${amount.toFixed(2)}`;
    }
    // For MOVE, we could calculate USD value if we had price data
    // For now, just show the MOVE amount
    const amount = parseFloat(tx.amount) / 100000000;
    return `${amount.toFixed(2)} MOVE`;
  };

  // Format address (truncate with ellipses)
  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="mt-10">
      <Tabs defaultValue="tx-history" className="w-full">
        <TabsList className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF]/20 rounded-lg items-center px-1 w-fit bg-transparent">
          <TabsTrigger
            value="holdings"
            className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
          >
            Holdings
          </TabsTrigger>
          <TabsTrigger
            value="tx-history"
            className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
          >
            Tx history
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
          >
            Orders
          </TabsTrigger>
        </TabsList>
        <div className="border-t-[0.5px] border-white/20 mt-4"></div>
        
        <TabsContent value="tx-history">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-white/20 rounded-full"></div>
                <div className="h-2 w-2 bg-white/20 rounded-full"></div>
                <div className="h-2 w-2 bg-white/20 rounded-full"></div>
              </div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-left">
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Timestamp</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Value (USDC)</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Amount</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Type</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-4">Address</th>
                    <th className="text-xs font-bold text-white/50 py-2 pr-0 text-right">Hash ID</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="bg-white/2">
                      <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                        {formatTransactionValue(tx)}
                      </td>
                      <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                        {formatTransactionAmount(tx)}
                      </td>
                      <td className="text-xs font-medium py-3 pr-4 whitespace-nowrap">
                        <span className={tx.txType === 'CREDIT' ? 'text-[#16C784]' : 'text-[#C71624]'}>
                          {tx.txType === 'CREDIT' ? 'Deposit' : tx.txType === 'DEBIT' ? 'Withdraw' : 'Transfer'}
                        </span>
                      </td>
                      <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                        {formatAddress(tx.txHash)}
                      </td>
                      <td className="text-xs font-medium text-white py-3 pr-0 whitespace-nowrap text-right">
                        <a 
                          href={`https://explorer.movementnetwork.xyz/txn/${tx.txHash}?network=bardock+testnet`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-white/80 hover:text-white"
                        >
                          <SquareArrowOutUpRight size={16} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-white/50 italic">No transactions detected yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="holdings">
          <div></div>
        </TabsContent>
        
        <TabsContent value="orders">
          <div></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

