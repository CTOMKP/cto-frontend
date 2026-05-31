"use client";

import { SquareArrowOutUpRight } from "lucide-react";
import type { WalletTransaction } from "@/services/movementWalletService";
import TxHistoryTableSkeleton from "./TxHistoryTableSkeleton";
import { getDefaultSolanaRpcUrl } from "@/lib/solanaRpc";

export type HistoryTxRow = WalletTransaction & {
  sourceChain: "movement" | "solana";
};

interface TxHistoryTabProps {
  transactions: HistoryTxRow[];
  loading: boolean;
  syncing: boolean;
  selectedChain: "solana" | "movement";
  hasSolana: boolean;
  hasMovement: boolean;
  onSelectChain: (chain: "solana" | "movement") => void;
  onSync: () => void;
  debugWalletMapping?: {
    solanaLinkedAddress: string | null;
    solanaBackendWalletId: string | null;
    movementWalletId: string | null;
  };
}

function tokenMeta(tx: WalletTransaction): {
  divisor: number;
  symbol: string;
} {
  const sym = String(tx.tokenSymbol ?? "").toUpperCase();
  if (sym.includes("USDC")) {
    return { divisor: 1_000_000, symbol: "USDC" };
  }
  if (sym === "SOL") {
    return { divisor: 1_000_000_000, symbol: "SOL" };
  }
  return { divisor: 100_000_000, symbol: "MOVE" };
}

function formatTransactionAmount(tx: WalletTransaction): string {
  const { divisor, symbol } = tokenMeta(tx);
  const amount = parseFloat(tx.amount) / divisor;
  return `${amount.toFixed(symbol === "SOL" ? 4 : 2)} ${symbol}`;
}

function formatTransactionValue(tx: WalletTransaction): string {
  const { divisor, symbol } = tokenMeta(tx);
  const amount = parseFloat(tx.amount) / divisor;
  if (symbol === "USDC") return `$${amount.toFixed(2)}`;
  return `${amount.toFixed(symbol === "SOL" ? 4 : 2)} ${symbol}`;
}

function formatAddressSnippet(raw: string): string {
  if (!raw) return "";
  if (raw.length <= 10) return raw;
  return `${raw.substring(0, 6)}...${raw.substring(raw.length - 4)}`;
}

function formatTimestamp(raw: string): string {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Counterparty / reference line (matches test `MovementWalletRecentActivity`). */
function counterpartyAddress(tx: WalletTransaction): string {
  const side =
    tx.txType === "CREDIT"
      ? tx.fromAddress || tx.txHash
      : tx.toAddress || tx.txHash;
  return side ? String(side) : "";
}

function explorerHref(tx: HistoryTxRow): string {
  if (tx.sourceChain === "solana") {
    const devnet = getDefaultSolanaRpcUrl().toLowerCase().includes("devnet");
    return devnet
      ? `https://solscan.io/tx/${encodeURIComponent(tx.txHash)}?cluster=devnet`
      : `https://solscan.io/tx/${encodeURIComponent(tx.txHash)}`;
  }
  if (tx.txHash?.startsWith("version-")) {
    const version = tx.txHash.replace("version-", "");
    return `https://explorer.movementnetwork.xyz/version/${encodeURIComponent(version)}?network=bardock+testnet`;
  }
  return `https://explorer.movementnetwork.xyz/txn/${encodeURIComponent(tx.txHash)}?network=bardock+testnet`;
}

export default function TxHistoryTab({
  transactions,
  loading,
  syncing,
  selectedChain,
  hasSolana,
  hasMovement,
  onSelectChain,
  onSync,
  debugWalletMapping,
}: TxHistoryTabProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectChain("solana")}
            disabled={!hasSolana}
            className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
              selectedChain === "solana"
                ? "bg-[#17171C] text-white border-white/30"
                : "bg-transparent text-white/70 border-white/15 hover:bg-white/5"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Solana
          </button>
          <button
            type="button"
            onClick={() => onSelectChain("movement")}
            disabled={!hasMovement}
            className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
              selectedChain === "movement"
                ? "bg-[#17171C] text-white border-white/30"
                : "bg-transparent text-white/70 border-white/15 hover:bg-white/5"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Movement
          </button>
        </div>
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="text-xs px-3 py-1 rounded-lg bg-[#17171C] text-white hover:bg-[#2A2A2E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {syncing ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b border-t border-white" />
              Syncing...
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Sync {selectedChain === "solana" ? "Solana" : "Movement"}
            </>
          )}
        </button>
      </div>
      {/* {process.env.NODE_ENV !== "production" && debugWalletMapping && (
        <div className="mb-4 rounded-md border border-white/15 bg-white/5 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
            Tx wallet mapping debug
          </p>
          <div className="mt-1 grid gap-1 text-xs text-white/80 font-mono break-all">
            <p>
              solanaLinkedAddress: {debugWalletMapping.solanaLinkedAddress ?? "null"}
            </p>
            <p>
              solanaBackendWalletId: {debugWalletMapping.solanaBackendWalletId ?? "null"}
            </p>
            <p>
              movementWalletId: {debugWalletMapping.movementWalletId ?? "null"}
            </p>
          </div>
        </div>
      )} */}

      {loading ? (
        <TxHistoryTableSkeleton />
      ) : transactions.length > 0 ? (
        <div className="overflow-x-auto hover-scrollbar">
          <table className="min-w-full border-separate border-spacing-y-1">
            <thead>
              <tr className="text-left">
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Network
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Timestamp
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Value
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Amount
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Type
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Counterparty
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-0 text-right">
                  Explorer
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={`${tx.sourceChain}-${tx.id}-${tx.txHash}`} className="bg-white/2">
                  <td className="text-xs font-medium text-white/80 py-3 pr-4 whitespace-nowrap">
                    {tx.sourceChain === "solana" ? "Solana" : "Movement"}
                  </td>
                  <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                    {formatTimestamp(tx.createdAt)}
                  </td>
                  <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                    {formatTransactionValue(tx)}
                  </td>
                  <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                    {formatTransactionAmount(tx)}
                  </td>
                  <td className="text-xs font-medium py-3 pr-4 whitespace-nowrap">
                    <span
                      className={
                        tx.txType === "CREDIT"
                          ? "text-[#16C784]"
                          : "text-[#C71624]"
                      }
                    >
                      {tx.txType === "CREDIT"
                        ? "Deposit"
                        : tx.txType === "DEBIT"
                          ? "Withdraw"
                          : "Transfer"}
                    </span>
                  </td>
                  <td className="text-xs font-medium text-white py-3 pr-4 font-mono max-w-[140px] truncate">
                    {formatAddressSnippet(counterpartyAddress(tx))}
                  </td>
                  <td className="text-xs font-medium text-white py-3 pr-0 whitespace-nowrap text-right">
                    <a
                      href={explorerHref(tx)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white/80 hover:text-white"
                    >
                      <SquareArrowOutUpRight size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xs text-white/50 italic">
            No transactions detected yet.
          </p>
        </div>
      )}
    </>
  );
}
