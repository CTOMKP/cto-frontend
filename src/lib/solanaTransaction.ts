import { Connection, Transaction, VersionedTransaction } from "@solana/web3.js";
import { getDefaultSolanaRpcUrl } from "@/lib/solanaRpc";

export type SolanaSignerWallet = {
  address: string;
  chainId?: string;
  chainType?: string;
  walletClientType?: string;
  /** SLIP-44: 501 = Solana */
  coinType?: number;
  signTransaction?: (tx: VersionedTransaction | Transaction) => Promise<VersionedTransaction | Transaction>;
  provider?: {
    signTransaction?: (tx: VersionedTransaction | Transaction) => Promise<VersionedTransaction | Transaction>;
  };
  walletClient?: {
    signTransaction?: (tx: VersionedTransaction | Transaction) => Promise<VersionedTransaction | Transaction>;
  };
};

function canSignSolanaWallet(w: SolanaSignerWallet): boolean {
  return (
    typeof w.signTransaction === "function" ||
    typeof w.provider?.signTransaction === "function" ||
    typeof w.walletClient?.signTransaction === "function"
  );
}

/**
 * cto-test-frontend `walletRouter`: if `useSolanaWallets()` is non-empty, that list is the
 * candidate set; otherwise `useWallets()`. Then try the other list as fallback (covers
 * MarketDashboard-style wallets that only appear on main).
 */
function privySolanaDualLists(
  mainWallets: unknown[] | undefined,
  solanaScopedWallets?: unknown[] | undefined | null,
): { primary: SolanaSignerWallet[]; alternate: SolanaSignerWallet[] } {
  const sol = Array.isArray(solanaScopedWallets) ? (solanaScopedWallets as SolanaSignerWallet[]) : [];
  const main = Array.isArray(mainWallets) ? (mainWallets as SolanaSignerWallet[]) : [];
  if (sol.length > 0) {
    return { primary: sol, alternate: main };
  }
  return { primary: main, alternate: sol };
}

/** walletRouter / MarketDashboard ordering: chainId before chainType before client/base58. */
const SOLANA_PAY_TIERS: Array<(w: SolanaSignerWallet) => boolean> = [
  (w) => w.chainId === "solana:mainnet" || w.chainId === "solana:devnet",
  (w) => w.chainType === "solana",
  (w) => w.walletClientType === "solana" || w.coinType === 501,
  (w) => {
    const a = String(w.address || "");
    return a.length >= 32 && a.length <= 44 && !a.startsWith("0x");
  },
];

function pickSolanaPayWalletFromList(list: SolanaSignerWallet[]): SolanaSignerWallet | null {
  for (const pred of SOLANA_PAY_TIERS) {
    for (const w of list) {
      if (!w?.address || !pred(w)) continue;
      if (canSignSolanaWallet(w)) return w;
    }
  }
  return null;
}

/**
 * Listing payment / marketplace ad Solana pay: same architecture as cto-test-frontend —
 * direct `signTransaction` only (no Privy modal hook). Uses walletRouter list preference
 * and chainId-first ordering.
 */
export function getPrivySolanaPayWallet(
  mainWallets: unknown[] | undefined,
  solanaScopedWallets?: unknown[] | undefined | null,
): SolanaSignerWallet | null {
  const { primary, alternate } = privySolanaDualLists(mainWallets, solanaScopedWallets);
  return pickSolanaPayWalletFromList(primary) || pickSolanaPayWalletFromList(alternate) || null;
}

/**
 * cto-test-frontend `MarketDashboard` / `ListingPayment`: only {@link useWallets} (no solana hook),
 * same candidate order and `signTransaction` | `provider.signTransaction` gate.
 */
export function getSolanaPayWalletLikeTestApp(mainWallets: unknown[] | undefined): SolanaSignerWallet | null {
  const wallets = Array.isArray(mainWallets) ? (mainWallets as SolanaSignerWallet[]) : [];
  const candidate =
    wallets.find((w) => (w as SolanaSignerWallet & { chainType?: string }).chainType === "solana") ||
    wallets.find((w) => w.chainId === "solana:mainnet" || w.chainId === "solana:devnet") ||
    wallets.find((w) => w.walletClientType === "solana" || w.coinType === 501) ||
    wallets.find((w) => {
      const addr = w.address || "";
      return addr.length >= 32 && addr.length <= 44 && !addr.startsWith("0x");
    });
  if (!candidate?.address) return null;
  const canSign =
    ("signTransaction" in candidate && typeof candidate.signTransaction === "function") ||
    typeof candidate.provider?.signTransaction === "function";
  return canSign ? candidate : null;
}

/**
 * Same source selection as cto-test reference: prefer wallets from
 * `@privy-io/react-auth/solana` when non-empty, else main `useWallets()` list.
 */
export function mergePrivyWalletListsForSolana(
  mainWallets: unknown[] | undefined,
  solanaScopedWallets: unknown[] | undefined | null,
): unknown[] {
  const sol = Array.isArray(solanaScopedWallets) ? solanaScopedWallets : [];
  const main = Array.isArray(mainWallets) ? mainWallets : [];
  return sol.length > 0 ? sol : main;
}

export function getPrivySolanaSignerWallet(wallets: unknown[]): SolanaSignerWallet | null {
  const list = Array.isArray(wallets) ? (wallets as SolanaSignerWallet[]) : [];
  for (const pred of SOLANA_PAY_TIERS) {
    for (const wallet of list) {
      if (!wallet?.address || !pred(wallet)) continue;
      if (canSignSolanaWallet(wallet)) return wallet;
    }
  }
  return null;
}

/**
 * Solana wallet entry for the current session (same pick order as swap router).
 * Use with `useSignTransaction` when the object does not expose `signTransaction`.
 */
export function getPrivySolanaSessionWallet(wallets: unknown[]): SolanaSignerWallet | null {
  const list = Array.isArray(wallets) ? (wallets as SolanaSignerWallet[]) : [];
  for (const pred of SOLANA_PAY_TIERS) {
    const w = list.find((x) => x?.address && pred(x));
    if (w) return w;
  }
  return null;
}

function pickSolanaAddressFromList(list: SolanaSignerWallet[]): string | null {
  for (const pred of SOLANA_PAY_TIERS) {
    const w = list.find((x) => x?.address && pred(x));
    if (w?.address) return w.address;
  }
  return null;
}

/**
 * Linked Solana address for balances / display. Same dual-list + tier order as pay wallet,
 * without requiring `signTransaction`.
 */
export function resolvePrivySolanaAddress(
  mainWallets: unknown[] | undefined,
  solanaScopedWallets?: unknown[] | undefined | null,
): string | null {
  const { primary, alternate } = privySolanaDualLists(mainWallets, solanaScopedWallets);
  return (
    pickSolanaAddressFromList(primary) ||
    pickSolanaAddressFromList(alternate) ||
    getPrivySolanaSignerWallet([...primary, ...alternate])?.address ||
    null
  );
}

/** Base64 wire tx from backend (same as cto-test-frontend `decodeBase64`). */
export function decodeSolanaTxBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function normalizeSignedTxToBytes(signedResult: unknown): Uint8Array | null {
  if (!signedResult) return null;
  if (signedResult instanceof Uint8Array) return signedResult;
  if (Array.isArray(signedResult)) return new Uint8Array(signedResult);
  if (typeof signedResult === "object") {
    const o = signedResult as Record<string, unknown>;
    const direct = o.signedTransaction;
    if (direct instanceof Uint8Array) return direct;
    if (Array.isArray(direct)) return new Uint8Array(direct);
    if (typeof direct === "string") {
      try {
        return decodeSolanaTxBase64(direct);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export type PrivySolanaSignTransaction = (arg: {
  transaction: Uint8Array;
  wallet: unknown;
  chain: string;
}) => Promise<unknown>;

/**
 * Embedded Privy Solana: sign with {@link useSignTransaction} from `@privy-io/react-auth/solana`
 * (wire bytes + `solana:devnet` | `solana:mainnet`), same as cto-test `SolanaWalletActivity`. Direct
 * `wallet.signTransaction(VersionedTransaction)` often shows the modal then fails ("Try again later").
 * Falls back to `wallet` / `provider` / `walletClient` signing for external wallets.
 */
export async function signAndBroadcastSolanaPayPreferPrivyHook(params: {
  unsignedTxBase64: string;
  wallet: SolanaSignerWallet;
  signTransactionHook: PrivySolanaSignTransaction;
  rpcUrl?: string;
}): Promise<string> {
  const { unsignedTxBase64, wallet, signTransactionHook, rpcUrl } = params;
  try {
    return await signAndBroadcastSolanaBase64TxWithPrivyHook({
      unsignedTxBase64,
      wallet,
      signTransaction: signTransactionHook,
      rpcUrl,
    });
  } catch (hookErr) {
    console.warn("[Solana pay] useSignTransaction failed, falling back to wallet.signTransaction", hookErr);
    return signAndBroadcastSolanaBase64Tx({ unsignedTxBase64, wallet, rpcUrl });
  }
}

export async function signAndBroadcastSolanaBase64TxWithPrivyHook(params: {
  unsignedTxBase64: string;
  wallet: unknown;
  signTransaction: PrivySolanaSignTransaction;
  rpcUrl?: string;
}): Promise<string> {
  const rpcUrl = params.rpcUrl || getDefaultSolanaRpcUrl();
  const chain = rpcUrl.toLowerCase().includes("devnet") ? "solana:devnet" : "solana:mainnet";
  const unsignedBytes = decodeSolanaTxBase64(params.unsignedTxBase64);
  const signedRaw = await params.signTransaction({
    transaction: unsignedBytes,
    wallet: params.wallet,
    chain,
  });
  const signedBytes = normalizeSignedTxToBytes(signedRaw);
  if (!signedBytes) {
    throw new Error("Unable to parse signed Solana transaction bytes.");
  }
  const conn = new Connection(rpcUrl, "confirmed");
  const txHash = await conn.sendRawTransaction(signedBytes, { skipPreflight: false, maxRetries: 3 });
  await conn.confirmTransaction(txHash, "confirmed");
  return txHash;
}

async function signWithWallet(
  wallet: SolanaSignerWallet,
  tx: VersionedTransaction | Transaction,
): Promise<VersionedTransaction | Transaction> {
  if (typeof wallet.signTransaction === "function") {
    return wallet.signTransaction(tx);
  }
  if (typeof wallet.provider?.signTransaction === "function") {
    return wallet.provider.signTransaction(tx);
  }
  if (typeof wallet.walletClient?.signTransaction === "function") {
    return wallet.walletClient.signTransaction(tx);
  }
  throw new Error("Solana wallet signing not available in this session.");
}

export async function signAndBroadcastSolanaBase64Tx(params: {
  unsignedTxBase64: string;
  wallet: SolanaSignerWallet;
  rpcUrl?: string;
}): Promise<string> {
  const { unsignedTxBase64, wallet, rpcUrl } = params;
  const bytes = decodeSolanaTxBase64(unsignedTxBase64);
  let signedTx: VersionedTransaction | Transaction;

  try {
    const versioned = VersionedTransaction.deserialize(bytes);
    signedTx = await signWithWallet(wallet, versioned);
  } catch {
    const legacy = Transaction.from(bytes);
    signedTx = await signWithWallet(wallet, legacy);
  }

  const conn = new Connection(rpcUrl || getDefaultSolanaRpcUrl(), "confirmed");
  const raw = signedTx.serialize();
  const txHash = await conn.sendRawTransaction(raw, { skipPreflight: false, maxRetries: 3 });
  await conn.confirmTransaction(txHash, "confirmed");
  return txHash;
}
