import { useState, useEffect, useRef, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { WALLET_ID_KEY } from "@/lib/authSession";
import { movementWalletService } from "@/services/movementWalletService";
import { getTokenLogo } from "./utils";
import { WalletAsset } from "./types";
import { useResolvedMovementWallet } from "@/hooks/useResolvedMovementWallet";
import { isApiError } from "@/lib/apiError";

export function useWalletBalance() {
  const { user, authenticated, ready } = usePrivy();
  const movementWalletQuery = useResolvedMovementWallet({ preferStorage: true });
  const resolvedMovementWallet = movementWalletQuery.data?.movementWallet ?? null;
  const resolvedWalletId = movementWalletQuery.data?.walletId ?? null;
  const [walletAssets, setWalletAssets] = useState<WalletAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<WalletAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const walletsLoadedRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Simple retry helper with exponential backoff
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    retries = maxRetries,
    delay = 1000
  ): Promise<T> => {
    try {
      retryCountRef.current = 0;
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      
      // Check if it's a network error
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
  };

  const loadWallets = useCallback(async () => {
    try {
      setIsLoading(true);
      retryCountRef.current = 0;
    const walletId = resolvedWalletId;
    if (walletId) {
      localStorage.setItem(WALLET_ID_KEY, walletId);
    }
    setActiveWalletId(walletId ?? null);

    // Start with empty array - we'll add MOVE and USDC separately
    const assetsWithBalances: WalletAsset[] = [];

    // Get Movement wallet for fetching balances (like test frontend)
    const movementWalletForBalances = resolvedMovementWallet;

    if (!movementWalletForBalances) {
      setIsLoading(false);
      return;
    }

    // STEP 2: Use the wallet ID to fetch balances (like test frontend loadData function)
    if (walletId) {
      try {
        const balances = await retryWithBackoff(() =>
          movementWalletService.getBalance(walletId)
        );

        // Find MOVE balance (EXACTLY like test frontend line 254)
        const moveBalance = balances.find(
          (b) => b.tokenSymbol === "MOVE"
        );

        if (moveBalance) {
          // Calculate MOVE value (EXACTLY like test frontend lines 289-291)
          const moveRaw = parseFloat(moveBalance.balance);
          const moveValue =
            moveRaw / Math.pow(10, moveBalance.decimals);

          // Add MOVE to assets array
          assetsWithBalances.push({
            name: "MOVE",
            value: moveValue,
            logo: getTokenLogo("MOVE"),
            address: movementWalletForBalances.address,
            chainType: "aptos",
          });
        }

        // Find USDC balance (EXACTLY like test frontend line 279)
        // Prioritize USDC.e balance for display (like test frontend)
        const usdcBalance = balances.find(
          (b) =>
            b.tokenSymbol?.toUpperCase() === "USDC.E" ||
            b.tokenSymbol?.toUpperCase() === "USDC" ||
            b.tokenSymbol === "USDC.e" ||
            b.tokenAddress?.toLowerCase() ===
              "0xb89077cfd2a82a0c1450534d49cfd5f2707643155273069bc23a912bcfefdee7"
        );

        if (usdcBalance) {
          // Calculate USDC value (EXACTLY like test frontend lines 285-287)
          const usdcRaw = parseFloat(usdcBalance.balance);
          const usdcValue = usdcRaw / Math.pow(10, usdcBalance.decimals);

          // Add USDC to assets array
          assetsWithBalances.push({
            name: "USDC",
            value: usdcValue,
            logo: getTokenLogo("USDC"),
            address: movementWalletForBalances.address,
            chainType: "aptos",
          });
        }
      } catch (balanceError) {
        // Error handling without console logs
      }
    }

    // Sort wallets to put MOVE first, then USDC, then others
    const sortedAssets = [...assetsWithBalances].sort((a, b) => {
      // MOVE comes first
      if (a.name === "MOVE" && b.name !== "MOVE") return -1;
      if (a.name !== "MOVE" && b.name === "MOVE") return 1;

      // USDC comes second
      if (a.name === "USDC" && b.name !== "USDC" && b.name !== "MOVE")
        return -1;
      if (a.name !== "USDC" && a.name !== "MOVE" && b.name === "USDC")
        return 1;

      return 0; // Keep original order for other wallets
    });

    setWalletAssets(sortedAssets);
    if (sortedAssets.length > 0) {
      setSelectedAsset(sortedAssets[0]);
    }
    setIsLoading(false);
  } catch {
    setIsLoading(false);
  }
}, [resolvedMovementWallet, resolvedWalletId]);

  // Listen for online/offline events and retry when network comes back
  useEffect(() => {
    const handleOnline = () => {
      if (authenticated && user && ready && retryCountRef.current > 0) {
        // Network came back, retry loading wallets
        loadWallets();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [authenticated, user, ready, loadWallets]);

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

  // Periodically update balances
  useEffect(() => {
    if (!activeWalletId) return;

    const intervalId = setInterval(() => {
      updateBalances();
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [activeWalletId]);

  // Function to update balances
  const updateBalances = useCallback(async () => {
    if (!activeWalletId) return;

    try {
      const movementWalletForBalances = resolvedMovementWallet;

      if (!movementWalletForBalances) return;

      const balances = await retryWithBackoff(() =>
        movementWalletService.getBalance(activeWalletId)
      );
      const assetsWithBalances: WalletAsset[] = [];

      // Find MOVE balance
      const moveBalance = balances.find(
        (b) => b.tokenSymbol === "MOVE"
      );

      if (moveBalance) {
        const moveRaw = parseFloat(moveBalance.balance);
        const moveValue = moveRaw / Math.pow(10, moveBalance.decimals);

        assetsWithBalances.push({
          name: "MOVE",
          value: moveValue,
          logo: getTokenLogo("MOVE"),
          address: movementWalletForBalances.address,
          chainType: "aptos",
        });
      }

      // Find USDC balance
      const usdcBalance = balances.find(
        (b) =>
          b.tokenSymbol?.toUpperCase() === "USDC.E" ||
          b.tokenSymbol?.toUpperCase() === "USDC" ||
          b.tokenSymbol === "USDC.e" ||
          b.tokenAddress?.toLowerCase() ===
            "0xb89077cfd2a82a0c1450534d49cfd5f2707643155273069bc23a912bcfefdee7"
      );

      if (usdcBalance) {
        const usdcRaw = parseFloat(usdcBalance.balance);
        const usdcValue = usdcRaw / Math.pow(10, usdcBalance.decimals);

        assetsWithBalances.push({
          name: "USDC",
          value: usdcValue,
          logo: getTokenLogo("USDC"),
          address: movementWalletForBalances.address,
          chainType: "aptos",
        });
      }

      // Sort assets
      const sortedAssets = [...assetsWithBalances].sort((a, b) => {
        // MOVE comes first
        if (a.name === "MOVE" && b.name !== "MOVE") return -1;
        if (a.name !== "MOVE" && b.name === "MOVE") return 1;

        // USDC comes second
        if (a.name === "USDC" && b.name !== "USDC" && b.name !== "MOVE")
          return -1;
        if (a.name !== "USDC" && a.name !== "MOVE" && b.name === "USDC")
          return 1;

        return 0; // Keep original order for other wallets
      });

      setWalletAssets(sortedAssets);
    } catch {
      // Error handling without console logs
    }
  }, [activeWalletId, resolvedMovementWallet]);

  return {
    walletAssets,
    selectedAsset,
    setSelectedAsset,
    isLoading,
  };
}