"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
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
import { getMovementWallet, sendMovementTransaction } from '@/lib/movement-wallet';
import { getAuthToken, getUserId } from '@/lib/authSession';
import { getWalletsFromStorage } from '@/utils/localStorage';
import { toast } from 'react-toastify';
import axios from 'axios';
import type { BackendWallet } from '@/types/privy';
import marketplaceService from '@/services/marketplaceService';

interface AdPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle?: string;
  adsId: string;
  adFee?: number;
  /** Line items to show in step 1 (e.g. Category $5, Visibility: Plus $5, Auto-Bump $7). Total is sum of these. */
  breakdown?: { label: string; price: number }[];
  onPaymentSuccess?: () => void;
}

export default function AdPaymentDialog({
  open,
  onOpenChange,
  projectTitle = "Ad",
  adsId,
  adFee = 5,
  breakdown,
  onPaymentSuccess,
}: AdPaymentDialogProps) {
  const { user, authenticated } = usePrivy();
  const { signRawHash } = useSignRawHash();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'USDC' | 'APT' | 'SOL'>('USDC');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = breakdown && breakdown.length > 0
    ? breakdown.reduce((sum, item) => sum + item.price, 0)
    : adFee;

  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const fetchMovementWalletBalance = useCallback(async () => {
    if (!authenticated || !user) return;

    setIsLoadingBalance(true);
    try {
      let movementWallet = getMovementWallet(user);

      if (!movementWallet) {
        try {
          const { privyService } = await import('@/services/privyService');
          const walletResult = await privyService.getUserWallets();
          const wallets = (walletResult?.data?.wallets || walletResult?.wallets || []) as BackendWallet[];
          const dbWallet = wallets.find((w: BackendWallet) =>
            w.blockchain?.toUpperCase() === 'MOVEMENT' ||
            w.blockchain?.toUpperCase() === 'APTOS'
          );
          if (dbWallet) {
            movementWallet = {
              address: dbWallet.address,
              publicKey: dbWallet.publicKey || dbWallet.address,
              chainType: 'aptos'
            };
          }
        } catch (e) {
          // backend wallet check failed, continue without
        }
      }

      if (!movementWallet) {
        setWalletBalance(0);
        setWalletAddress('');
        setIsLoadingBalance(false);
        return;
      }

      setWalletAddress(movementWallet.address);

      let walletId: string | null = null;
      const userId = getUserId();
      let backendWallets: BackendWallet[] = [];
      try {
        const storedWallets = getWalletsFromStorage(userId);
        if (storedWallets) backendWallets = storedWallets as BackendWallet[];
      } catch (_) {}

      if (backendWallets.length === 0) {
        try {
          const token = getAuthToken();
          if (token) {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const response = await axios.get(
              `${backendUrl}/api/v1/auth/privy/wallets`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            if (response.data?.success && response.data?.wallets) {
              backendWallets = response.data.wallets;
            }
          }
        } catch (error) {
          // failed to fetch wallets from backend
        }
      }

      const backendWallet = backendWallets.find((w: BackendWallet) =>
        w.address?.toLowerCase() === movementWallet!.address.toLowerCase() &&
        (w.blockchain === 'MOVEMENT' || w.blockchain === 'APTOS' ||
          w.chainType?.toLowerCase() === 'aptos' || w.chainType?.toLowerCase() === 'movement')
      );

      if (backendWallet?.id) walletId = backendWallet.id;

      if (!walletId) {
        setWalletBalance(0);
        setIsLoadingBalance(false);
        return;
      }

      try {
        await movementWalletService.syncBalance(walletId, true);
      } catch (_) {}

      const balances = await movementWalletService.getBalance(walletId);
      const usdcBalance = balances.find(
        (b) => b.tokenSymbol?.toUpperCase() === 'USDC' ||
          b.tokenSymbol?.toUpperCase() === 'USDC.E' ||
          b.tokenAddress?.toLowerCase() === '0xb89077cfd2a82a0c1450534d49cfd5f2707643155273069bc23a912bcfefdee7'
      );

      if (usdcBalance) {
        const balanceValue = parseFloat(usdcBalance.balance) / Math.pow(10, usdcBalance.decimals);
        setWalletBalance(balanceValue);
      } else {
        setWalletBalance(0);
      }
    } catch (error) {
      setWalletBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [authenticated, user]);

  useEffect(() => {
    if (open && authenticated && user && currentStep === 2) {
      fetchMovementWalletBalance();
    }
  }, [open, authenticated, user, currentStep, fetchMovementWalletBalance]);

  const handlePayAndPublish = () => {
    setCurrentStep(2);
  };

  const handlePay = async () => {
    if (!adsId) {
      toast.error('Invalid Ad Id. Please try again.');
      return;
    }

    const actualAdId = String(adsId).replace('#', '');
    if (!authenticated || !user) {
      toast.error('Please login first');
      return;
    }

    let movementWallet = getMovementWallet(user);
    if (!movementWallet) {
      try {
        const { privyService } = await import('@/services/privyService');
        const walletResult = await privyService.getUserWallets();
        const wallets = (walletResult?.data?.wallets || walletResult?.wallets || []) as BackendWallet[];
        const dbWallet = wallets.find((w: BackendWallet) =>
          w.blockchain?.toUpperCase() === 'MOVEMENT' || w.blockchain?.toUpperCase() === 'APTOS'
        );
        if (dbWallet) {
          movementWallet = {
            address: dbWallet.address,
            publicKey: dbWallet.publicKey || dbWallet.address,
            chainType: 'aptos'
          };
        }
      } catch (_) {}
    }

    if (!movementWallet?.address || !(movementWallet.publicKey || movementWallet.public_key)) {
      toast.error('Movement wallet not found. Please sync wallets in Profile.');
      return;
    }

    setIsProcessing(true);
    try {
      const paymentResponse = await marketplaceService.createPayment(actualAdId) as Record<string, unknown> | undefined;
      const payment = paymentResponse?.payment as { paymentId?: string; id?: string; transactionData?: unknown; transaction_data?: unknown } | undefined;
      const resolvedPaymentId =
        (paymentResponse?.paymentId as string | undefined) ||
        payment?.paymentId ||
        payment?.id;

      if (paymentResponse?.message && String(paymentResponse.message).includes('No payment required')) {
        setCurrentStep(3);
        return;
      }

      const transactionData =
        payment?.transactionData ??
        payment?.transaction_data ??
        (paymentResponse?.transactionData as object | undefined) ??
        (paymentResponse?.transaction_data as object | undefined);

      if (!transactionData || typeof transactionData !== 'object') {
        throw new Error((paymentResponse?.message as string) || 'Transaction data missing');
      }

      const txHash = await sendMovementTransaction(
        transactionData as { type: string; function: string; type_arguments: string[]; arguments: string[] },
        movementWallet.address,
        movementWallet.publicKey || movementWallet.public_key!,
        signRawHash
      );

      if (resolvedPaymentId) {
        await marketplaceService.verifyPayment(String(resolvedPaymentId), txHash);
      }

      toast.success('Payment verified!');
      setCurrentStep(3);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message :
        axios.isAxiosError(error) ? (error.response?.data as { message?: string })?.message || error.message :
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
                <h2 className="text-sm text-white/70 mb-3 block">Payment Method</h2>
                <div className="flex-col sm:flex-row flex gap-3 justify-between h-fit">
                  <div>
                    <div className="space-y-2 text-nowrap flex flex-col justify-between min-h-full w-fit py-2 px-3 rounded-[6px] bg-[#141414]">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod-ad"
                          value="USDC"
                          checked={paymentMethod === 'USDC'}
                          onChange={() => setPaymentMethod('USDC')}
                          className="w-4 h-4"
                        />
                        <span className="text-[#8D8D8D]">Fund with USDC</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod-ad"
                          value="APT"
                          checked={paymentMethod === 'APT'}
                          onChange={() => setPaymentMethod('APT')}
                          className="w-4 h-4"
                        />
                        <span className="text-[#8D8D8D]">Fund with APT</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod-ad"
                          value="SOL"
                          checked={paymentMethod === 'SOL'}
                          onChange={() => setPaymentMethod('SOL')}
                          className="w-4 h-4"
                        />
                        <span className="text-[#8D8D8D]">Fund with Sol</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 w-full sm:mt-0 p-4 py-2 px-3 rounded-[6px] bg-[#141414]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#8D8D8D]">Your Wallet Balance:</span>
                      {isLoadingBalance ? (
                        <span className="text-sm text-[#8D8D8D]">Loading...</span>
                      ) : (
                        <span
                          className="text-sm font-medium"
                          style={{ color: walletBalance < totalAmount ? '#E23D3D' : '#3DE23D' }}
                        >
                          ${walletBalance.toFixed(2)} USDC
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button className="text-sm text-[#FF9631] underline">Fund Wallet</button>
                    </div>
                    {walletBalance < totalAmount && walletAddress ? (
                      <div className="mt-3">
                        <div className="text-xs text-[#8D8D8D] mb-2">Wallet Address</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/70 flex-1 truncate font-mono">
                            {walletAddress.length > 20
                              ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`
                              : walletAddress}
                          </span>
                          <button
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
                    ) : (
                      <p className="text-xs text-[#8D8D8D] mt-3">
                        By clicking &quot;Pay&quot;, the sum of ${totalAmount} will be charged from your wallet balance.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-[#FF9631]">
                This app uses USDC as the primary transaction token. Please ensure your wallet is funded.
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
