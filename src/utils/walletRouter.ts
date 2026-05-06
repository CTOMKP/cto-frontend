import { useWallets } from "@privy-io/react-auth";
import { useSignTransaction, useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import { toast } from "react-toastify";
import { apiPost } from "@/lib/apiClient";
import { mergePrivyWalletListsForSolana } from "@/lib/solanaTransaction";
import { toRecord, unwrapApiJsonBody } from "@/lib/apiResponse";

export type ChainType = "SOLANA" | "MOVEMENT";

type WalletRouterResult = {
  success: boolean;
  transactionHash?: string;
  error?: string;
};

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decodeBase64(base64: string): Uint8Array {
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
        return decodeBase64(direct);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function useWalletRouter() {
  const { wallets } = useWallets();
  const { wallets: solanaScopedWallets } = useSolanaWallets();
  const { signTransaction } = useSignTransaction();

  const getSolanaWallet = () => {
    const candidateWallets = mergePrivyWalletListsForSolana(
      wallets as unknown[],
      solanaScopedWallets as unknown[] | undefined,
    ) as typeof wallets;
    const wallet =
      candidateWallets.find((w) => w.chainId === "solana:mainnet" || w.chainId === "solana:devnet") ||
      candidateWallets.find((w) => (w as unknown as { chainType?: string }).chainType === "solana") ||
      candidateWallets.find(
        (w) =>
          (w as unknown as { walletClientType?: string }).walletClientType === "solana" ||
          (w as unknown as { coinType?: number }).coinType === 501,
      ) ||
      candidateWallets.find((w) => {
        const addr = String(w.address || "");
        return addr.length >= 32 && addr.length <= 44 && !addr.startsWith("0x");
      });

    if (!wallet?.address) {
      throw new Error("No Solana wallet found in Privy session.");
    }
    return wallet;
  };

  const executeSolanaTrade = async (unsignedTxBase64: string, quote: unknown): Promise<WalletRouterResult> => {
    try {
      const wallet = getSolanaWallet();
      const rpc = (process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.REACT_APP_SOLANA_RPC_URL || "").toLowerCase();
      const chain = rpc.includes("devnet") ? "solana:devnet" : "solana:mainnet";
      const unsignedBytes = decodeBase64(unsignedTxBase64);

      toast.info("Signing Solana transaction...");
      const signedRaw = await (signTransaction as unknown as (arg: {
        transaction: Uint8Array;
        wallet: unknown;
        chain: string;
      }) => Promise<unknown>)({
        transaction: unsignedBytes,
        wallet: wallet as unknown,
        chain,
      });

      const signedBytes = normalizeSignedTxToBytes(signedRaw);
      if (!signedBytes) {
        throw new Error("Unable to parse signed Solana transaction bytes.");
      }

      const executeRes = await apiPost<unknown>("/api/v1/trades/execute", {
        chain: "solana",
        quote,
        signedTransaction: bytesToBase64(signedBytes),
      });

      const payload = toRecord(unwrapApiJsonBody(executeRes));
      const txHash = String(payload.txHash || payload.transactionHash || "");
      if (!txHash) {
        throw new Error(String(payload.error || "Trade execution failed"));
      }
      return { success: true, transactionHash: txHash };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to execute Solana trade";
      return { success: false, error: msg };
    }
  };

  const executeTrade = async (
    chain: ChainType,
    params: { transaction?: string; quote: unknown },
  ): Promise<WalletRouterResult> => {
    if (chain !== "SOLANA") return { success: false, error: `Unsupported chain: ${chain}` };
    if (!params.transaction) return { success: false, error: "Missing Solana transaction data." };
    return executeSolanaTrade(params.transaction, params.quote);
  };

  return {
    getSolanaWallet,
    executeSolanaTrade,
    executeTrade,
  };
}
