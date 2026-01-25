"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { movementWalletService, type WalletTransaction } from '@/services/movementWalletService';
import { usePrivy } from '@privy-io/react-auth';
import { getMovementWallet } from '@/lib/movement-wallet';
import { BackendWallet } from '@/types/privy';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserListings from './UserListings';
import TxHistoryTab from './TxHistoryTab';

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
          <div></div>
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