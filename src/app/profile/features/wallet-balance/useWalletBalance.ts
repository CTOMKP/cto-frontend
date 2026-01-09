import { useState, useEffect, useRef, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { BackendWallet, PrivyWalletAccount, PrivyUser } from "@/types/privy";
import { getMovementWallet } from "@/lib/movement-wallet";
import { movementWalletService } from "@/services/movementWalletService";
import { getWalletChainInfo, getTokenLogo } from "./utils";
import { WalletAsset } from "./types";

export function useWalletBalance() {
  const { user, authenticated, ready } = usePrivy();
  const [walletAssets, setWalletAssets] = useState<WalletAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<WalletAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const walletsLoadedRef = useRef<string | null>(null);

  const loadWallets = useCallback(async () => {
    try {
      setIsLoading(true);
      let wallets: BackendWallet[] = [];

      // Try localStorage first
      const walletsJson = localStorage.getItem("cto_user_wallets");
      if (walletsJson) {
        try {
          wallets = JSON.parse(walletsJson);
        } catch (parseError) {
          console.error(
            "Failed to parse wallets from localStorage:",
            parseError
          );
        }
      }

      // If no wallets in localStorage, fetch from backend
      if (wallets.length === 0) {
        const token = localStorage.getItem("cto_auth_token");
        const userId = localStorage.getItem("cto_user_id");

        if (token && userId) {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
          const response = await axios.get(
            `${backendUrl}/api/auth/privy/wallets`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.success && response.data.wallets) {
            wallets = response.data.wallets;
            localStorage.setItem("cto_user_wallets", JSON.stringify(wallets));
          }
        }
      }

      // Combine with Privy wallets
      const privyWallets =
        (user?.linkedAccounts?.filter(
          (account) => account.type === "wallet"
        ) as PrivyWalletAccount[]) || [];

      const displayWallets = wallets.length > 0 ? wallets : privyWallets;

      // Deduplicate wallets
      const uniqueWallets = displayWallets.filter(
        (wallet, index, self) =>
          index ===
          self.findIndex(
            (w) => w.address.toLowerCase() === wallet.address.toLowerCase()
          )
      );

      // Add Movement wallet if not already in list
      const movementWallet = user ? getMovementWallet(user as PrivyUser) : null;
      if (
        movementWallet &&
        !uniqueWallets.some(
          (w) =>
            w.address.toLowerCase() === movementWallet.address.toLowerCase()
        )
      ) {
        uniqueWallets.push({
          address: movementWallet.address,
          chainType: "aptos",
          blockchain: "MOVEMENT",
        } as BackendWallet);
      }

      // Hide all wallets except Movement/Aptos - just filter them out
      const movementWallets = uniqueWallets.filter((wallet) => {
        const { chainType, blockchain } = getWalletChainInfo(wallet);
        const isMovementWallet =
          chainType?.toLowerCase() === "aptos" ||
          blockchain?.toUpperCase() === "MOVEMENT" ||
          blockchain?.toUpperCase() === "APTOS";
        return isMovementWallet;
      });

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

      try {
        // Get wallet ID from backend (EXACTLY like test frontend MovementWalletActivity.tsx)
        // STEP 1: Check localStorage first (like test frontend line 77)
        let walletId: string | null = localStorage.getItem("cto_wallet_id");

        // STEP 2: If not in localStorage, fetch from API (like test frontend lines 49-76)
        if (!walletId) {
          const token = localStorage.getItem("cto_auth_token");
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';
          
          try {
            const response = await axios.get(
              `${backendUrl}/api/v1/auth/privy/wallets`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            // Handle nested response from TransformInterceptor (like test frontend line 55)
            const walletsData = response.data?.data?.wallets || response.data?.wallets || [];

            // Prioritize the wallet that matches the current Privy account (like test frontend lines 58-65)
            let moveWallet = walletsData.find(
              (w: BackendWallet) =>
                w.address?.toLowerCase() ===
                  movementWalletForBalances.address.toLowerCase() &&
                (w.blockchain === "MOVEMENT" ||
                  w.blockchain === "APTOS" ||
                  w.chainType?.toLowerCase() === "aptos" ||
                  w.chainType?.toLowerCase() === "movement")
            );

            // Fallback to any Movement wallet if no match found (like test frontend lines 68-72)
            if (!moveWallet) {
              moveWallet = walletsData.find(
                (w: BackendWallet) =>
                  w.blockchain === "MOVEMENT" || w.blockchain === "APTOS"
              );
            }

            if (moveWallet?.id) {
              walletId = moveWallet.id;
              // Store wallet ID in localStorage (like test frontend line 77)
              localStorage.setItem("cto_wallet_id", moveWallet.id);
              console.log("✅ Found Movement wallet directly:", moveWallet.id);
            } else {
              // Auto-recovery sync if wallet not found (like test frontend lines 79-114)
              console.warn(
                "⚠️ No Movement wallet found. Attempting AUTO-RECOVERY sync..."
              );
              try {
                const syncResponse = await axios.post(
                  `${backendUrl}/api/v1/auth/privy/sync-wallets`,
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                console.log("🔄 Auto-Recovery Sync Result:", syncResponse.data);

                // Re-fetch once after sync (like test frontend lines 94-98)
                const retryResponse = await axios.get(
                  `${backendUrl}/api/v1/auth/privy/wallets`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                const retryWallets =
                  retryResponse.data?.data?.wallets ||
                  retryResponse.data?.wallets ||
                  [];

                const recoveredWallet = retryWallets.find(
                  (w: BackendWallet) =>
                    w.blockchain === "MOVEMENT" || w.blockchain === "APTOS"
                );

                if (recoveredWallet?.id) {
                  walletId = recoveredWallet.id;
                  localStorage.setItem("cto_wallet_id", recoveredWallet.id);
                  console.log("✅ Auto-Recovery SUCCESS:", recoveredWallet.id);
                } else {
                  console.warn(
                    "❌ Auto-Recovery failed to find Movement wallet."
                  );
                }
              } catch (syncError) {
                console.error("❌ Auto-Recovery sync failed:", syncError);
              }
            }
          } catch (error) {
            console.error("❌ Direct wallet fetch failed", error);
          }
        }

        // STEP 3: Use the wallet ID to fetch balances (like test frontend loadData function)
        if (walletId) {
          try {
            // Sync balance first to ensure it's up to date (like test frontend handleSync)
            try {
              await movementWalletService.syncBalance(walletId, true); // testnet = true
            } catch (syncError) {
              console.warn(
                "Failed to sync Movement wallet balance:",
                syncError
              );
              // Continue to getBalance even if sync fails
            }

            // Get balance from backend (EXACTLY like test frontend line 130)
            const balances = await movementWalletService.getBalance(walletId);

            console.log("📊 Movement Wallet All Balances:", {
              walletId,
              address: movementWalletForBalances.address,
              balances: balances.map((b) => ({
                tokenSymbol: b.tokenSymbol,
                tokenAddress: b.tokenAddress,
                balance: b.balance,
                decimals: b.decimals,
                balanceValue:
                  parseFloat(b.balance) / Math.pow(10, b.decimals),
              })),
            });

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

              console.log("✅ Added MOVE to assets:", moveValue);
            } else {
              console.log("⚠️ MOVE balance not found");
              console.log(
                "📋 Available token symbols:",
                balances.map((b) => b.tokenSymbol)
              );
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

              console.log("✅ Added USDC to assets:", usdcValue);
            } else {
              console.log("⚠️ USDC balance not found");
              console.log(
                "📋 Available token symbols:",
                balances.map((b) => b.tokenSymbol)
              );
            }

            // Fetch and log transactions for Movement wallet (like test frontend line 131)
            try {
              const transactions =
                await movementWalletService.getTransactions(walletId, 10);
              console.log("📊 Movement Wallet Transactions:", {
                walletId,
                address: movementWalletForBalances.address,
                transactionCount: transactions.length,
                transactions: transactions,
              });
            } catch (txError) {
              console.error(
                "Failed to fetch Movement wallet transactions:",
                txError
              );
            }
          } catch (balanceError) {
            console.error("Failed to fetch balances:", balanceError);
          }
        } else {
          console.warn(
            "Movement wallet ID not found for balance calculation"
          );
        }
      } catch (error) {
        console.error("Failed to fetch Movement wallet balances:", error);
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
      console.error("Failed to load wallets:", error);
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

  return {
    walletAssets,
    selectedAsset,
    setSelectedAsset,
    isLoading,
  };
}
