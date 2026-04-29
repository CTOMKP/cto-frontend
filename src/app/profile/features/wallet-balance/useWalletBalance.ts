import { useState, useEffect, useRef, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { PrivyUser, BackendWallet } from "@/types/privy";
import { getAuthToken, getUserId, WALLET_ID_KEY } from "@/lib/authSession";
import { getMovementWallet } from "@/lib/movement-wallet";
import { movementWalletService } from "@/services/movementWalletService";
import { getTokenLogo } from "./utils";
import { WalletAsset } from "./types";

export function useWalletBalance() {
  const { user, authenticated, ready } = usePrivy();
  const [walletAssets, setWalletAssets] = useState<WalletAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<WalletAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [isAutoRecovering, setIsAutoRecovering] = useState(false);
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
      const isNetworkError = 
        axios.isAxiosError(error) && 
        (!error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK');
      
      if (isNetworkError) {
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

      const findAndSetWallet = async () => {
        const userId = getUserId() || user?.id;
        const token = getAuthToken();

        // GUARD: Don't run if already recovering or if we already have an active wallet
        if (!userId || isAutoRecovering) {
          return null; // Return null to indicate no wallet ID was found
        }

        try {
          const API_BASE =
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            "https://api.ctomarketplace.com";

          const response = await retryWithBackoff(() =>
            axios.get(
              `${API_BASE}/api/v1/auth/privy/wallets`,
              {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
              }
            )
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
                w.address.toLowerCase() ===
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
            localStorage.setItem(WALLET_ID_KEY, moveWallet.id);
            return moveWallet.id; 
          } else {
            // setIsAutoRecovering(true);

            // try {
            //   const syncResponse = await axios.post(
            //     `${API_BASE}/api/v1/auth/privy/sync-wallets`,
            //     {},
            //     {
            //       headers: {
            //         Authorization: `Bearer ${token}`,
            //         "Content-Type": "application/json",
            //       },
            //     }
            //   );

            //   // Re-fetch once after sync
            //   const retryResponse = await axios.get(
            //     `${API_BASE}/api/v1/auth/privy/wallets`,
            //     {
            //       headers: { Authorization: `Bearer ${token}` },
            //     }
            //   );

            //   const retryData =
            //     retryResponse.data?.data?.wallets ||
            //     retryResponse.data?.wallets ||
            //     [];

            //   const recoveredWallet = retryData.find(
            //     (w: any) =>
            //       w.blockchain === "MOVEMENT" || w.blockchain === "APTOS"
            //   );

            //   if (recoveredWallet) {
            //     localStorage.setItem("cto_wallet_id", recoveredWallet.id);
            //     return recoveredWallet.id; // Return the wallet ID for immediate use
            //   }
            //   // Reset recovery state so it can try again later if needed,
            //   // but dependencies should prevent loop.
            //   setIsAutoRecovering(false);
            //   return null; // Return null if no wallet was found
            // } catch (err) {
            //   setIsAutoRecovering(false);
            //   return null; // Return null on error
            // }
          }
        } catch (err) {
          setIsAutoRecovering(false);
          return null; // Return null on error
        }
      };

    const walletId = await findAndSetWallet();
    setActiveWalletId(walletId);

    // Start with empty array - we'll add MOVE and USDC separately
    const assetsWithBalances: WalletAsset[] = [];

    // Get Movement wallet for fetching balances (like test frontend)
    const movementWalletForBalances = user
      ? getMovementWallet(user as PrivyUser)
      : null;

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
  } catch (error) {
    setIsLoading(false);
  }
}, [user, isAutoRecovering]);

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
      const movementWalletForBalances = user
        ? getMovementWallet(user as PrivyUser)
        : null;

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
    } catch (error) {
      // Error handling without console logs
    }
  }, [activeWalletId, user]);

  return {
    walletAssets,
    selectedAsset,
    setSelectedAsset,
    isLoading,
  };
}