export type AppSolanaNetwork = "devnet" | "mainnet-beta";

export function getSolanaNetwork(): AppSolanaNetwork {
  const value = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet").trim().toLowerCase();
  return value === "mainnet" || value === "mainnet-beta" ? "mainnet-beta" : "devnet";
}

export function getDefaultSolanaChainId(): "solana:devnet" | "solana:mainnet" {
  return getSolanaNetwork() === "mainnet-beta" ? "solana:mainnet" : "solana:devnet";
}

/**
 * Browser RPC is used for wallet UI and signing only. Keep paid/private RPC keys
 * on the backend; payment broadcasting is routed through the authenticated API.
 */
export function getSolanaRpcUrl(network: AppSolanaNetwork): string {
  if (network === "mainnet-beta") {
    return process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL?.trim()
      || process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim()
      || "https://api.mainnet-beta.solana.com";
  }
  return process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL?.trim()
    || process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim()
    || "https://api.devnet.solana.com";
}

export function getDefaultSolanaRpcUrl(): string {
  return getSolanaRpcUrl(getSolanaNetwork());
}

