export interface WalletAsset {
  /** Stable key for selection (e.g. solana:SOL, movement:USDC). */
  id: string;
  name: string;
  /** Shown next to symbol in dropdown when two assets share the same name (e.g. USDC). */
  networkLabel?: string;
  value: number;
  logo?: string | null;
  address: string;
  chainType: string;
  /** Small chain corner badge (listings table style); used for USDC rows. */
  chainBadge?: string;
}
