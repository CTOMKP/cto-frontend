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
  const [movementTransactions, setMovementTransactions] = useState<WalletTransaction[]>([]);
  const [solanaTransactions, setSolanaTransactions] = useState<WalletTransaction[]>([]);
  const [movementLoading, setMovementLoading] = useState(true);
  const [solanaLoading, setSolanaLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState<"solana" | "movement">("solana");
  const [activeMovementWalletId, setActiveMovementWalletId] = useState<
    string | null
  >(null);
  const [syncing, setSyncing] = useState(false);
  const [backendWallets, setBackendWallets] = useState<BackendWallet[]>([]);
  const initialSyncKeyRef = useRef<string | null>(null);

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
        // Prefer cached wallets first so Solana walletId resolves immediately on page load.
        preferStorage: true,
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
      initialSyncKeyRef.current = null;
      setActiveMovementWalletId(null);
      setMovementTransactions([]);
      setSolanaTransactions([]);
      setMovementLoading(false);
      setSolanaLoading(false);
      return;
    }
    if (movementWalletQuery.isError) {
      toast.error("Failed to resolve wallet context");
      setMovementLoading(false);
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

  const loadMovementTransactions = useCallback(async () => {
    const movementId = activeMovementWalletId;
    if (!movementId) {
      setMovementTransactions([]);
      setMovementLoading(false);
      return;
    }

    try {
      setMovementLoading(true);
      const txs = await movementWalletService.getTransactions(movementId, 50);
      setMovementTransactions(txs);
    } catch {
      toast.error("Could not load Movement transaction history.");
    } finally {
      setMovementLoading(false);
    }
  }, [activeMovementWalletId]);

  const loadSolanaTransactions = useCallback(async () => {
    const solId = solanaBackendWalletId;
    if (!solId) {
      setSolanaTransactions([]);
      setSolanaLoading(false);
      return;
    }

    try {
      setSolanaLoading(true);
      const txs = await solanaWalletService.getTransactions(solId, 50);
      setSolanaTransactions(txs);
    } catch {
      toast.error("Could not load Solana transaction history.");
    } finally {
      setSolanaLoading(false);
    }
  }, [solanaBackendWalletId]);

  useEffect(() => {
    if (selectedChain === "solana" && !solanaBackendWalletId && activeMovementWalletId) {
      setSelectedChain("movement");
      return;
    }
    if (selectedChain === "movement" && !activeMovementWalletId && solanaBackendWalletId) {
      setSelectedChain("solana");
    }
  }, [selectedChain, solanaBackendWalletId, activeMovementWalletId]);

  useEffect(() => {
    if (!authenticated || !token) return;
    void loadMovementTransactions();
  }, [authenticated, token, activeMovementWalletId, loadMovementTransactions]);

  useEffect(() => {
    if (!authenticated || !token) return;
    void loadSolanaTransactions();
  }, [
    authenticated,
    token,
    solanaBackendWalletId,
    loadSolanaTransactions,
  ]);

  const handleSync = useCallback(
    async (silent = false, chain: "solana" | "movement" = selectedChain) => {
      if (!activeMovementWalletId && !solanaBackendWalletId) return;

      setSyncing(true);
      let loadingToastId: number | string | null = null;

      try {
        if (!silent) {
          loadingToastId = toast.loading("Syncing wallets…");
        }

        if (chain === "movement" && activeMovementWalletId) {
          await movementWalletService.pollTransactions(activeMovementWalletId);
        }
        if (chain === "solana" && solanaBackendWalletId && solanaLinkedAddress) {
          await solanaWalletService.pollTransactions(
            solanaBackendWalletId,
            50,
            solanaLinkedAddress,
          );
        }

        if (chain === "movement") {
          await loadMovementTransactions();
        } else {
          await loadSolanaTransactions();
        }

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
      selectedChain,
      loadMovementTransactions,
      loadSolanaTransactions,
    ],
  );

  useEffect(() => {
    if (!authenticated || !token) return;
    if (!activeMovementWalletId && !solanaBackendWalletId) return;

    // Run one initial silent sync per wallet-context combination.
    const syncKey = `${selectedChain}:${activeMovementWalletId ?? "none"}:${solanaBackendWalletId ?? "none"}:${solanaLinkedAddress ?? "none"}`;
    if (initialSyncKeyRef.current === syncKey) return;
    initialSyncKeyRef.current = syncKey;

    void handleSync(true);
  }, [
    authenticated,
    token,
    activeMovementWalletId,
    solanaBackendWalletId,
    solanaLinkedAddress,
    selectedChain,
    handleSync,
  ]);

  const transactions = useMemo(
    () => mergeHistoryRows(movementTransactions, solanaTransactions, HISTORY_LIMIT),
    [movementTransactions, solanaTransactions],
  );
  const displayedTransactions = useMemo(
    () => transactions.filter((tx) => tx.sourceChain === selectedChain),
    [transactions, selectedChain],
  );
  const loading = movementLoading || solanaLoading;

  useEffect(() => {
    if (!authenticated || !token) return;
    if (!activeMovementWalletId && !solanaBackendWalletId) return;

    const intervalId = setInterval(() => {
      void handleSync(true, selectedChain);
    }, 60_000);

    return () => clearInterval(intervalId);
  }, [
    authenticated,
    token,
    activeMovementWalletId,
    solanaBackendWalletId,
    selectedChain,
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
            transactions={displayedTransactions}
            loading={loading}
            syncing={syncing}
            selectedChain={selectedChain}
            hasSolana={!!solanaBackendWalletId}
            hasMovement={!!activeMovementWalletId}
            onSelectChain={setSelectedChain}
            debugWalletMapping={{
              solanaLinkedAddress,
              solanaBackendWalletId,
              movementWalletId: activeMovementWalletId,
            }}
            onSync={() => {
              void handleSync(false, selectedChain);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
