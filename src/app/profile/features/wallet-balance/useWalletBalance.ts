import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import { WALLET_ID_KEY } from "@/lib/authSession";
import { movementWalletService } from "@/services/movementWalletService";
import { solanaWalletService } from "@/services/solanaWalletService";
import { resolvePrivySolanaAddress } from "@/lib/solanaTransaction";
import { getTokenLogo } from "./utils";
import { WalletAsset } from "./types";
import { useResolvedMovementWallet } from "@/hooks/useResolvedMovementWallet";
import { isApiError } from "@/lib/apiError";

/** Solana assets (SOL, USDC) first, then Movement (MOVE, USDC). */
function sortWalletAssets(a: WalletAsset, b: WalletAsset): number {
  const order: Record<string, number> = {
    "solana:SOL": 0,
    "solana:USDC": 1,
    "movement:MOVE": 2,
    "movement:USDC": 3,
  };
  return (order[a.id] ?? 99) - (order[b.id] ?? 99);
}

/** Default row: native SOL on Solana when that wallet exists, else first sorted asset. */
function defaultSelectedAsset(assets: WalletAsset[]): WalletAsset | null {
  if (!assets.length) return null;
  return assets.find((a) => a.id === "solana:SOL") ?? assets[0];
}

export function useWalletBalance() {
  const { user, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const { wallets: solanaScopedWallets } = useSolanaWallets();
  const solanaLinkedAddress = useMemo(
    () => resolvePrivySolanaAddress(wallets as unknown[], solanaScopedWallets as unknown[] | undefined),
    [wallets, solanaScopedWallets],
  );

  const refreshSolanaBalance = useCallback(async () => {
    const addr = resolvePrivySolanaAddress(wallets as unknown[], solanaScopedWallets as unknown[] | undefined);
    if (!addr) {
      console.info(
        "[SOL balance] Skipped — no Solana wallet in this Privy session (link Solana in Privy or try again after wallets load).",
      );
      return;
    }
    try {
      await solanaWalletService.getBalance(addr);
    } catch {
      /* failure logged in solanaWalletService.getBalance */
    }
  }, [wallets, solanaScopedWallets]);
  const movementWalletQuery = useResolvedMovementWallet({ preferStorage: false });
  const resolvedMovementWallet = movementWalletQuery.data?.movementWallet ?? null;
  const resolvedWalletId = movementWalletQuery.data?.walletId ?? null;
  const [walletAssets, setWalletAssets] = useState<WalletAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<WalletAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const walletsLoadedRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const retryWithBackoff = useCallback(async <T,>(
    fn: () => Promise<T>,
    retries = maxRetries,
    delay = 1000
  ): Promise<T> => {
    try {
      retryCountRef.current = 0;
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;

      const isRetryableApiError =
        isApiError(error) &&
        (error.status === 408 || error.status === 429 || error.status >= 500);

      if (isRetryableApiError) {
        retryCountRef.current++;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }, []);

  const loadSolanaAssets = useCallback(async (address: string): Promise<WalletAsset[]> => {
    const out: WalletAsset[] = [];
    try {
      const payload = await solanaWalletService.getBalance(address);
      const sol = typeof payload.sol === "number" ? payload.sol : Number(payload.sol || 0);
      const usdc = typeof payload.usdc === "number" ? payload.usdc : Number(payload.usdc || 0);
      const solVal = Number.isFinite(sol) ? sol : 0;
      const usdcVal = Number.isFinite(usdc) ? usdc : 0;

      out.push({
        id: "solana:SOL",
        name: "SOL",
        networkLabel: "Solana",
        value: solVal,
        logo: getTokenLogo("SOL"),
        address,
        chainType: "solana",
      });
      out.push({
        id: "solana:USDC",
        name: "USDC",
        networkLabel: "Solana",
        value: usdcVal,
        logo: getTokenLogo("USDC"),
        address,
        chainType: "solana",
        chainBadge: "solana",
      });
    } catch {
      /* logged in service */
    }
    return out;
  }, []);

  const loadMovementAssets = useCallback(
    async (walletId: string, movementWalletForBalances: NonNullable<typeof resolvedMovementWallet>): Promise<WalletAsset[]> => {
      const out: WalletAsset[] = [];
      try {
        const balances = await retryWithBackoff(() => movementWalletService.getBalance(walletId));

        const moveBalance = balances.find((b) => b.tokenSymbol === "MOVE");
        if (moveBalance) {
          const moveRaw = parseFloat(moveBalance.balance);
          const moveValue = moveRaw / Math.pow(10, moveBalance.decimals);
          out.push({
            id: "movement:MOVE",
            name: "MOVE",
            networkLabel: "Movement",
            value: moveValue,
            logo: getTokenLogo("MOVE"),
            address: movementWalletForBalances.address,
            chainType: "aptos",
          });
        }

        const usdcBalance = balances.find(
          (b) =>
            b.tokenSymbol?.toUpperCase() === "USDC.E" ||
            b.tokenSymbol?.toUpperCase() === "USDC" ||
            b.tokenSymbol === "USDC.e" ||
            b.tokenAddress?.toLowerCase() ===
              "0xb89077cfd2a82a0c1450534d49cfd5f2707643155273069bc23a912bcfefdee7",
        );
        if (usdcBalance) {
          const usdcRaw = parseFloat(usdcBalance.balance);
          const usdcValue = usdcRaw / Math.pow(10, usdcBalance.decimals);
          out.push({
            id: "movement:USDC",
            name: "USDC",
            networkLabel: "Movement",
            value: usdcValue,
            logo: getTokenLogo("USDC"),
            address: movementWalletForBalances.address,
            chainType: "aptos",
            chainBadge: "movement",
          });
        }
      } catch {
        /* movement errors handled silently like before */
      }
      return out;
    },
    [retryWithBackoff],
  );

  const loadWallets = useCallback(async () => {
    try {
      setIsLoading(true);
      retryCountRef.current = 0;
      const walletId = resolvedWalletId;
      if (walletId) {
        localStorage.setItem(WALLET_ID_KEY, walletId);
      }
      setActiveWalletId(walletId ?? null);

      const combined: WalletAsset[] = [];

      if (solanaLinkedAddress) {
        const solAssets = await loadSolanaAssets(solanaLinkedAddress);
        combined.push(...solAssets);
      }

      const movementWalletForBalances = resolvedMovementWallet;
      if (movementWalletForBalances && walletId) {
        const movAssets = await loadMovementAssets(walletId, movementWalletForBalances);
        combined.push(...movAssets);
      }

      const sortedAssets = [...combined].sort(sortWalletAssets);

      setWalletAssets(sortedAssets);
      // Full load: always land on Solana SOL when available (do not keep prior MOVE selection).
      setSelectedAsset(defaultSelectedAsset(sortedAssets));
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, [
    resolvedMovementWallet,
    resolvedWalletId,
    solanaLinkedAddress,
    loadSolanaAssets,
    loadMovementAssets,
  ]);

  useEffect(() => {
    const handleOnline = () => {
      if (authenticated && user && ready && retryCountRef.current > 0) {
        loadWallets();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [authenticated, user, ready, loadWallets]);

  useEffect(() => {
    if (authenticated && user && ready) {
      const loadKey = `${user.id}:${resolvedWalletId ?? "no-wallet-id"}:${solanaLinkedAddress ?? "no-sol"}`;
      if (walletsLoadedRef.current !== loadKey) {
        loadWallets();
        walletsLoadedRef.current = loadKey;
      }
    }
  }, [authenticated, user, ready, resolvedWalletId, solanaLinkedAddress, loadWallets]);

  const updateBalances = useCallback(async () => {
    try {
      const combined: WalletAsset[] = [];

      if (solanaLinkedAddress) {
        const solAssets = await loadSolanaAssets(solanaLinkedAddress);
        combined.push(...solAssets);
      }

      const movementWalletForBalances = resolvedMovementWallet;
      const walletId = activeWalletId;
      if (movementWalletForBalances && walletId) {
        const movAssets = await loadMovementAssets(walletId, movementWalletForBalances);
        combined.push(...movAssets);
      }

      const sortedAssets = [...combined].sort(sortWalletAssets);

      setWalletAssets(sortedAssets);
      setSelectedAsset((current) => {
        if (!sortedAssets.length) return null;
        if (!current) return defaultSelectedAsset(sortedAssets);
        const refreshedSelected = sortedAssets.find((asset) => asset.id === current.id);
        return refreshedSelected ?? defaultSelectedAsset(sortedAssets);
      });
    } catch {
      /* ignore */
    }
  }, [
    activeWalletId,
    resolvedMovementWallet,
    solanaLinkedAddress,
    loadSolanaAssets,
    loadMovementAssets,
  ]);

  useEffect(() => {
    if (!activeWalletId && !solanaLinkedAddress) return;

    const intervalId = setInterval(() => {
      void updateBalances();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [activeWalletId, solanaLinkedAddress, updateBalances]);

  return {
    walletAssets,
    selectedAsset,
    setSelectedAsset,
    isLoading,
    refreshSolanaBalance,
  };
}
