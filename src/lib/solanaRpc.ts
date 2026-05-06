/**
 * Solana JSON-RPC URL for browser code. Next.js only inlines `NEXT_PUBLIC_*`;
 * `REACT_APP_*` is kept as a fallback for parity with CRA-style env files.
 */
export function getDefaultSolanaRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ||
    process.env.REACT_APP_SOLANA_RPC_URL?.trim() ||
    "https://api.mainnet-beta.solana.com"
  );
}

/** WebSocket URL for Privy `rpcSubscriptions`; derived from HTTP if unset. */
export function getDefaultSolanaRpcWsUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SOLANA_RPC_WS_URL?.trim();
  if (explicit) return explicit;
  const http = getDefaultSolanaRpcUrl();
  if (/^https:/i.test(http)) return http.replace(/^https:/i, "wss:");
  if (/^http:/i.test(http)) return http.replace(/^http:/i, "ws:");
  return http;
}
