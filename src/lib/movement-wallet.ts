/**
 * Movement Network wallet utilities using Privy
 * Based on reference implementation from Movement-Network-ConnectWallet-Template
 */

import {
  useSignRawHash,
} from "@privy-io/react-auth/extended-chains";
import type { CurveSigningChainType } from "@privy-io/api-types";
import { toHex } from "viem";
import { SignableHash } from '@/types/privy';
import {
  Aptos,
  AptosConfig,
  Network,
  AccountAddress,
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction,
} from "@aptos-labs/ts-sdk";

// Types for Privy's signRawHash function
interface SignRawHashInput {
  address: string;
  chainType: CurveSigningChainType;
  hash: `0x${string}`;
}

interface SignRawHashOutput {
  signature: `0x${string}`;
}

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

/**
 * Send a Movement transaction using Aptos SDK and Privy signing
 * @param transactionData - Transaction data from backend (Aptos format)
 * @param walletAddress - The Movement wallet address
 * @param publicKey - The wallet's public key
 * @param signRawHash - Privy's signRawHash function
 * @returns Transaction hash
 */
export async function sendMovementTransaction(
  transactionData: {
    type: string;
    function: string;
    type_arguments: string[];
    arguments: string[];
  },
  walletAddress: string,
  publicKey: string,
  signRawHash: (input: SignRawHashInput) => Promise<SignRawHashOutput>
): Promise<string> {
  try {
    // Initialize Movement client (uses Movement Bardock testnet)
    const movementConfig = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: process.env.NEXT_PUBLIC_MOVEMENT_NODE_URL || 'https://testnet.movementnetwork.xyz/v1',
    });
    const movement = new Aptos(movementConfig);

    // Convert address to AccountAddress
    const senderAddress = AccountAddress.from(walletAddress);

    // Build the transaction
    const functionArguments = transactionData.arguments.map((arg) => arg);

    // Validate function format (should be "module::module::function")
    if (!transactionData.function.includes('::') || transactionData.function.split('::').length !== 3) {
      throw new Error(`Invalid function format: ${transactionData.function}. Expected format: "module::module::function"`);
    }

    const functionName = transactionData.function as `${string}::${string}::${string}`;

    // Handle transfer function overrides
    let finalFunctionName = functionName;
    if (functionName === "0x1::coin::transfer") {
      finalFunctionName = "0x1::aptos_account::transfer_coins";
    }

    const rawTxn = await movement.transaction.build.simple({
      sender: senderAddress,
      data: {
        function: finalFunctionName,
        typeArguments: transactionData.type_arguments,
        functionArguments: functionArguments,
      },
      options: {
        maxGasAmount: 50000,
      }
    });

    // Generate signing message
    const message = generateSigningMessageForTransaction(rawTxn);

    // Sign with Privy
    const { signature } = await signRawHash({
      address: walletAddress,
      chainType: 'aptos' as CurveSigningChainType,
      hash: toHex(message) as `0x${string}`,
    });

    // Create authenticator
    let cleanPublicKey = publicKey.replace('0x', '');
    
    // Some keys come with a leading 00 for ed25519 representation
    if (cleanPublicKey.length === 66 && cleanPublicKey.startsWith('00')) {
      cleanPublicKey = cleanPublicKey.substring(2);
    }

    if (cleanPublicKey.length !== 64) {
      throw new Error(`Invalid public key length: expected 64 hex characters (32 bytes), got ${cleanPublicKey.length}`);
    }

    const publicKeyBytes = Buffer.from(cleanPublicKey, 'hex');
    const signatureBytes = Buffer.from(signature.replace('0x', ''), 'hex');

    const senderAuthenticator = new AccountAuthenticatorEd25519(
      new Ed25519PublicKey(publicKeyBytes),
      new Ed25519Signature(signatureBytes)
    );

    // Submit transaction
    const pendingTxn = await movement.transaction.submit.simple({
      transaction: rawTxn,
      senderAuthenticator,
    });

    // Wait for transaction
    const executedTxn = await movement.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    if (!executedTxn.success) {
      throw new Error(`Transaction failed: ${executedTxn.vm_status}`);
    }

    return pendingTxn.hash;
  } catch (error) {
    console.error('Error sending Movement transaction:', error);
    throw error;
  }
}
