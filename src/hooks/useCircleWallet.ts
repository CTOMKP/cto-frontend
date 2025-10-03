// Circle wallet hook
import { useState, useEffect, useCallback } from 'react';
import { CircleWallet, WalletBalance, Transaction } from '../core/circle-types';
import { circleWalletService } from '../services/circle-wallet';

export const useCircleWallet = (userId?: string) => {
  const [walletState, setWalletState] = useState<{
    wallet: CircleWallet | null;
    balances: WalletBalance[];
    isLoading: boolean;
    error: string | null;
  }>({
    wallet: null,
    balances: [],
    isLoading: false,
    error: null,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  const loadWalletAndBalances = useCallback(async () => {
    if (!userId) return;

    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if user already has a wallet
      const wallets = await circleWalletService.getUserWallets(userId);
      
      if (wallets && wallets.length > 0) {
        const wallet = wallets[0]; // Use first wallet
        const balances = await circleWalletService.getWalletBalances(wallet.id, userId);
        
        setWalletState({
          wallet,
          balances,
          isLoading: false,
          error: null,
        });
      } else {
        // No wallet exists yet
        setWalletState({
          wallet: null,
          balances: [],
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load wallet';
      setWalletState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    }
  }, [userId]);

  // Load wallet and balances when userId changes
  useEffect(() => {
    if (userId) {
      loadWalletAndBalances();
    }
  }, [userId, loadWalletAndBalances]);

  const createWallet = useCallback(async (userId: string, userEmail: string, description?: string) => {
    if (!userId) {
      throw new Error('User ID is required to create wallet');
    }

    try {
      setIsCreatingWallet(true);
      setWalletState(prev => ({ ...prev, error: null }));
      
      // Create wallet via Circle API (includes PIN setup)
      const wallet = await circleWalletService.createWallet(userId, userEmail, description);

      // Get initial balances
      const balances = await circleWalletService.getWalletBalances(wallet.id, userId);

      setWalletState({
        wallet,
        balances,
        isLoading: false,
        error: null,
      });

      return wallet;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create wallet';
      setWalletState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setIsCreatingWallet(false);
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!walletState.wallet) return;

    try {
      setWalletState(prev => ({ ...prev, isLoading: true }));
      
      const balances = await circleWalletService.getWalletBalances(walletState.wallet.id, userId);

      setWalletState(prev => ({ ...prev, balances, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh balances';
      setWalletState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    }
  }, [walletState.wallet, userId]);

  // Transaction history will be implemented later
  const loadTransactionHistory = useCallback(async () => {
    if (!walletState.wallet) return;
    // For now, just set empty transactions
    setTransactions([]);
  }, [walletState.wallet]);

  const clearError = useCallback(() => {
    setWalletState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...walletState,
    transactions,
    isCreatingWallet,
    createWallet,
    refreshBalances,
    loadTransactionHistory,
    clearError,
  };
};

