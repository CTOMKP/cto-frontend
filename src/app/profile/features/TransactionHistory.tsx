"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import {
  movementWalletService,
  type WalletTransaction,
} from "@/services/movementWalletService";
import solanaWalletService from "@/services/solanaWalletService";
import { toast } from "react-toastify";
import { WALLET_ID_KEY } from "@/lib/authSession";
import walletsService, {
  findSolanaWalletIdForAddress,
} from "@/services/walletsService";
import { resolvePrivySolanaAddress } from "@/lib/solanaTransaction";
import { useSessionStore } from "@/lib/sessionStore";
import type { BackendWallet } from "@/types/privy";
import UserListings from "./UserListings";
import TxHistoryTab, { type HistoryTxRow } from "./TxHistoryTab";
import MyAdsTab from "./MyAdsTab";
import { useResolvedMovementWallet } from "@/hooks/useResolvedMovementWallet";

const HISTORY_LIMIT = 100;

function mergeHistoryRows(
  movement: WalletTransaction[],
  solana: WalletTransaction[],
  limit: number,
): HistoryTxRow[] {
  const merged: HistoryTxRow[] = [
    ...movement.map((tx) => ({ ...tx, sourceChain: "movement" as const })),
    ...solana.map((tx) => ({ ...tx, sourceChain: "solana" as const })),
  ];
  const seen = new Set<string>();
  return merged
    .filter((tx) => {
      const k = `${tx.sourceChain}:${tx.txHash}:${tx.createdAt}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

export default function TransactionHistory() {
  const { user, authenticated, ready } = usePrivy();
  const sessionUserId = useSessionStore((s) => s.userId);
  const token = useSessionStore((s) => s.token);
  const { wallets } = useWallets();
  const { wallets: solanaScopedWallets } = useSolanaWallets();

  const movementWalletQuery = useResolvedMovementWallet({ preferStorage: false });
  const [transactions, setTransactions] = useState<HistoryTxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMovementWalletId, setActiveMovementWalletId] = useState<
    string | null
  >(null);
  const [syncing, setSyncing] = useState(false);
  const [backendWallets, setBackendWallets] = useState<BackendWallet[]>([]);
  const initialPollDoneRef = useRef(false);

  const solanaLinkedAddress = useMemo(
    () =>
      resolvePrivySolanaAddress(
        wallets as unknown[],
        solanaScopedWallets as unknown[] | undefined,
      ),
    [wallets, solanaScopedWallets],
  );

  const solanaBackendWalletId = useMemo(() => {
    if (!solanaLinkedAddress) return null;
    return findSolanaWalletIdForAddress(backendWallets, solanaLinkedAddress);
  }, [backendWallets, solanaLinkedAddress]);

  /** Authenticated `/auth/privy/wallets` — needed to map Privy Solana address → backend wallet id for tx APIs. */
  useEffect(() => {
    if (!authenticated || !ready || !user || !token) {
      setBackendWallets([]);
      return;
    }
    let cancelled = false;
    void walletsService
      .listPrivyWallets({
        userId: sessionUserId || user.id,
        preferStorage: false,
      })
      .then((w) => {
        if (!cancelled) setBackendWallets(w);
      })
      .catch(() => {
        if (!cancelled) setBackendWallets([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authenticated, ready, user?.id, sessionUserId, token]);

  useEffect(() => {
    if (!authenticated || !token) {
      initialPollDoneRef.current = false;
      setActiveMovementWalletId(null);
      setTransactions([]);
      setLoading(false);
      return;
    }
    if (movementWalletQuery.isError) {
      toast.error("Failed to resolve wallet context");
      setLoading(false);
      return;
    }
    const walletId = movementWalletQuery.data?.walletId ?? null;
    if (walletId) {
      localStorage.setItem(WALLET_ID_KEY, walletId);
      setActiveMovementWalletId(walletId);
      return;
    }
    if (!movementWalletQuery.isPending) {
      setActiveMovementWalletId(null);
    }
  }, [
    authenticated,
    token,
    movementWalletQuery.data?.walletId,
    movementWalletQuery.isError,
    movementWalletQuery.isPending,
  ]);

  const loadTransactions = useCallback(async () => {
    const movementId = activeMovementWalletId;
    const solId = solanaBackendWalletId;

    if (!movementId && !solId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [movTxs, solTxs] = await Promise.all([
        movementId
          ? movementWalletService.getTransactions(movementId, 50)
          : Promise.resolve<WalletTransaction[]>([]),
        solId
          ? solanaWalletService.getTransactions(solId, 50)
          : Promise.resolve<WalletTransaction[]>([]),
      ]);
      setTransactions(mergeHistoryRows(movTxs, solTxs, HISTORY_LIMIT));
    } catch {
      toast.error("Could not load transaction history.");
    } finally {
      setLoading(false);
    }
  }, [activeMovementWalletId, solanaBackendWalletId]);

  useEffect(() => {
    if (!authenticated || !token) return;
    void loadTransactions();
  }, [
    authenticated,
    token,
    activeMovementWalletId,
    solanaBackendWalletId,
    loadTransactions,
  ]);

  const handleSync = useCallback(
    async (silent = false) => {
      if (!activeMovementWalletId && !solanaBackendWalletId) return;

      setSyncing(true);
      let loadingToastId: number | string | null = null;

      try {
        if (!silent) {
          loadingToastId = toast.loading("Syncing wallets…");
        }

        if (activeMovementWalletId) {
          await movementWalletService.pollTransactions(activeMovementWalletId);
        }
        if (solanaBackendWalletId && solanaLinkedAddress) {
          await solanaWalletService.pollTransactions(
            solanaBackendWalletId,
            50,
            solanaLinkedAddress,
          );
        }

        await loadTransactions();

        if (!silent) {
          if (loadingToastId) toast.dismiss(loadingToastId);
          toast.success("Wallet history synced");
        }
      } catch (error) {
        console.error("Sync failed:", error);
        if (!silent) {
          if (loadingToastId) toast.dismiss(loadingToastId);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          toast.error(`Sync failed: ${errorMessage}`);
        }
      } finally {
        setSyncing(false);
      }
    },
    [
      activeMovementWalletId,
      solanaBackendWalletId,
      solanaLinkedAddress,
      loadTransactions,
    ],
  );

  useEffect(() => {
    if (!authenticated || !token) return;
    if (!activeMovementWalletId && !solanaBackendWalletId) return;
    if (initialPollDoneRef.current) return;
    initialPollDoneRef.current = true;
    void handleSync(true);
  }, [
    authenticated,
    token,
    activeMovementWalletId,
    solanaBackendWalletId,
    handleSync,
  ]);

  useEffect(() => {
    if (!authenticated || !token) return;
    if (!activeMovementWalletId && !solanaBackendWalletId) return;

    const intervalId = setInterval(() => {
      void handleSync(true);
    }, 60_000);

    return () => clearInterval(intervalId);
  }, [
    authenticated,
    token,
    activeMovementWalletId,
    solanaBackendWalletId,
    handleSync,
  ]);

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
            onSync={() => {
              void handleSync(false);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
