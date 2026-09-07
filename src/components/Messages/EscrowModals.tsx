"use client";

import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSignRawHash } from "@privy-io/react-auth/extended-chains";
import { toast } from "react-toastify";
import escrowService from "@/services/escrowService";
import { movementPaymentService } from "@/services/movementPaymentService";
import { getMovementWallet, sendMovementTransaction } from "@/lib/movement-wallet";
import type { EscrowCreatePayload, EscrowStatus } from "@/types/messages";

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
  status?: EscrowStatus | string;
  title?: string;
  totalAmount?: number;
  deadline?: string | null;
};

type DecisionAction =
  | "accept"
  | "decline"
  | "submit"
  | "release"
  | "refund"
  | "review_release"
  | "review_dispute"
  | "dispute_response";

const FUNDED_STATUSES = new Set([
  "FUNDED",
  "IN_PROGRESS",
  "ACTIVE",
  "PAID",
  "LOCKED",
  "ESCROWED",
]);
const SUBMITTED_STATUSES = new Set([
  "SUBMITTED",
  "WORK_SUBMITTED",
  "DELIVERED",
]);

function escrowStatus(escrow: EscrowViewRecord): string {
  return String(escrow.status || "UNKNOWN").toUpperCase();
}

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
  const [decisionLoading, setDecisionLoading] = useState<DecisionAction | null>(
    null,
  );
  const [disputeExplanation, setDisputeExplanation] = useState("");

  if (!escrow?.id) return null;

  const status = escrowStatus(escrow);
  const statusLabel = status.replace(/_/g, " ");
  const isProposed = status === "PROPOSED";
  const isAwaitingPayment = status === "AWAITING_PAYMENT";
  const isUnderReview = status === "UNDER_REVIEW";
  const isDisputed = status === "DISPUTED";
  const isFunded = FUNDED_STATUSES.has(status);
  const isSubmitted = SUBMITTED_STATUSES.has(status);
  const canSubmitWork = !isPoster && isFunded;
  const canReleaseOrRefund = isPoster && (isFunded || isSubmitted);

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
        paymentUnknown && typeof paymentUnknown === "object"
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

  const handleSubmitWork = async () => {
    try {
      setDecisionLoading("submit");
      await escrowService.submitWork(escrow.id!);
      toast.success("Work submitted for review");
      await refreshEscrow();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to submit work";
      toast.error(msg);
    } finally {
      setDecisionLoading(null);
    }
  };

  const handleRelease = async () => {
    try {
      setDecisionLoading("release");
      await escrowService.release(escrow.id!);
      toast.success("Funds released");
      await refreshEscrow();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to release funds";
      toast.error(msg);
    } finally {
      setDecisionLoading(null);
    }
  };

  const handleRefund = async () => {
    if (!window.confirm("Refund this escrow to the poster?")) return;
    try {
      setDecisionLoading("refund");
      await escrowService.refund(escrow.id!);
      toast.success("Escrow refunded");
      await refreshEscrow();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to refund escrow";
      toast.error(msg);
    } finally {
      setDecisionLoading(null);
    }
  };

  const handlePosterReview = async (satisfied: boolean) => {
    try {
      const loadingKey = satisfied ? "review_release" : "review_dispute";
      setDecisionLoading(loadingKey);
      let reason = "";
      if (!satisfied) {
        reason =
          window.prompt("Briefly describe the issue with the delivery:", "") ||
          "";
      }
      await escrowService.posterReview(escrow.id!, {
        satisfied,
        reason: reason.trim() || undefined,
      });
      toast.success(
        satisfied
          ? "Funds released"
          : "Dispute opened. Applicant has been asked to explain.",
      );
      await refreshEscrow();
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to submit review decision";
      toast.error(msg);
    } finally {
      setDecisionLoading(null);
    }
  };

  const handleDisputeResponse = async () => {
    try {
      setDecisionLoading("dispute_response");
      await escrowService.submitDisputeResponse(
        escrow.id!,
        disputeExplanation,
      );
      toast.success("Your explanation has been sent for review");
      setDisputeExplanation("");
      await refreshEscrow();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to send explanation";
      toast.error(msg);
    } finally {
      setDecisionLoading(null);
    }
  };

  const busy = funding || decisionLoading !== null;
  const applicantWaitingCopy = isUnderReview
    ? "Deadline elapsed. Awaiting client review decision."
    : isDisputed
      ? "A dispute is open. Please provide your explanation below."
      : isSubmitted
        ? "Work submitted. Awaiting the poster to release funds or review."
        : canSubmitWork
          ? "Funds are locked. Submit the work when delivery is complete."
          : "Awaiting the next escrow step from the poster.";
  const posterHasDedicatedAction =
    isAwaitingPayment || isUnderReview || canReleaseOrRefund;

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

          {!isPoster && isProposed && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleDecision("accept")}
                disabled={busy}
                className="flex-1 rounded-full bg-[#FFCB45] px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
              >
                {decisionLoading === "accept" ? "Accepting…" : "Accept offer"}
              </button>
              <button
                type="button"
                onClick={() => handleDecision("decline")}
                disabled={busy}
                className="flex-1 rounded-full border border-white/10 px-4 py-3 text-sm text-zinc-300 disabled:opacity-40"
              >
                {decisionLoading === "decline" ? "Declining…" : "Decline"}
              </button>
            </div>
          )}

          {!isPoster && !isProposed && (
            <div className="rounded-xl border border-white/10 bg-black/70 p-3 text-xs text-zinc-400">
              {applicantWaitingCopy}
            </div>
          )}

          {canSubmitWork && (
            <button
              type="button"
              onClick={handleSubmitWork}
              disabled={busy}
              className="w-full rounded-full bg-[#FFCB45] px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
            >
              {decisionLoading === "submit" ? "Submitting…" : "Submit work"}
            </button>
          )}

          {!isPoster && isDisputed && (
            <div className="space-y-2">
              <textarea
                value={disputeExplanation}
                onChange={(e) => setDisputeExplanation(e.target.value)}
                rows={3}
                placeholder="Explain what happened and any proof/context."
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-xs text-zinc-200 outline-none"
              />
              <button
                type="button"
                onClick={handleDisputeResponse}
                disabled={busy || disputeExplanation.trim().length < 10}
                className="w-full rounded-full bg-[#FFCB45] px-4 py-2 text-xs font-semibold text-black disabled:opacity-40"
              >
                {decisionLoading === "dispute_response"
                  ? "Submitting…"
                  : "Submit explanation"}
              </button>
            </div>
          )}

          {isPoster && isAwaitingPayment && (
            <button
              type="button"
              onClick={handleFund}
              disabled={busy}
              className="w-full rounded-full bg-[#FFCB45] px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
            >
              {funding ? "Funding…" : "Fund escrow"}
            </button>
          )}

          {canReleaseOrRefund && (
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/70 p-3 text-xs text-zinc-400">
                {isSubmitted
                  ? "Work has been submitted. Release funds if you are satisfied, or refund if not."
                  : "Escrow is funded. You can release funds after delivery or refund the locked amount."}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRelease}
                  disabled={busy}
                  className="flex-1 rounded-full bg-[#FFCB45] px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
                >
                  {decisionLoading === "release" ? "Releasing…" : "Release funds"}
                </button>
                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={busy}
                  className="flex-1 rounded-full border border-white/10 px-4 py-3 text-sm text-zinc-300 disabled:opacity-40"
                >
                  {decisionLoading === "refund" ? "Refunding…" : "Refund"}
                </button>
              </div>
            </div>
          )}

          {isPoster && isUnderReview && (
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/70 p-3 text-xs text-zinc-400">
                Deadline has elapsed. Are you satisfied with delivery?
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handlePosterReview(true)}
                  disabled={busy}
                  className="flex-1 rounded-full bg-[#FFCB45] px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
                >
                  {decisionLoading === "review_release"
                    ? "Releasing…"
                    : "Release funds"}
                </button>
                <button
                  type="button"
                  onClick={() => handlePosterReview(false)}
                  disabled={busy}
                  className="flex-1 rounded-full border border-white/10 px-4 py-3 text-sm text-zinc-300 disabled:opacity-40"
                >
                  {decisionLoading === "review_dispute"
                    ? "Submitting…"
                    : "Report issue"}
                </button>
              </div>
            </div>
          )}

          {isPoster && !posterHasDedicatedAction && (
            <div className="rounded-xl border border-white/10 bg-black/70 p-3 text-xs text-zinc-400">
              This escrow is currently in “{statusLabel}” state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
