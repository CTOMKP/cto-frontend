/**
 * TypeScript types for Privy authentication and wallet data
 * Based on runtime data structures from console logs
 */

/**
 * Privy Linked Account - Wallet type
 * Based on Privy's actual types, id can be null/undefined
 */
export interface PrivyWalletAccount {
  id: string | null | undefined;
  address: string;
  type: 'wallet';
  chainType: 'ethereum' | 'solana' | 'aptos' | 'base' | 'polygon' | string;
  connectorType: 'embedded' | string;
  delegated: boolean;
  firstVerifiedAt: Date;
  latestVerifiedAt: Date;
  publicKey: string | null;
  recoveryMethod: 'privy-v2' | string;
  walletClientType: 'privy' | string;
  walletIndex: number;
  imported: boolean;
}

/**
 * Privy Linked Account - OAuth type
 */
export interface PrivyOAuthAccount {
  subject: string;
  email: string;
  name: string;
  type: 'google_oauth' | string;
  firstVerifiedAt: Date;
  latestVerifiedAt: Date;
}

/**
 * Union type for all Privy linked accounts
 */
export type PrivyLinkedAccount = PrivyWalletAccount | PrivyOAuthAccount;

/**
 * Type guard to check if account is a wallet account
 */
export function isPrivyWalletAccount(account: PrivyLinkedAccount): account is PrivyWalletAccount {
  return account.type === 'wallet';
}

/**
 * Privy User type (partial, based on what we use)
 */
export interface PrivyUser {
  id: string;
  email?: {
    address: string;
  };
  wallet?: {
    address: string;
  };
  linkedAccounts?: PrivyLinkedAccount[];
}

/**
 * CreateWallet function type from Privy's useCreateWallet hook
 * Privy's createWallet can accept CreateWalletOptions or MouseEvent (for button clicks)
 * We use a more flexible type to match Privy's actual implementation
 * Note: This type is not used directly - we use 'any' in the actual implementation to match test frontend
 */
export type CreateWalletFunction = (options?: { chainType: string } | MouseEvent | undefined) => Promise<PrivyWalletAccount>;

/**
 * Hash type for signing (can be Uint8Array, string, or Buffer)
 */
export type SignableHash = Uint8Array | string | Buffer;

/**
 * Backend wallet type (from API response)
 */
export interface BackendWallet {
  id?: string;
  address: string;
  blockchain?: 'ETHEREUM' | 'SOLANA' | 'APTOS' | 'BASE' | 'POLYGON' | 'MOVEMENT' | string;
  chainType?: 'ethereum' | 'solana' | 'aptos' | 'base' | 'polygon' | 'movement' | string;
  [key: string]: unknown; // Allow additional properties from backend
}

