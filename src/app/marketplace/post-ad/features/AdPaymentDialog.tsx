"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Check, Copy } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useWallets as useSolanaWallets, useSignTransaction } from '@privy-io/react-auth/solana';
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { movementWalletService } from '@/services/movementWalletService';
import { sendMovementTransaction } from '@/lib/movement-wallet';
import { toast } from 'react-toastify';
import marketplaceService from '@/services/marketplaceService';
import solanaPaymentService from '@/services/solanaPaymentService';
import { getAuthToken } from '@/lib/authSession';
import { invalidateMarketplaceQueries } from '@/lib/queryInvalidation';
import { useResolvedMovementWallet } from '@/hooks/useResolvedMovementWallet';
import { isApiError } from '@/lib/apiError';
import solanaWalletService from '@/services/solanaWalletService';
import {
  getPrivySolanaPayWallet,
  resolvePrivySolanaAddress,
  signAndBroadcastSolanaPayPreferPrivyHook,
  type PrivySolanaSignTransaction,
} from '@/lib/solanaTransaction';
import { getDefaultSolanaRpcUrl } from '@/lib/solanaRpc';

interface AdPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle?: string;
  /** Last known draft id (display); pay always uses {@link ensureDraftSaved} when provided. */
  adsId: string;
  adFee?: number;
  /** Line items to show in step 1 (e.g. Category $5, Visibility: Plus $5, Auto-Bump $7). Total is sum of these. */
  breakdown?: { label: string; price: number }[];
  onPaymentSuccess?: () => void;
  /**
   * Like cto-test-frontend `MarketDashboard` `ensureDraftSaved`: create/update draft on the server
   * immediately before payment so `createPayment` / Solana pay use a persisted ad id.
   */
  ensureDraftSaved?: () => Promise<string | null>;
}

export default function AdPaymentDialog({
  open,
  onOpenChange,
  projectTitle = "Ad",
  adsId,
  adFee = 5,
  breakdown,
  onPaymentSuccess,
  ensureDraftSaved,
}: AdPaymentDialogProps) {
  const queryClient = useQueryClient();
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { signTransaction: privySignSolanaTransaction } = useSignTransaction();
  const { signRawHash } = useSignRawHash();
  const [currentStep, setCurrentStep] = useState(1);
  /** Movement = USDC on Movement; SOL = USDC on Solana (native SOL only for fees). */
  const [paymentMethod, setPaymentMethod] = useState<'USDC' | 'SOL'>('SOL');
  const [movementUsdc, setMovementUsdc] = useState(0);
  const [movementAddress, setMovementAddress] = useState('');
  const [solanaUsdc, setSolanaUsdc] = useState(0);
  const [solanaAddress, setSolanaAddress] = useState('');
  const [loadingMovementBalance, setLoadingMovementBalance] = useState(false);
  const [loadingSolanaBalance, setLoadingSolanaBalance] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const movementWalletQuery = useResolvedMovementWallet({ preferStorage: true });
  const { wallets: solanaScopedWallets } = useSolanaWallets();
  /** Signing + “Solana available”: dual-list so `@privy-io/react-auth/solana` wallets count (CRA test app used main list only). */
  const solanaPayWallet = useMemo(
    () => getPrivySolanaPayWallet(wallets as unknown[], solanaScopedWallets as unknown[] | undefined),
    [wallets, solanaScopedWallets],
  );
  /** Balance / deposit address: dual-list so embedded & solana-scoped wallets still resolve. */
  const solanaDisplayAddress = useMemo(
    () =>
      resolvePrivySolanaAddress(wallets as unknown[], solanaScopedWallets as unknown[] | undefined) ??
      solanaPayWallet?.address ??
      null,
    [wallets, solanaScopedWallets, solanaPayWallet?.address],
  );
  const solanaAvailable = !!solanaPayWallet;
  const userPickedPaymentRef = useRef(false);

  /** Default: USDC on Solana when a Solana wallet exists; otherwise Movement. Re-sync when dialog opens or Solana becomes available until the user picks a method. */
  useEffect(() => {
    if (!open) {
      userPickedPaymentRef.current = false;
      return;
    }
    if (userPickedPaymentRef.current) return;
    setPaymentMethod(solanaAvailable ? 'SOL' : 'USDC');
  }, [open, solanaAvailable]);

  /** Stable keys so balance effects do not re-run on every Privy wallet array identity change. */
  const movementBalanceKey =
    movementWalletQuery.data?.walletId != null && String(movementWalletQuery.data.walletId) !== ''
      ? String(movementWalletQuery.data.walletId)
      : movementWalletQuery.data?.movementWallet?.address
        ? String(movementWalletQuery.data.movementWallet.address)
        : '';
  const solanaAddrKey = solanaDisplayAddress ?? '';

  const totalAmount = breakdown && breakdown.length > 0
    ? breakdown.reduce((sum, item) => sum + item.price, 0)
    : adFee;

  const displayUsdcBalance = paymentMethod === 'SOL' ? solanaUsdc : movementUsdc;
  const displayWalletAddress = paymentMethod === 'SOL' ? solanaAddress : movementAddress;
  const needsFund = displayUsdcBalance < totalAmount;
  const isLoadingBalance = paymentMethod === 'SOL' ? loadingSolanaBalance : loadingMovementBalance;

  const copyWalletAddress = () => {
    if (displayWalletAddress) {
      navigator.clipboard.writeText(displayWalletAddress);
      setCopiedAddress(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  useEffect(() => {
    if (!open || !authenticated || !user || currentStep !== 2 || paymentMethod !== 'USDC') return;
    let cancelled = false;
    setLoadingMovementBalance(true);
    (async () => {
      try {
        let movementWallet = movementWalletQuery.data?.movementWallet ?? null;
        let walletId = movementWalletQuery.data?.walletId ?? null;
        if (!movementWallet || !walletId) {
          const fresh = await movementWalletQuery.refetch();
          if (cancelled) return;
          movementWallet = fresh.data?.movementWallet ?? null;
          walletId = fresh.data?.walletId ?? null;
        }

        if (!movementWallet) {
          if (!cancelled) {
            setMovementUsdc(0);
            setMovementAddress('');
          }
          return;
        }

        if (!cancelled) setMovementAddress(movementWallet.address);

        if (!walletId) {
          if (!cancelled) setMovementUsdc(0);
          return;
        }

        if (cancelled) return;
        const balances = await movementWalletService.getBalance(walletId);
        if (cancelled) return;

        const usdcBalance = balances.find(
          (b) => b.tokenSymbol?.toUpperCase() === 'USDC' ||
            b.tokenSymbol?.toUpperCase() === 'USDC.E' ||
            b.tokenAddress?.toLowerCase() === '0xb89077cfd2a82a0c1450534d49cfd5f2707643155273069bc23a912bcfefdee7'
        );

        if (usdcBalance) {
          const balanceValue = parseFloat(usdcBalance.balance) / Math.pow(10, usdcBalance.decimals);
          if (!cancelled) setMovementUsdc(balanceValue);
        } else if (!cancelled) {
          setMovementUsdc(0);
        }
      } catch {
        if (!cancelled) setMovementUsdc(0);
      } finally {
        if (!cancelled) setLoadingMovementBalance(false);
      }
    })();
    return () => {
      cancelled = true;
      setLoadingMovementBalance(false);
    };
  }, [open, authenticated, user, currentStep, paymentMethod, movementBalanceKey]);

  useEffect(() => {
    if (!open || !authenticated || !user || currentStep !== 2 || paymentMethod !== 'SOL') return;
    let cancelled = false;
    setLoadingSolanaBalance(true);
    (async () => {
      try {
        const addr = solanaAddrKey;
        if (!addr) {
          if (!cancelled) {
            setSolanaUsdc(0);
            setSolanaAddress('');
          }
          return;
        }
        if (!cancelled) setSolanaAddress(addr);
        const bal = await solanaWalletService.getBalance(addr);
        if (!cancelled) {
          setSolanaUsdc(Number.isFinite(bal.usdc) ? bal.usdc : 0);
        }
      } catch {
        if (!cancelled) setSolanaUsdc(0);
      } finally {
        if (!cancelled) setLoadingSolanaBalance(false);
      }
    })();
    return () => {
      cancelled = true;
      setLoadingSolanaBalance(false);
    };
  }, [open, authenticated, user, currentStep, paymentMethod, solanaAddrKey]);

  const handlePayAndPublish = () => {
    setCurrentStep(2);
  };

  const handlePay = async () => {
    const token = getAuthToken();
    if (!authenticated || !user || !token) {
      toast.error('Please login first');
      return;
    }

    let movementWallet = movementWalletQuery.data?.movementWallet ?? null;
    if (!movementWallet) {
      const fresh = await movementWalletQuery.refetch();
      movementWallet = fresh.data?.movementWallet ?? null;
    }

    if (paymentMethod === 'USDC') {
      if (!movementWallet?.address || !(movementWallet.publicKey || movementWallet.public_key)) {
        toast.error('Movement wallet not found. Please sync wallets in Profile.');
        return;
      }
    }

    setIsProcessing(true);
    let actualAdId: string;
    try {
      if (ensureDraftSaved) {
        const nextId = await ensureDraftSaved();
        if (!nextId) {
          toast.error('Draft not created. Please try again.');
          setIsProcessing(false);
          return;
        }
        actualAdId = String(nextId).replace('#', '');
      } else {
        if (!adsId) {
          toast.error('Invalid Ad Id. Please try again.');
          setIsProcessing(false);
          return;
        }
        actualAdId = String(adsId).replace('#', '');
      }
    } catch {
      toast.error('Failed to save draft before payment.');
      setIsProcessing(false);
      return;
    }

    try {
      if (paymentMethod === 'SOL') {
        if (!solanaPayWallet) {
          throw new Error('No Solana wallet found. Please connect a Solana wallet in Privy.');
        }
        const paymentResponse = await solanaPaymentService.createMarketplaceAdPayment(actualAdId, totalAmount);
        const paymentData = ((paymentResponse as { data?: unknown } | undefined)?.data ||
          paymentResponse) as Record<string, unknown>;
        const resolvedPaymentId =
          (paymentData.paymentId as string | undefined) ||
          (paymentData.payment as { paymentId?: string; id?: string } | undefined)?.paymentId ||
          (paymentData.payment as { id?: string } | undefined)?.id;
        if (String(paymentData.message || '').includes('No payment required')) {
          await invalidateMarketplaceQueries(queryClient);
          handleContinue();
          return;
        }
        const txBase64 = paymentData.transaction as string | undefined;
        if (!txBase64) {
          throw new Error(String(paymentData.message || 'Transaction data missing'));
        }
        const txHash = await signAndBroadcastSolanaPayPreferPrivyHook({
          unsignedTxBase64: txBase64,
          wallet: solanaPayWallet,
          signTransactionHook: privySignSolanaTransaction as unknown as PrivySolanaSignTransaction,
          rpcUrl: getDefaultSolanaRpcUrl(),
        });
        if (resolvedPaymentId) {
          await new Promise((r) => setTimeout(r, 3000));
          await solanaPaymentService.verifyMarketplaceAdPayment(resolvedPaymentId, txHash);
        }
        toast.success('Payment verified!');
        await invalidateMarketplaceQueries(queryClient);
        handleContinue();
        return;
      }

      if (!movementWallet?.address || !(movementWallet.publicKey || movementWallet.public_key)) {
        toast.error('Movement wallet not found. Please sync wallets in Profile.');
        setIsProcessing(false);
        return;
      }

      /** Marketplace ads pay: same routes as cto-test-frontend (`/ads/:id/pay` + `paymentChain`, verify on `/ads/payments/:id/verify`). */
      let paymentResult: unknown;
      try {
        paymentResult = await marketplaceService.createPayment(actualAdId, "MOVEMENT");
      } catch (createError) {
        let errorMsg = "Failed to create payment";
        if (createError instanceof Error) {
          errorMsg = createError.message || errorMsg;
        } else if (isApiError(createError)) {
          errorMsg = createError.message || errorMsg;
        }
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }

      /** Same field order as cto-test-frontend `MarketDashboard` Movement `handlePayment` (not `createMarketplaceAdPayment`, which is Solana). */
      const paymentResponse = paymentResult as Record<string, unknown>;
      const payment = paymentResponse?.payment as
        | { paymentId?: string; id?: string; transactionData?: unknown; transaction_data?: unknown }
        | undefined;
      const resolvedPaymentId =
        (paymentResponse?.paymentId as string | undefined) ||
        payment?.paymentId ||
        payment?.id;

      if (paymentResponse?.success === false) {
        toast.error(String(paymentResponse?.message || "Failed to create payment"));
        setIsProcessing(false);
        return;
      }

      if (
        paymentResponse?.message &&
        String(paymentResponse.message).includes("No payment required")
      ) {
        await invalidateMarketplaceQueries(queryClient);
        setCurrentStep(3);
        return;
      }

      const transactionData =
        payment?.transactionData ||
        payment?.transaction_data ||
        paymentResponse?.transactionData ||
        paymentResponse?.transaction_data;

      if (!transactionData || typeof transactionData !== "object") {
        console.warn("[AdPaymentDialog] Movement pay — missing transactionData", {
          keys: paymentResponse ? Object.keys(paymentResponse) : [],
          hasPayment: !!paymentResponse?.payment,
        });
        toast.error(String(paymentResponse?.message || "Transaction data missing"));
        setIsProcessing(false);
        return;
      }

      console.log("✅ Marketplace Movement payment data received:", paymentResponse);
      toast.success("Payment created! Signing transaction...");

      const publicKey = movementWallet.publicKey || movementWallet.public_key;
      if (!publicKey) {
        throw new Error("Public key not found in Movement wallet");
      }

      try {
        const txHash = await sendMovementTransaction(
          transactionData as {
            type: string;
            function: string;
            type_arguments: string[];
            arguments: string[];
          },
          movementWallet.address,
          publicKey,
          signRawHash,
        );

        console.log("✅ Movement transaction sent:", txHash);
        toast.success("Transaction submitted! Verifying payment...");

        await new Promise((resolve) => setTimeout(resolve, 3000));

        try {
          if (!resolvedPaymentId) {
            throw new Error("Payment id missing");
          }
          const verifyResult = await marketplaceService.verifyPayment(
            String(resolvedPaymentId),
            txHash,
          );

          const verifyData = ((verifyResult as { data?: unknown })?.data ?? verifyResult) as Record<
            string,
            unknown
          >;

          if (
            verifyData?.success &&
            (verifyData?.payment as { status?: string } | undefined)?.status === "COMPLETED"
          ) {
            toast.success("Payment verified!");
            await invalidateMarketplaceQueries(queryClient);
            setIsProcessing(false);
            setCurrentStep(3);
          } else {
            throw new Error("Payment verification failed");
          }
        } catch (verifyError) {
          console.error("Payment verification failed:", verifyError);
          let errorMsg = "Payment verification failed. Please try again.";
          if (verifyError instanceof Error) {
            errorMsg = verifyError.message || errorMsg;
          } else if (isApiError(verifyError)) {
            errorMsg = verifyError.message || errorMsg;
          }
          toast.error(errorMsg);
          setIsProcessing(false);
        }
      } catch (txError) {
        console.error("Transaction failed:", txError);
        const error = txError as Error;
        const errorMsg = error.message || "Transaction cancelled or failed";
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message :
        isApiError(error) ? error.message :
        'Payment failed';
      const friendlyMsg = /already initiated|pending payment|complete the pending|pending transaction/i.test(String(msg))
        ? 'This ad already has a pending payment. Complete the transaction in your wallet, or try again later.'
        : msg;
      toast.error(friendlyMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    onOpenChange(false);
    setCurrentStep(1);
    setAgreedToTerms(false);
    if (onPaymentSuccess) onPaymentSuccess();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCurrentStep(1);
      setAgreedToTerms(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#010101] border-white/20 text-white p-6 max-h-full overflow-auto hover-scrollbar">
        {currentStep === 1 && (
          <>
            <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b-[0.3px] border-white/20">
              <DialogTitle className="font-bold">Payment & Publish</DialogTitle>
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </DialogHeader>

            <div>
              <div className="text-center mb-5">
                <span className="text-white text-sm">Ad Id: {adsId}</span>
              </div>

              {breakdown && breakdown.length > 0 ? (
                <>
                  {breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center mb-3">
                      <span className="text-white">{item.label}</span>
                      <span className="text-[#FF9631] font-medium">${item.price}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white">Ad</span>
                  <span className="text-[#FF9631] font-medium">${adFee}</span>
                </div>
              )}

              <div className="border-t-[0.3px] border-white/20 my-4"></div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-medium">Total</span>
                <span className="text-[#FF9631] font-medium text-lg">${totalAmount}</span>
              </div>

              <div className="border-t-[0.3px] border-white/20 mb-3"></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="terms-ad"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="border-white/20"
                  />
                  <label htmlFor="terms-ad" className="text-sm text-white cursor-pointer">
                    I agree to the <span className="text-[#FF9631]">Community Rules</span>
                  </label>
                </div>
                <Button
                  onClick={handlePayAndPublish}
                  disabled={!agreedToTerms}
                  className="w-fit py-2.5 px-5 bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-[6px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay & Publish
                </Button>
              </div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b-[0.5px] border-white/20">
              <DialogTitle className="font-bold text-lg">Payment</DialogTitle>
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70 mb-2 block">Project Title</label>
                  <Input
                    value={projectTitle}
                    readOnly
                    disabled
                    className="bg-[#141414] border-none text-white"
                  />
                </div>

                <div className="border-t-[0.3px] border-white/20"></div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">Ad Id</label>
                  <Input
                    value={adsId}
                    readOnly
                    disabled
                    className="bg-[#141414] border-none max-w-[216px] text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">Total</label>
                  <Input
                    value={`$${totalAmount}`}
                    readOnly
                    disabled
                    className="bg-[#141414] max-w-[216px] border-none text-white"
                  />
                </div>
              </div>

              <div className="border-t-[0.3px] border-white/20"></div>

              <div>
                <h2 className="text-xs text-white/70 mb-2 block">Payment method</h2>
                <div className="flex-col sm:flex-row flex gap-3 justify-between h-fit">
                  <div>
                    <div className="pace-y-2 text-nowrap flex flex-col justify-between min-h-full  py-2 px-3 rounded-[6px] bg-[#141414]">
                      <label className={`flex items-center gap-2 ${solanaAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                        <input
                          type="radio"
                          name="paymentMethod-ad"
                          value="SOL"
                          checked={paymentMethod === 'SOL'}
                          onChange={() => {
                            userPickedPaymentRef.current = true;
                            setPaymentMethod('SOL');
                          }}
                          disabled={!solanaAvailable}
                          className="w-4 h-4 shrink-0"
                        />
                        <span className="text-[#8D8D8D] text-sm">
                          USDC on Solana{' '}
                          {!solanaAvailable ? (
                            <span className="text-[10px] text-amber-200/80"> · Unavailable</span>
                          ) : null}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod-ad"
                          value="USDC"
                          checked={paymentMethod === 'USDC'}
                          onChange={() => {
                            userPickedPaymentRef.current = true;
                            setPaymentMethod('USDC');
                          }}
                          className="w-4 h-4 shrink-0"
                        />
                        <span className="text-[#8D8D8D] text-sm">
                          USDC on Movement
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                        <input
                          type="radio"
                          name="paymentMethod-ad"
                          value="APT"
                          disabled
                          checked={false}
                          readOnly
                          className="w-4 h-4 shrink-0"
                        />
                        <span className="text-[#8D8D8D] text-sm">
                          APT <span className="text-[10px] text-white/35">· Coming soon</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 w-full sm:mt-0 p-4 py-2 px-3 rounded-[6px] bg-[#141414]">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="text-sm text-[#8D8D8D]">Your balance</span>
                      {isLoadingBalance ? (
                        <span className="text-sm text-[#8D8D8D]">Loading...</span>
                      ) : (
                        <span
                          className="text-sm font-medium tabular-nums"
                          style={{ color: displayUsdcBalance < totalAmount ? '#E23D3D' : '#3DE23D' }}
                        >
                          {displayUsdcBalance.toFixed(2)} USDC
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/40 mb-2">
                      {paymentMethod === 'SOL'
                        ? 'USDC on Solana (same as header balance for your Solana address).'
                        : 'USDC on Movement (linked Movement wallet).'}
                    </p>
                    {needsFund ? (
                      <div className="flex justify-end mb-2">
                        <button type="button" className="text-sm text-[#FF9631] underline">
                          Fund wallet
                        </button>
                      </div>
                    ) : null}
                    {needsFund && displayWalletAddress ? (
                      <div className="mt-1">
                        <div className="text-xs text-[#8D8D8D] mb-2">
                          Deposit address ({paymentMethod === 'SOL' ? 'Solana' : 'Movement'})
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/70 flex-1 truncate font-mono">
                            {displayWalletAddress.length > 20
                              ? `${displayWalletAddress.slice(0, 10)}...${displayWalletAddress.slice(-8)}`
                              : displayWalletAddress}
                          </span>
                          <button
                            type="button"
                            onClick={copyWalletAddress}
                            className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0"
                            title="Copy address"
                          >
                            {copiedAddress ? (
                              <Check size={14} className="text-[#16C784]" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : !needsFund ? (
                      <p className="text-xs text-[#8D8D8D] mt-2">
                        Balance covers this payment. By clicking &quot;Pay&quot;, ${totalAmount} USDC will be charged
                        {paymentMethod === 'SOL' ? ' on Solana' : ' on Movement'}.
                      </p>
                    ) : (
                      <p className="text-xs text-[#8D8D8D] mt-2">
                        Add USDC to the address above, then pay ${totalAmount}.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-[#FF9631]">
                Charges are in USDC. On Solana, keep a small SOL balance for transaction fees.
              </p>

              <div className="flex justify-center">
                <Button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-[6px] py-2.5 px-5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Pay'}
                </Button>
              </div>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <DialogHeader className="pb-4 border-b-[0.5px] border-white/20">
              <DialogTitle className="font-bold text-lg">All Set</DialogTitle>
            </DialogHeader>

            <div className="mt-8 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[#16C784]/20 flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#16C784] flex items-center justify-center">
                  <Check size={40} color="#010101" strokeWidth={4} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">Payment Successful</h2>

              <p className="text-sm text-white/70 text-center mb-8 max-w-sm">
                Congratulations! Your payment has been successful and your ad is being reviewed.
              </p>

              <Button
                onClick={handleContinue}
                className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-[6px] py-2.5 px-5 font-medium"
              >
                Continue
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
