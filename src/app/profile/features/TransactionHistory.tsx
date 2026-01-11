"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SquareArrowOutUpRight } from 'lucide-react';
import { movementWalletService, WalletTransaction } from '@/services/movementWalletService';
import { usePrivy } from '@privy-io/react-auth';
import { getMovementWallet } from '@/lib/movement-wallet';
import { BackendWallet } from '@/types/privy';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function TransactionHistory() {
  const { user } = usePrivy();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Find and set wallet ID using same pattern as useWalletBalance.ts
  useEffect(() => {
    const findAndSetWallet = async () => {
      const userId = localStorage.getItem("cto_user_id") || user?.id;
      const token = localStorage.getItem("cto_auth_token");

      // GUARD: Don't run if already recovering or if we already have an active wallet
      if (!userId) {
        return null; // Return null to indicate no wallet ID was found
      }

      try {
        const API_BASE =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://api.ctomarketplace.com";

        const response = await axios.get(
          `${API_BASE}/api/v1/auth/privy/wallets`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Handle nested response from TransformInterceptor
        const walletsData =
          response.data?.data?.wallets || response.data?.wallets || [];

        // STRATEGIC FIX: Prioritize wallet that matches current Privy account
        const privyMoveWallet = getMovementWallet(user);
        let moveWallet = null;

        if (privyMoveWallet) {
          moveWallet = walletsData.find(
            (w: BackendWallet) =>
              w.address?.toLowerCase() ===
              privyMoveWallet.address.toLowerCase()
          );
        }

        // Fallback to any Movement wallet if no match found
        if (!moveWallet) {
          moveWallet = walletsData.find(
            (w: BackendWallet) =>
              w.blockchain === "MOVEMENT" || w.blockchain === "APTOS"
          );
        }

        if (moveWallet) {
          localStorage.setItem("cto_wallet_id", moveWallet.id);
          return moveWallet.id; 
        }
      } catch (err) {
        toast.error("Failed to set wallet ID");
        console.error(err);
      }
      
      return null; // Return null if no wallet was found
    };

    // Call function and set activeWalletId with the returned value
    findAndSetWallet().then(walletId => {
      if (walletId) {
        setActiveWalletId(walletId);
      } else {
        setLoading(false);
      }
    });
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
      // Error handling without console logs
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

  // Sync transactions with Movement blockchain
  const handleSync = async (silent = false) => {
    if (!activeWalletId) return;
    
    setSyncing(true);
    try {
      if (!silent) {
        toast.loading('Syncing with Movement blockchain...');
      }
      
      // 1. Poll for new transactions (Detect funding/payments)
      await movementWalletService.pollTransactions(activeWalletId);
      
      // 2. Refresh local data
      await loadTransactions();
      
      if (!silent) {
        toast.success('Wallet synced successfully');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      if (!silent) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error('Sync failed: ' + errorMessage);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Set up periodic background sync
  useEffect(() => {
    if (!activeWalletId) return;

    const intervalId = setInterval(() => {
      handleSync(true);
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [activeWalletId]);

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
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <button
              onClick={() => handleSync(false)}
              disabled={syncing}
              className="text-xs px-3 py-1 rounded-lg bg-[#17171C] text-white hover:bg-[#2A2A2E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-t border-white"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Sync
                </>
              )}
            </button>
          </div>
          
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