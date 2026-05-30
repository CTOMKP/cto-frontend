"use client";

import React, { useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { creatorKeys } from "@/lib/queryKeys";
import creatorProgramService from "@/services/creatorProgramService";

function formatMoney(value: number | null | undefined) {
  const amount = Number(value || 0);
  return `$${amount.toFixed(2)}`;
}

function maskEmail(email?: string | null) {
  if (!email) return "user";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}

export default function ReferralSection() {
  const queryClient = useQueryClient();
  const { user } = usePrivy();
  const [walletAddress, setWalletAddress] = useState("");

  const dashboardQuery = useQuery({
    queryKey: creatorKeys.dashboard(),
    queryFn: () => creatorProgramService.getDashboard(12),
    staleTime: 30_000,
  });

  const requestPayout = useMutation({
    mutationFn: () =>
      creatorProgramService.requestPayout({
        walletAddress: walletAddress.trim() || undefined,
      }),
    onSuccess: async () => {
      toast.success("Payout request submitted");
      await queryClient.invalidateQueries({ queryKey: creatorKeys.all });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to request payout");
    },
  });

  const dashboard = dashboardQuery.data;
  const account = dashboard?.account;
  const stats = dashboard?.stats;
  const referralLink = account?.referralLink ?? "";
  const referralCode = account?.referralCode ?? "";
  const copyReferralLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied");
  };

  const copyReferralCode = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied");
  };

  const summaryCards = useMemo(
    () => [
      { label: "Active", value: stats?.activeReferrals ?? 0 },
      { label: "Pending", value: formatMoney(stats?.pendingPayoutBalance) },
      { label: "This Month", value: formatMoney(stats?.thisMonthEarnings) },
      { label: "Cut", value: `${stats?.creatorCutPercent ?? 0}%` },
    ],
    [stats],
  );

  React.useEffect(() => {
    if (!walletAddress && account?.payoutWalletAddress) {
      setWalletAddress(account.payoutWalletAddress);
      return;
    }

    if (!walletAddress) {
      const firstWallet = user?.linkedAccounts?.find((accountItem) => accountItem.type === "wallet");
      if (firstWallet?.address) {
        setWalletAddress(firstWallet.address);
      }
    }
  }, [account?.payoutWalletAddress, user?.linkedAccounts, walletAddress]);

  return (
    <div className="rounded-lg border-[0.5px] border-white/20 bg-white/[0.03] p-4 w-full overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-white/85 font-semibold text-lg">Creator program</h3>
          <p className="text-white/50 text-sm mt-1">
            Referral link, earnings, and payout tracking.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
          {account?.tier ?? "STARTER"}
        </div>
      </div>

      {dashboardQuery.isLoading ? (
        <div className="text-white/50 text-sm">Loading creator data...</div>
      ) : dashboardQuery.isError ? (
        <div className="text-red-200 text-sm">
          Failed to load creator dashboard.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-md border border-white/10 bg-black/20 p-3">
                <div className="text-[11px] uppercase tracking-wide text-white/40">{card.label}</div>
                <div className="mt-1 text-sm font-semibold text-white">{card.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-white/10 bg-black/25 p-3 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-white/40">Referral link</div>
                <div className="mt-1 text-sm text-white break-all">{referralLink || "Generating..."}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyReferralCode}
                  className="rounded-md border border-white/10 px-3 py-2 text-xs text-white/75 hover:text-white hover:border-white/20"
                >
                  Copy code
                </button>
                <button
                  type="button"
                  onClick={copyReferralLink}
                  className="rounded-md bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] px-3 py-2 text-xs text-black font-semibold"
                >
                  Copy link
                </button>
              </div>
            </div>
            <div className="mt-3 text-xs text-white/45">
              Next tier target: {stats?.nextTierTarget ?? 0} active referrals
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">Payout</h4>
                <span className="text-xs text-white/45">
                  Minimum {formatMoney(10)}
                </span>
              </div>
              <label className="block text-[11px] uppercase tracking-wide text-white/40 mb-1">
                Wallet address
              </label>
              <input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Paste payout wallet address"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              />
              <button
                type="button"
                disabled={requestPayout.isPending || (stats?.pendingPayoutBalance ?? 0) < 10}
                onClick={() => requestPayout.mutate()}
                className="mt-3 w-full rounded-md bg-white text-black px-3 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {requestPayout.isPending
                  ? "Requesting..."
                  : `Request payout ${formatMoney(stats?.pendingPayoutBalance)}`}
              </button>
              <div className="mt-2 text-xs text-white/45">
                {account?.fraudStatus && account.fraudStatus !== "CLEAR"
                  ? `Account on hold: ${account.fraudReason || "under review"}`
                  : "Payouts are queued until approved manually."}
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <h4 className="text-sm font-semibold text-white mb-2">Recent referrals</h4>
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {(dashboard?.referrals ?? []).length === 0 ? (
                  <div className="text-sm text-white/45">No referrals yet.</div>
                ) : (
                  dashboard!.referrals.slice(0, 5).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between gap-2 rounded-md bg-white/[0.03] px-3 py-2">
                      <div>
                        <div className="text-sm text-white">{maskEmail(referral.referredUser.email)}</div>
                        <div className="text-xs text-white/45">
                          {referral.isActive ? "Active" : "Inactive"} • {new Date(referral.signedUpAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`text-xs ${referral.isFraudFlagged ? "text-red-300" : "text-emerald-300"}`}>
                        {referral.isFraudFlagged ? "Held" : referral.totalEarned > 0 ? formatMoney(referral.totalEarned) : "Signed up"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <h4 className="text-sm font-semibold text-white mb-2">Earnings</h4>
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {(dashboard?.earnings ?? []).length === 0 ? (
                  <div className="text-sm text-white/45">No earnings yet.</div>
                ) : (
                  dashboard!.earnings.slice(0, 5).map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between gap-2 rounded-md bg-white/[0.03] px-3 py-2">
                      <div>
                        <div className="text-sm text-white">{earning.sourceType.replaceAll("_", " ")}</div>
                        <div className="text-xs text-white/45">{new Date(earning.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-xs text-white">
                        {formatMoney(earning.amountEarned)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <h4 className="text-sm font-semibold text-white mb-2">Payout history</h4>
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {(dashboard?.payouts ?? []).length === 0 ? (
                  <div className="text-sm text-white/45">No payout requests yet.</div>
                ) : (
                  dashboard!.payouts.slice(0, 5).map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between gap-2 rounded-md bg-white/[0.03] px-3 py-2">
                      <div>
                        <div className="text-sm text-white">{formatMoney(payout.amountRequested)}</div>
                        <div className="text-xs text-white/45">{new Date(payout.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-xs uppercase tracking-wide text-white/65">
                        {payout.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
