/**
 * Movement Network wallet utilities using Privy
 * Based on reference implementation from Movement-Network-ConnectWallet-Template
 */

import {
  useSignRawHash,
} from "@privy-io/react-auth/extended-chains";
import { toHex } from "viem";
import { PrivyUser, CreateWalletFunction, PrivyWalletAccount, isPrivyWalletAccount, SignableHash } from '@/types/privy';

/**
 * Create a Movement wallet using Privy
 * Movement wallets are created with chainType: 'aptos' (Aptos-compatible)
 * @param privyUser - The authenticated Privy user
 * @param createWallet - The createWallet function from useCreateWallet hook
 */
export async function createMovementWallet(privyUser: PrivyUser, createWallet: CreateWalletFunction): Promise<PrivyWalletAccount> {
  try {

    // First check if user already has a Movement wallet
    // Movement wallets are detected as chainType === 'aptos'
    const existingWallet = privyUser.linkedAccounts?.find(
      (account): account is PrivyWalletAccount => isPrivyWalletAccount(account) && account.chainType === 'aptos'
    );
    
    if (existingWallet) {
      return existingWallet;
    }

    // Create Movement wallet using Privy
    // Movement Network uses Aptos-compatible wallet format
    const wallet = await createWallet({
      chainType: 'aptos',
    });
    
    return wallet;
  } catch (error) {
    console.error('Error creating Movement wallet:', error);
    throw error;
  }
}

/**
 * Hook to sign transactions using Privy for Movement Network
 */
export function useSignWithPrivy() {
  const { signRawHash } = useSignRawHash();

  const signHash = async (walletAddress: string, hash: SignableHash) => {
    try {

      const { signature: rawSignature } = await signRawHash({
        address: walletAddress,
        chainType: "aptos", // Movement uses Aptos-compatible signing
        hash: toHex(hash),
      });

      return {
        data: {
          signature: rawSignature
        }
      };
    } catch (error) {
      console.error('Error signing with Privy:', error);
      throw error;
    }
  };

  return { signHash };
}

/**
 * Get Movement wallet from Privy user
 */
export function getMovementWallet(privyUser: PrivyUser): PrivyWalletAccount | null {
  if (!privyUser?.linkedAccounts) {
    return null;
  }

  // Movement wallets are detected as chainType === 'aptos'
  const movement = privyUser.linkedAccounts.find(
    (account): account is PrivyWalletAccount => isPrivyWalletAccount(account) && account.chainType === 'aptos'
  );

  return movement ?? null;
}

