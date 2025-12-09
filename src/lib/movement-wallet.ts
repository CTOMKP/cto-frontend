/**
 * Movement Network wallet utilities using Privy
 * Based on reference implementation from Movement-Network-ConnectWallet-Template
 */

import {
  useSignRawHash,
} from "@privy-io/react-auth/extended-chains";
import { toHex } from "viem";
import { SignableHash } from '@/types/privy';

/**
 * Create a Movement wallet using Privy
 * Movement wallets are created with chainType: 'aptos' (Aptos-compatible)
 * NOTE: Privy may only allow one embedded wallet per user. If user already has an embedded wallet,
 * we cannot create another one. Movement wallets may need to be created through a different method.
 * @param privyUser - The authenticated Privy user
 * @param createWallet - The createWallet function from useCreateWallet hook
 * Using 'any' types to match test frontend implementation and avoid TypeScript issues with Privy's types
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function createMovementWallet(privyUser: any, createWallet: any) {
  try {
    // First check if user already has a Movement wallet
    // Movement wallets are detected as chainType === 'aptos'
    const existingWallet = privyUser.linkedAccounts?.find(
      (account: any) => account.type === 'wallet' && account.chainType === 'aptos'
    );
    
    if (existingWallet) {
      return {
        id: existingWallet.id,
        address: existingWallet.address,
        public_key: existingWallet.publicKey,
        chain_type: existingWallet.chainType
      };
    }

    // Create Movement wallet using Privy
    // Movement Network uses Aptos-compatible wallet format
    // Match test frontend: Just create, don't verify returned wallet's chainType
    // The Aptos wallet will appear in user.linkedAccounts after creation
    const wallet = await createWallet({
      chainType: 'aptos',
    });
    
    return wallet;
  } catch (error) {
    console.error('Error creating Movement wallet:', error);
    throw error;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
 * Using 'any' types to match test frontend implementation
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function getMovementWallet(privyUser: any) {
  if (!privyUser?.linkedAccounts) {
    return null;
  }

  // Movement wallets are detected as chainType === 'aptos'
  return privyUser.linkedAccounts.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'aptos'
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

