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
import { movementPaymentService } from '@/services/movementPaymentService';
import { movementWalletService } from '@/services/movementWalletService';
import { getMovementWallet, sendMovementTransaction } from '@/lib/movement-wallet';
import { getWalletsFromStorage } from '@/utils/localStorage';
import { toast } from 'react-toastify';
import axios, { AxiosError } from 'axios';
import type { BackendWallet } from '@/types/privy';

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
  const { signRawHash } = useSignRawHash();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'USDC' | 'APT' | 'SOL'>('USDC');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [adsId] = useState('#456789'); // This should come from backend after listing creation
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = listingFee + 9; // Listing fee + ad boost (example)

  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  // Fetch Movement wallet USDC balance
  const fetchMovementWalletBalance = useCallback(async () => {
    if (!authenticated || !user) {
      return;
    }

    setIsLoadingBalance(true);
    try {
      // Get Movement wallet from Privy
      let movementWallet = getMovementWallet(user);

      // If not found in Privy, check backend
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
          console.warn('Backend wallet check failed', e);
        }
      }

      if (!movementWallet) {
        console.warn('No Movement wallet found for balance check');
        setWalletBalance(0);
        setWalletAddress('');
        setIsLoadingBalance(false);
        return;
      }

      // Store wallet address
      setWalletAddress(movementWallet.address);

      // Get wallet ID from backend
      let walletId: string | null = null;
      
      // Try to get wallets from localStorage first
      const userId = localStorage.getItem('cto_user_id');
      let backendWallets: BackendWallet[] = [];
      try {
        const storedWallets = getWalletsFromStorage(userId);
        if (storedWallets) {
          backendWallets = storedWallets as BackendWallet[];
        }
      } catch (error) {
        console.warn('Failed to get wallets from storage:', error);
      }

      // If not in localStorage, fetch from backend
      if (backendWallets.length === 0) {
        try {
          const token = localStorage.getItem('cto_auth_token');
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
          console.error('Failed to fetch wallets from backend:', error);
        }
      }

      // Find Movement wallet in backend wallets by address
      const backendWallet = backendWallets.find((w: BackendWallet) => 
        w.address?.toLowerCase() === movementWallet.address.toLowerCase() &&
        (w.blockchain === 'MOVEMENT' || w.blockchain === 'APTOS' || 
         w.chainType?.toLowerCase() === 'aptos' || w.chainType?.toLowerCase() === 'movement')
      );

      if (backendWallet?.id) {
        walletId = backendWallet.id;
      }

      if (!walletId) {
        console.warn('Movement wallet ID not found, cannot fetch balance');
        setWalletBalance(0);
        setIsLoadingBalance(false);
        return;
      }

      // Sync balance first to ensure it's up to date
      try {
        await movementWalletService.syncBalance(walletId, true); // testnet = true
      } catch (syncError) {
        console.warn('Failed to sync Movement wallet balance:', syncError);
        // Continue to getBalance even if sync fails
      }

      // Get balance from backend
      const balances = await movementWalletService.getBalance(walletId);

      // Find USDC balance specifically
      const usdcBalance = balances.find(
        (b) => b.tokenSymbol?.toUpperCase() === 'USDC' || 
               b.tokenSymbol?.toUpperCase() === 'USDC.E' ||
               b.tokenAddress?.toLowerCase() === '0xb89077cfd2a82a0c1450534d49cfd5f2707643155273069bc23a912bcfefdee7'
      );

      if (usdcBalance) {
        // Convert from token units to human-readable (divide by 10^decimals)
        const balanceValue = parseFloat(usdcBalance.balance) / Math.pow(10, usdcBalance.decimals);
        setWalletBalance(balanceValue);
      } else {
        // No USDC balance found
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Failed to fetch Movement wallet balance:', error);
      setWalletBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [authenticated, user]);

  // Fetch balance when dialog opens and user is authenticated
  useEffect(() => {
    if (open && authenticated && user && currentStep === 2) {
      fetchMovementWalletBalance();
    }
  }, [open, authenticated, user, currentStep, fetchMovementWalletBalance]);

  const handlePayAndPublish = () => {
    // Move to step 2 (Payment Details)
    setCurrentStep(2);
  };

  const handlePay = async () => {
    if (!listingId) {
      toast.error('Invalid listing ID. Please try again.');
      return;
    }

    // Extract actual listing ID (remove # if present)
    const actualListingId = listingId.replace('#', '');

    // Check both Privy authentication and localStorage token
    const token = localStorage.getItem('cto_auth_token');
    if (!authenticated || !user || !token) {
      console.error('❌ Payment blocked - Auth check failed:', {
        authenticated,
        hasUser: !!user,
        hasToken: !!token,
        tokenLength: token?.length || 0,
      });
      toast.error('Please login first');
      return;
    }

    console.log('✅ Payment auth check passed:', {
      authenticated,
      hasUser: !!user,
      hasToken: !!token,
      userId: user?.id,
    });

    setIsProcessing(true);

    try {
      // Check if user has Movement wallet
      let movementWallet = getMovementWallet(user);

      // --- RESILIENCE: If frontend doesn't see it, check the backend/DB ---
      if (!movementWallet) {
        console.log('🔍 Wallet not in Privy object, checking backend DB...');
        try {
          // Import privyService dynamically to avoid circular dependencies
          const { privyService } = await import('@/services/privyService');
          const walletResult = await privyService.getUserWallets();
          const wallets = (walletResult?.data?.wallets || walletResult?.wallets || []) as BackendWallet[];
          const dbWallet = wallets.find((w: BackendWallet) => 
            w.blockchain?.toUpperCase() === 'MOVEMENT' || 
            w.blockchain?.toUpperCase() === 'APTOS'
          );
          
          if (dbWallet) {
            console.log('✅ Found wallet in DB:', dbWallet.address);
            // Use the DB wallet details as a fallback
            movementWallet = {
              address: dbWallet.address,
              publicKey: dbWallet.publicKey || dbWallet.address, // Fallback if pubkey missing
              chainType: 'aptos'
            };
          }
        } catch (e) {
          console.warn('Backend wallet check failed', e);
        }
      }

      if (!movementWallet) {
        toast.error('No Movement wallet found. Please go to Profile and click "Sync Wallets".');
        setIsProcessing(false);
        return;
      }

      console.log('💼 Using Movement wallet:', {
        address: movementWallet.address,
        hasPublicKey: !!movementWallet.publicKey,
        chainType: movementWallet.chainType
      });

      // Create payment
      console.log('💳 Creating Movement payment for listing:', actualListingId);
      
      let paymentResult;
      try {
        paymentResult = await movementPaymentService.createListingPayment(actualListingId);
      } catch (createError) {
        let errorMsg = 'Failed to create payment';
        if (createError instanceof Error) {
          errorMsg = createError.message || errorMsg;
        } else if (axios.isAxiosError(createError)) {
          errorMsg = (createError.response?.data as { message?: string })?.message || createError.message || errorMsg;
        }
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }
      
      // Handle wrapped response
      const paymentData = paymentResult?.data || paymentResult;

      if (!paymentData?.success) {
        toast.error(paymentData?.message || 'Failed to create payment');
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
      const transactionData = paymentData.transactionData;
      
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
            paymentData.paymentId,
            txHash
          );

          // Handle wrapped response
          const verifyData = verifyResult?.data || verifyResult;

          if (verifyData?.success && verifyData?.payment?.status === 'COMPLETED') {
            toast.success('Payment verified!');
            setIsProcessing(false);
            // Move to step 3 (Success)
            setCurrentStep(3);
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (verifyError) {
          console.error('Payment verification failed:', verifyError);
          let errorMsg = 'Payment verification failed. Please try again.';
          if (verifyError instanceof Error) {
            errorMsg = verifyError.message || errorMsg;
          } else if (axios.isAxiosError(verifyError)) {
            errorMsg = (verifyError.response?.data as { message?: string })?.message || verifyError.message || errorMsg;
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
      console.error('Unexpected payment error:', error);
      let errorMsg = 'Payment failed';
      if (error instanceof Error) {
        errorMsg = error.message || errorMsg;
      } else if (axios.isAxiosError(error)) {
        errorMsg = (error.response?.data as { message?: string })?.message || error.message || errorMsg;
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
      <DialogContent className="bg-[#010101] border-white/20 text-white p-6 max-h-full overflow-auto">
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
              {/* Ads ID */}
              <div className="text-center mb-5">
                <span className="text-white text-sm">Ads ID: {adsId}</span>
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
              <div className='flex-col sm:flex-row flex gap-3 justify-between h-fit'>
                <div>
                <label className="text-sm text-white/70 mb-3 hidden">Payment Method</label>
                <div className="space-y-2 text-nowrap flex flex-col justify-between min-h-full w-fit py-2 px-3 rounded-[6px] bg-[#141414]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
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
                      name="paymentMethod"
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
                      name="paymentMethod"
                      value="SOL"
                      checked={paymentMethod === 'SOL'}
                      onChange={() => setPaymentMethod('SOL')}
                      className="w-4 h-4"
                    />
                    <span className="text-[#8D8D8D]">Fund with Sol</span>
                  </label>
                </div>
                </div>

                {/* Wallet Balance Box */}
                <div className="mt-4 w-full sm:mt-0 p-4 py-2 px-3 rounded-[6px] bg-[#141414]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#8D8D8D]">Your Wallet Balance:</span>
                    {isLoadingBalance ? (
                      <span className="text-sm text-[#8D8D8D]">Loading...</span>
                    ) : (
                      <span 
                        className="text-sm font-medium"
                        style={{ color: walletBalance < listingFee ? '#E23D3D' : '#3DE23D' }}
                      >
                        ${walletBalance.toFixed(2)} USDC
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button className="text-sm text-[#FF9631] underline">Fund Wallet</button>
                  </div>
                  {walletBalance < listingFee && walletAddress ? (
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
                      By Clicking on &quot;Pay&quot;, the sum of ${listingFee} will be charged from your wallet balance.
                    </p>
                  )}
                </div>
              </div>
              </div>

              {/* Footer Note */}
              <p className="text-[10px] text-[#FF9631]">
                This app uses USDC as the primary transaction token. Please ensure your wallet is funded.
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
