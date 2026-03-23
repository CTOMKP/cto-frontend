"use client";

import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSignRawHash } from "@privy-io/react-auth/extended-chains";
import { toast } from "react-toastify";
import escrowService from "@/services/escrowService";
import { movementPaymentService } from "@/services/movementPaymentService";
import { getMovementWallet, sendMovementTransaction } from "@/lib/movement-wallet";
import type { EscrowCreatePayload } from "@/types/messages";

export function EscrowCreateModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: EscrowCreatePayload) => void;
}) {
  const [title, setTitle] = useState("Project milestone");
  const [amount, setAmount] = useState("100");
  const [deadline, setDeadline] = useState("");
  const [noDeadline, setNoDeadline] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Create Escrow Offer</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="mt-6 space-y-4 text-sm">
          <div>
            <label className="text-xs text-zinc-400">Task title</label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Total amount (USDC)</label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Deadline</label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
              placeholder="MM/DD/YYYY"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-amber-400">
              <input
                type="checkbox"
                checked={noDeadline}
                onChange={(e) => setNoDeadline(e.target.checked)}
              />
              No fixed deadline
            </label>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/70 p-3 text-xs text-zinc-400">
            Escrow method: Movement USDC only
          </div>
          <button
            type="button"
            onClick={() =>
              onSubmit({
                title,
                totalAmount: Number(amount) || 0,
                currency: "USDC",
                deadline: noDeadline ? null : deadline,
                noDeadline,
                milestones: [],
              })
            }
            className="w-full rounded-full bg-[#FFCB45] px-4 py-3 text-sm font-semibold text-black hover:opacity-90"
          >
            Send escrow offer
          </button>
        </div>
      </div>
    </div>
  );
}

type EscrowViewRecord = {
  id?: string;
  status?: string;
  title?: string;
  totalAmount?: number;
  deadline?: string | null;
};

export function EscrowViewModal({
  escrow,
  onClose,
  isPoster,
  onUpdated,
}: {
  escrow: EscrowViewRecord | null;
  onClose: () => void;
  isPoster: boolean;
  onUpdated?: () => Promise<unknown>;
}) {
  const { user: privyUser } = usePrivy();
  const { signRawHash } = useSignRawHash();
  const [funding, setFunding] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState<
    "accept" | "decline" | null
  >(null);

  if (!escrow?.id) return null;

  const refreshEscrow = async () => {
    if (onUpdated) await onUpdated();
  };

  const handleFund = async () => {
    try {
      setFunding(true);
      const wallet = getMovementWallet(privyUser);
      if (!wallet?.address || !(wallet as { publicKey?: string }).publicKey) {
        toast.error("Movement wallet not found. Sync wallets in Profile.");
        return;
      }
      const paymentUnknown = await escrowService.fund(escrow.id!);
      const pay =
        paymentUnknown &&
        typeof paymentUnknown === "object"
          ? (paymentUnknown as Record<string, unknown>)
          : {};
      const nested =
        pay.payment && typeof pay.payment === "object"
          ? (pay.payment as Record<string, unknown>)
          : pay;
      const paymentId =
        (nested.paymentId as string | undefined) ||
        (pay.paymentId as string | undefined);
      const transactionData =
        (nested.transactionData as Record<string, unknown> | undefined) ||
        (nested.transaction_data as Record<string, unknown> | undefined) ||
        (pay.transactionData as Record<string, unknown> | undefined);

      if (
        !transactionData ||
        typeof transactionData.function !== "string" ||
        !Array.isArray(transactionData.arguments)
      ) {
        toast.error("Transaction data missing from server");
        return;
      }

      const typeArgs = Array.isArray(transactionData.type_arguments)
        ? (transactionData.type_arguments as string[])
        : [];

      const txHash = await sendMovementTransaction(
        {
          type: String(transactionData.type ?? "entry_function_payload"),
          function: transactionData.function as string,
          type_arguments: typeArgs,
          arguments: transactionData.arguments as string[],
        },
        wallet.address,
        (wallet as { publicKey: string }).publicKey,
        signRawHash,
      );

      if (paymentId) {
        await movementPaymentService.verifyPayment(paymentId, txHash);
      }
      toast.success(`Escrow funded: ${txHash.slice(0, 8)}…`);
      await refreshEscrow();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to fund escrow";
      toast.error(msg);
    } finally {
      setFunding(false);
    }
  };

  const handleDecision = async (action: "accept" | "decline") => {
    try {
      setDecisionLoading(action);
      if (action === "accept") {
        await escrowService.accept(escrow.id!);
        toast.success("Escrow offer accepted");
      } else {
        await escrowService.decline(escrow.id!);
        toast.success("Escrow offer declined");
      }
      await refreshEscrow();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : `Failed to ${action} escrow`;
      toast.error(msg);
    } finally {
      setDecisionLoading(null);
    }
  };

  const statusLabel = String(escrow.status || "UNKNOWN").replace(/_/g, " ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Escrow offer</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="mt-6 space-y-3 text-sm text-white">
          <div className="text-xs uppercase tracking-wide text-zinc-500">
            Status: {statusLabel}
          </div>
          <div>Task title: {escrow.title}</div>
          <div>Total amount: {escrow.totalAmount} USDC</div>
          <div>
            Deadline:{" "}
            {escrow.deadline
              ? new Date(escrow.deadline).toLocaleDateString()
              : "No fixed deadline"}
          </div>
          <div className="rounded-xl border border-white/10 bg-black/70 p-3 text-xs text-zinc-400">
            Escrow method: Movement USDC
          </div>
          {!isPoster && escrow.status === "PROPOSED" && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleDecision("accept")}
                disabled={decisionLoading !== null}
                className="flex-1 rounded-full bg-[#FFCB45] px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
              >
                {decisionLoading === "accept" ? "Accepting…" : "Accept offer"}
              </button>
              <button
                type="button"
                onClick={() => handleDecision("decline")}
                disabled={decisionLoading !== null}
                className="flex-1 rounded-full border border-white/10 px-4 py-3 text-sm text-zinc-300 disabled:opacity-40"
              >
                {decisionLoading === "decline" ? "Declining…" : "Decline"}
              </button>
            </div>
          )}
          {!isPoster && escrow.status !== "PROPOSED" && (
            <div className="rounded-xl border border-white/10 bg-black/70 p-3 text-xs text-zinc-400">
              Awaiting the next escrow step from the poster.
            </div>
          )}
          {isPoster && escrow.status === "AWAITING_PAYMENT" && (
            <button
              type="button"
              onClick={handleFund}
              disabled={funding}
              className="w-full rounded-full bg-[#FFCB45] px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
            >
              {funding ? "Funding…" : "Fund escrow"}
            </button>
          )}
          {isPoster && escrow.status !== "AWAITING_PAYMENT" && (
            <div className="rounded-xl border border-white/10 bg-black/70 p-3 text-xs text-zinc-400">
              This escrow is currently in “{statusLabel}” state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
