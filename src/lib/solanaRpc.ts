/**
 * Solana JSON-RPC URL for browser code. Next.js only inlines `NEXT_PUBLIC_*`;
 * `REACT_APP_*` is kept as a fallback for parity with CRA-style env files.
 */
export function getDefaultSolanaRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ||
    "https://api.mainnet-beta.solana.com"
  );
}

