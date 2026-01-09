export interface WalletAsset {
  name: string;
  value: number;
  logo?: string | null;
  address: string;
  chainType: string;
}
