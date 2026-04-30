"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { movementWalletService, type WalletTransaction } from '@/services/movementWalletService';
import { toast } from 'react-toastify';
import { WALLET_ID_KEY } from '@/lib/authSession';
import UserListings from './UserListings';
import TxHistoryTab from './TxHistoryTab';
import MyAdsTab from './MyAdsTab';
import { useResolvedMovementWallet } from '@/hooks/useResolvedMovementWallet';

export default function TransactionHistory() {
  const movementWalletQuery = useResolvedMovementWallet({ preferStorage: true });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Use shared movement wallet resolution path.
  useEffect(() => {
    if (movementWalletQuery.isError) {
      toast.error("Failed to resolve wallet context");
      setLoading(false);
      return;
    }
    const walletId = movementWalletQuery.data?.walletId ?? null;
    if (walletId) {
      localStorage.setItem(WALLET_ID_KEY, walletId);
      setActiveWalletId(walletId);
      return;
    }
    if (!movementWalletQuery.isPending) {
      setActiveWalletId(null);
      setLoading(false);
    }
  }, [
    movementWalletQuery.data?.walletId,
    movementWalletQuery.isError,
    movementWalletQuery.isPending,
  ]);

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
    let loadingToastId: number | string | null = null;
    
    try {
      if (!silent) {
        loadingToastId = toast.loading('Syncing with Movement blockchain...');
      }
      
      // 1. Poll for new transactions (Detect funding/payments)
      await movementWalletService.pollTransactions(activeWalletId);
      
      // 2. Refresh local data
      await loadTransactions();
      
      if (!silent) {
        if (loadingToastId) {
          toast.dismiss(loadingToastId);
        }
        toast.success('Wallet synced successfully');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      if (!silent) {
        if (loadingToastId) {
          toast.dismiss(loadingToastId);
        }
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

  return (
    <div className="mt-10">
      <Tabs defaultValue="my-listings" className="w-full">
        <TabsList className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF]/20 rounded-lg items-center px-1 w-fit bg-transparent">
          <TabsTrigger
            value="my-listings"
            className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
          >
            My Listings
          </TabsTrigger>
          <TabsTrigger
            value="my-ads"
            className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
          >
            My ads
          </TabsTrigger>
          <TabsTrigger
            value="tx-history"
            className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
          >
            Tx history
          </TabsTrigger>
        </TabsList>
        <div className="border-t-[0.5px] border-white/20 mt-4"></div>
        
        <TabsContent value="my-listings">
          <UserListings />
        </TabsContent>
        
        <TabsContent value="my-ads">
          <MyAdsTab />
        </TabsContent>

        <TabsContent value="tx-history">
          <TxHistoryTab
            transactions={transactions}
            loading={loading}
            syncing={syncing}
            onSync={() => handleSync(false)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}