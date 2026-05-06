"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { movementPaymentService } from '@/services/movementPaymentService';
import { movementWalletService } from '@/services/movementWalletService';
import solanaPaymentService from '@/services/solanaPaymentService';
import { sendMovementTransaction } from '@/lib/movement-wallet';
import { getAuthToken } from '@/lib/authSession';
import { toast } from 'react-toastify';
import { useResolvedMovementWallet } from '@/hooks/useResolvedMovementWallet';
import { isApiError } from '@/lib/apiError';
import solanaWalletService from '@/services/solanaWalletService';
import {
  getPrivySolanaPayWallet,
  resolvePrivySolanaAddress,
  signAndBroadcastSolanaPayPreferPrivyHook,
  type PrivySolanaSignTransaction,
  type SolanaSignerWallet,
} from '@/lib/solanaTransaction';
import { getDefaultSolanaRpcUrl } from '@/lib/solanaRpc';
import { MoonLoader } from 'react-spinners';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle?: string;
  listingId: string; // Required - listing is created before opening dialog
  listingFee?: number;
  onPaymentSuccess?: () => void;
}

export default function PaymentDialog({
  open,
  onOpenChange,
  projectTitle = "Project Listing",
  listingId,
  listingFee = 5,
  onPaymentSuccess,
}: PaymentDialogProps) {
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
  const solanaPayWallet = useMemo(
    () => getPrivySolanaPayWallet(wallets as unknown[], solanaScopedWallets as unknown[] | undefined),
    [wallets, solanaScopedWallets],
  );
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

  const movementBalanceKey =
    movementWalletQuery.data?.walletId != null && String(movementWalletQuery.data.walletId) !== ''
      ? String(movementWalletQuery.data.walletId)
      : movementWalletQuery.data?.movementWallet?.address
        ? String(movementWalletQuery.data.movementWallet.address)
        : '';
  const solanaAddrKey = solanaDisplayAddress ?? '';

  const totalAmount = listingFee + 9; // Listing fee + ad boost (example)

  const displayUsdcBalance = paymentMethod === 'SOL' ? solanaUsdc : movementUsdc;
  const displayWalletAddress = paymentMethod === 'SOL' ? solanaAddress : movementAddress;
  const needsFund = displayUsdcBalance < totalAmount;
  const isLoadingBalance = paymentMethod === 'SOL' ? loadingSolanaBalance : loadingMovementBalance;

  // Copy wallet address to clipboard
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
  }, [
    open,
    authenticated,
    user,
    currentStep,
    paymentMethod,
    movementBalanceKey,
    movementWalletQuery.data,
    movementWalletQuery.refetch,
  ]);

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
    // Move to step 2 (Payment Details)
    setCurrentStep(2);
  };

  const handlePay = async () => {
    if (!listingId) {
      toast.error('Invalid listing ID. Please try again.');
      return;
    }

    const actualListingId = listingId.replace('#', '');

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

    try {
      if (paymentMethod === 'SOL') {
        if (!solanaPayWallet) {
          console.warn('[memecoin listing][Solana] aborted — no solanaPayWallet (Privy signer not resolved)');
          throw new Error('No Solana wallet found. Please enable Solana in Privy and connect a Solana wallet.');
        }
        const solWalletProbe: SolanaSignerWallet = solanaPayWallet;
        console.log('[memecoin listing][Solana] pay start', {
          listingId: actualListingId,
          walletAddress: solanaPayWallet.address,
          hasSignTransaction: typeof solWalletProbe.signTransaction === 'function',
          hasProviderSign: typeof solWalletProbe.provider?.signTransaction === 'function',
          rpcUrl: getDefaultSolanaRpcUrl(),
        });
        const paymentResult = await solanaPaymentService.createListingPayment(actualListingId);
        console.log('[memecoin listing][Solana] createListingPayment raw', paymentResult);
        const paymentData = ((paymentResult as { data?: unknown } | undefined)?.data ||
          paymentResult) as Record<string, unknown>;
        console.log('[memecoin listing][Solana] paymentData (unwrapped)', {
          success: paymentData?.success,
          message: paymentData?.message,
          paymentId: paymentData?.paymentId,
          transactionLen: typeof paymentData?.transaction === 'string' ? paymentData.transaction.length : null,
        });
        if (!paymentData?.success) {
          throw new Error(String(paymentData?.message || 'Failed to create payment'));
        }
        const txBase64 = paymentData.transaction as string | undefined;
        if (!txBase64) {
          throw new Error('Transaction data missing');
        }
        toast.success('Signing transaction with Privy Solana wallet...');
        console.log(
          '[memecoin listing][Solana] sign+broadcast: Privy useSignTransaction(bytes+chain) first (cto-test SolanaWalletActivity pattern)',
        );
        const txHash = await signAndBroadcastSolanaPayPreferPrivyHook({
          unsignedTxBase64: txBase64,
          wallet: solanaPayWallet,
          signTransactionHook: privySignSolanaTransaction as unknown as PrivySolanaSignTransaction,
          rpcUrl: getDefaultSolanaRpcUrl(),
        });
        console.log('[memecoin listing][Solana] tx signed, sent, confirmed', txHash);
        toast.success('Transaction submitted! Verifying payment...');
        // Wait before verify so the backend/indexer can see the Solana signature.
        await new Promise((r) => setTimeout(r, 3000));
        let verifyData: Record<string, unknown> | null = null;
        let pay: { status?: string } | undefined;
        for (let attempt = 0; attempt < 4; attempt += 1) {
          if (attempt > 0) {
            await new Promise((r) => setTimeout(r, 2000));
          }
          const verifyResult = await solanaPaymentService.verifyPayment(
            String(paymentData.paymentId),
            txHash,
          );
          console.log('[memecoin listing][Solana] verify raw', verifyResult);
          verifyData = ((verifyResult as { data?: unknown } | undefined)?.data || verifyResult) as Record<
            string,
            unknown
          >;
          pay = verifyData.payment as { status?: string } | undefined;
          const statusUp = String(pay?.status || '').toUpperCase();
          console.log('[memecoin listing][Solana] verify (unwrapped)', {
            attempt: attempt + 1,
            success: verifyData?.success,
            paymentStatus: pay?.status,
            message: verifyData?.message,
          });
          if (verifyData?.success && statusUp === 'COMPLETED') {
            break;
          }
        }
        const finalStatus = String(pay?.status || '').toUpperCase();
        if (verifyData?.success && finalStatus === 'COMPLETED') {
          toast.success('Payment confirmed! Listing is now published!');
          console.log('[memecoin listing][Solana] done — success');
          setIsProcessing(false);
          handleContinue();
          return;
        }
        toast.error('Payment verification failed. Please try again.');
        console.warn('[memecoin listing][Solana] verify did not reach COMPLETED after retries');
        setIsProcessing(false);
        return;
      }

      if (!movementWallet?.address || !(movementWallet.publicKey || movementWallet.public_key)) {
        toast.error('No Movement wallet found. Please go to Profile and click "Sync Wallets".');
        setIsProcessing(false);
        return;
      }

      
      let paymentResult;
      try {
        paymentResult = await movementPaymentService.createListingPayment(actualListingId);
      } catch (createError) {
        let errorMsg = 'Failed to create payment';
        if (createError instanceof Error) {
          errorMsg = createError.message || errorMsg;
        } else if (isApiError(createError)) {
          errorMsg = createError.message || errorMsg;
        }
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }
      
      // Handle wrapped response
      const paymentData = ((paymentResult as { data?: unknown } | undefined)?.data ?? paymentResult) as Record<string, unknown>;

      if (!paymentData?.success) {
        toast.error(String(paymentData?.message || 'Failed to create payment'));
        setIsProcessing(false);
        return;
      }

      console.log('✅ Movement payment data received:', paymentData);
      console.log('💳 Payment ID:', paymentData.paymentId);
      toast.success('Payment created! Signing transaction...');

      // Get wallet public key
      const publicKey = movementWallet.publicKey || movementWallet.public_key;
      if (!publicKey) {
        throw new Error('Public key not found in Movement wallet');
      }

      // Send Movement transaction
      const transactionData = paymentData.transactionData as {
        type: string;
        function: string;
        type_arguments: string[];
        arguments: string[];
      };
      
      try {
        const txHash = await sendMovementTransaction(
          transactionData,
          movementWallet.address,
          publicKey,
          signRawHash
        );

        console.log('✅ Movement transaction sent:', txHash);
        toast.success('Transaction submitted! Verifying payment...');

        // Wait a bit for transaction to be processed, then verify
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verify payment with backend
        try {
          const verifyResult = await movementPaymentService.verifyPayment(
            String(paymentData.paymentId),
            txHash
          );

          // Handle wrapped response
          const verifyData = ((verifyResult as { data?: unknown })?.data ?? verifyResult) as Record<string, unknown>;

          if (verifyData?.success && (verifyData?.payment as { status?: string } | undefined)?.status === 'COMPLETED') {
            toast.success('Payment verified!');
            setIsProcessing(false);
            setCurrentStep(3);
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (verifyError) {
          console.error('Payment verification failed:', verifyError);
          let errorMsg = 'Payment verification failed. Please try again.';
          if (verifyError instanceof Error) {
            errorMsg = verifyError.message || errorMsg;
          } else if (isApiError(verifyError)) {
            errorMsg = verifyError.message || errorMsg;
          }
          toast.error(errorMsg);
          setIsProcessing(false);
        }
      } catch (txError) {
        console.error('Transaction failed:', txError);
        const error = txError as Error;
        const errorMsg = error.message || 'Transaction cancelled or failed';
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      // This catch handles any unexpected errors not caught above
      console.error(
        paymentMethod === 'SOL' ? '[memecoin listing][Solana] flow error' : 'Unexpected payment error:',
        error,
      );
      let errorMsg = 'Payment failed';
      if (error instanceof Error) {
        errorMsg = error.message || errorMsg;
      } else if (isApiError(error)) {
        errorMsg = error.message || errorMsg;
      }
      toast.error(errorMsg);
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    // Close dialog and proceed to step 4
    onOpenChange(false);
    setCurrentStep(1);
    setAgreedToTerms(false);
    // Trigger step 4 in parent component
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when closing
    setTimeout(() => {
      setCurrentStep(1);
      setAgreedToTerms(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#010101] border-white/20 text-white p-6 max-h-full overflow-auto hover-scrollbar">
        {currentStep === 1 && (
          // Step 1: Payment & Publish
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
                <span className="text-white text-sm">Listing ID: {listingId}</span>
              </div>

              {/* Listing Fee */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-white">Listing</span>
                <span className="text-[#FF9631] font-medium">${listingFee}</span>
              </div>

              {/* Separator */}
              <div className="border-t-[0.3px] border-white/20 my-4"></div>

              {/* Total */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-medium">Total</span>
                <span className="text-[#FF9631] font-medium text-lg">${totalAmount}</span>
              </div>

              {/* Separator */}
              <div className="border-t-[0.3px] border-white/20 mb-3"></div>

              <div className='flex items-center justify-between'>
                {/* Agreement Checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="border-white/20"
                />
                <label htmlFor="terms" className="text-sm text-white cursor-pointer">
                  I agree to the <span className="text-[#FF9631]">Community Rules</span>
                </label>
              </div>

              {/* Pay & Publish Button */}
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
          // Step 2: Payment Details
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
              {/* Project Details */}
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

                {/* Separator */}
              <div className="border-t-[0.3px] border-white/20"></div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">Listing ID</label>
                  <Input
                    value={listingId}
                    readOnly
                    disabled
                    className="bg-[#141414] border-none max-w-[216px] text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">Listing Fee</label>
                  <Input
                    value={`$${listingFee}`}
                    readOnly
                    disabled
                    className="bg-[#141414] max-w-[216px] border-none text-white"
                  />
                </div>
              </div>

              {/* Separator */}
              <div className="border-t-[0.3px] border-white/20"></div>

              {/* Payment Method */}
              <div>
              <h2 className="text-sm text-white/70 mb-3 block">Payment Method</h2>
              <div className="flex-col sm:flex-row flex gap-3 justify-between h-fit">
                <div>
                <div className="space-y-2 text-nowrap flex flex-col justify-between min-h-full  py-2 px-3 rounded-[6px] bg-[#141414]">
                  <label className={`flex items-center gap-2 ${solanaAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                    <input
                      type="radio"
                      name="paymentMethod-listing"
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
                      name="paymentMethod-listing"
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
                      name="paymentMethod-listing"
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
                  <div className="flex flex-col justify-between mb-1 gap-2">
                    <p className="text-sm text-[#8D8D8D]">Your balance</p>
                    {isLoadingBalance ? (
                      // <span className="text-sm text-[#8D8D8D]">Loading...</span>
                      <MoonLoader size={10} color="#8D8D8D" />
                    ) : (
                      <span
                        className="text-sm block font-medium tabular-nums"
                        style={{ color: displayUsdcBalance < totalAmount ? '#E23D3D' : '#3DE23D' }}
                      >
                        {displayUsdcBalance.toFixed(2)} USDC
                      </span>
                    )}
                  </div>
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

              {/* Footer Note */}
              <p className="text-[10px] text-[#FF9631]">
                Charges are in USDC. On Solana, keep a small SOL balance for transaction fees.
              </p>

              {/* Pay Button */}
              <div className='flex justify-center'>
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
          // Step 3: Payment Successful
          <>
            <DialogHeader className="pb-4 border-b-[0.5px] border-white/20">
              <DialogTitle className="font-bold text-lg">All Set</DialogTitle>
            </DialogHeader>

            <div className="mt-8 flex flex-col items-center">
              {/* Success Icon */}
              <div className="w-24 h-24 rounded-full bg-[#16C784]/20 flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#16C784] flex items-center justify-center">
                  <Check size={40} color="#010101" strokeWidth={4} />
                </div>
              </div>

              {/* Success Title */}
              <h2 className="text-2xl font-bold text-white mb-3">Payment Successful</h2>

              {/* Success Message */}
              <p className="text-sm text-white/70 text-center mb-8 max-w-sm">
                Congratulations! Your payment has been successful and your listing is being reviewed
              </p>

              {/* Continue Button */}
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
