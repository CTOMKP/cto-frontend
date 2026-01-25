"use client";

import { SquareArrowOutUpRight } from "lucide-react";
import type { WalletTransaction } from "@/services/movementWalletService";
import TxHistoryTableSkeleton from "./TxHistoryTableSkeleton";

interface TxHistoryTabProps {
  transactions: WalletTransaction[];
  loading: boolean;
  syncing: boolean;
  onSync: () => void;
}

function formatTransactionAmount(tx: WalletTransaction): string {
  const isUSDC = tx.tokenSymbol?.toLowerCase().includes("usdc");
  const divisor = isUSDC ? 1000000 : 100000000;
  const decimals = isUSDC ? 2 : 2;
  const amount = parseFloat(tx.amount) / divisor;
  const symbol = isUSDC ? "USDC" : "MOVE";
  return `${amount.toFixed(decimals)} ${symbol}`;
}

function formatTransactionValue(tx: WalletTransaction): string {
  const isUSDC = tx.tokenSymbol?.toLowerCase().includes("usdc");
  if (isUSDC) {
    const amount = parseFloat(tx.amount) / 1000000;
    return `$${amount.toFixed(2)}`;
  }
  const amount = parseFloat(tx.amount) / 100000000;
  return `${amount.toFixed(2)} MOVE`;
}

function formatAddress(address: string): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export default function TxHistoryTab({
  transactions,
  loading,
  syncing,
  onSync,
}: TxHistoryTabProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div />
        <button
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
              Sync
            </>
          )}
        </button>
      </div>

      {loading ? (
        <TxHistoryTableSkeleton />
      ) : transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-1">
            <thead>
              <tr className="text-left">
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Timestamp
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Value (USDC)
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Amount
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Type
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-4">
                  Address
                </th>
                <th className="text-xs font-bold text-white/50 py-2 pr-0 text-right">
                  Hash ID
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="bg-white/2">
                  <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
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
                  <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">
                    {formatAddress(tx.txHash)}
                  </td>
                  <td className="text-xs font-medium text-white py-3 pr-0 whitespace-nowrap text-right">
                    <a
                      href={`https://explorer.movementnetwork.xyz/txn/${tx.txHash}?network=bardock+testnet`}
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
