"use client";

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Check, Ellipsis, Search, X, Zap } from 'lucide-react'
import { usePrivyAuth } from '@/hooks/usePrivyAuth'
import { toast } from 'react-toastify'
import { isApiError } from '@/lib/apiError';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
  } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"
import { clearSessionStorage } from '@/lib/authSession';
import { userListingsService, ScanResult } from '@/services/userListingsService';
import dynamic from 'next/dynamic';

/** Lazy: Solana + Movement payment stack (~1MB+) only when pay dialog opens. */
const PaymentDialog = dynamic(() => import('./PaymentDialog'), { ssr: false });

interface Step1Props {
  selectedNetwork: string;
  setSelectedNetwork: (network: string) => void;
  networkDialogueOpen: boolean;
  setNetworkDialogueOpen: (open: boolean) => void;
  networks: Array<{
    name: string;
    src: string;
  }>;
  setCurrentStep: (step: number) => void;
  onScanResultChange?: (result: ScanResult | null) => void;
  onContractAddressChange?: (address: string) => void;
  /** Parent-held values when resuming a draft or returning from later steps. */
  restoredContractAddress?: string;
  restoredScanResult?: ScanResult | null;
}

const info = [
  {
      description: "Fetching real-time token metadata",
      image: "/Overlay.svg"
  },
  {
      description: "Analyzing smart contract security",
      image: "/Overlay-1.svg"
  },
  {
      description: "Checking liquidity & holder activity",
      image: "/Overlay-2.svg"
  },
  {
      description: "Calculating final risk score",
      image: "/Overlay-3.svg"
  },
]

// Helper function to get tier display info
export const getTierInfo = (tier: string | undefined) => {
  const tierStr = (tier || '').toLowerCase();
  const tierIcons: Record<string, string> = {
    stellar: "/project-categories/stellar.png",
    bloom: "/project-categories/bloom.png",
    sprout: "/project-categories/sprout.png",
    seed: "/project-categories/seed.png",
  };
  const tierBgColors: Record<string, string> = {
    seed: "bg-[#6D6D6D]/20",
    sprout: "bg-[#FF5900]/20",
    bloom: "bg-[#15FF00]/20",
    stellar: "bg-[#FFBB00]/20",
  };
  const tierTextColors: Record<string, string> = {
    seed: "text-[#6D6D6D]",
    sprout: "text-[#FF5900]",
    bloom: "text-[#15FF00]",
    stellar: "text-[#FFBB00]",
  };
  const tierNames: Record<string, string> = {
    seed: "Seed",
    sprout: "Sprout",
    bloom: "Bloom",
    stellar: "Stellar",
  };
  return {
    icon: tierIcons[tierStr] || "/project-categories/sprout.png",
    bgColor: tierBgColors[tierStr] || "bg-[#FF5900]/20",
    textColor: tierTextColors[tierStr] || "text-[#FF5900]",
    name: tierNames[tierStr] || "Sprout",
  };
};

// Helper function to get risk score color
export const getRiskScoreColor = (score: number) => {
  if (score >= 80) return "text-[#0B8700]";
  if (score >= 60) return "text-[#FFCB45]";
  return "text-[#FF3939]";
};

// Helper function to get risk score icon
export const getRiskScoreIcon = (score: number) => {
  if (score >= 80) return "/risk-score/good.svg";
  if (score >= 60) return "/risk-score/medium.svg";
  return "/risk-score/bad.svg";
};

// Helper function to format currency
export const formatCurrency = (value: number | undefined) => {
  if (!value) return "N/A";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

// Helper function to format number
export const formatNumber = (value: number | undefined) => {
  if (!value && value !== 0) return "N/A";
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toLocaleString();
};

export default function Step1({ 
  selectedNetwork, 
  setSelectedNetwork, 
  networkDialogueOpen, 
  setNetworkDialogueOpen, 
  networks,
  setCurrentStep,
  onScanResultChange,
  onContractAddressChange,
  restoredContractAddress = '',
  restoredScanResult = null,
}: Step1Props) {
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanComplete, setScanComplete] = useState(() => Boolean(restoredScanResult));
  const [progress, setProgress] = useState(() => (restoredScanResult ? 100 : 0));
  const [contractAddress, setContractAddress] = useState(() =>
    (restoredContractAddress ?? '').trim(),
  );
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(() => restoredScanResult ?? null);
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });
  
  const router = useRouter();
  const { isAuthenticated } = usePrivyAuth();

  /** Matches cto-test-frontend: backend threshold; 50 only when API omits minimum_required_score */
  const minRequiredScore =
    scanResult?.minimum_required_score ??
    scanResult?.details?.minimum_required_score ??
    (scanResult?.details?.details as { minimum_required_score?: number } | undefined)
      ?.minimum_required_score ??
    50;

  const backendEligible =
    scanResult?.eligible === true ||
    scanResult?.details?.eligible === true ||
    (scanResult?.details?.details as { eligible?: boolean } | undefined)
      ?.eligible === true;

  const provisional =
    scanResult?.provisional ??
    scanResult?.details?.provisional ??
    false;

  const provisionalReason =
    scanResult?.provisional_reason ??
    scanResult?.details?.provisional_reason ??
    null;

  const provisionalMissingData = useMemo(() => {
    const fromRoot = scanResult?.provisional_missing_data;
    if (Array.isArray(fromRoot) && fromRoot.length > 0) return fromRoot;

    const fromDetails = scanResult?.details?.provisional_missing_data;
    if (Array.isArray(fromDetails) && fromDetails.length > 0) return fromDetails;

    const fromVetting =
      scanResult?.metadata?.vetting_results?.missingData ??
      scanResult?.details?.metadata?.vetting_results?.missingData ??
      scanResult?.details?.details?.metadata?.vetting_results?.missingData;
    if (Array.isArray(fromVetting) && fromVetting.length > 0) return fromVetting;

    return [];
  }, [scanResult]);

  const selectedNetworkMeta = useMemo(
    () =>
      networks.find(
        (n) => n.name.toLowerCase() === selectedNetwork.toLowerCase(),
      ),
    [networks, selectedNetwork],
  );

  const placeholderText = useMemo(() => {
    const n = selectedNetwork.toLowerCase();
    if (n === "aptos" || n === "movement") {
      return "Enter Aptos coin type (0x...::module::Coin) or metadata address (0x...)";
    }
    if (n === "solana") {
      return "Enter Solana contract address (base58, 32-44 chars)";
    }
    if (n === "bnb" || n === "base" || n === "monad") {
      return `Enter ${selectedNetwork.toUpperCase()} contract address (0x..., 42 chars)`;
    }
    return "Enter contract address";
  }, [selectedNetwork]);

  // Validation function for contract addresses based on chain
  const validateContractAddress = (address: string, network: string): { isValid: boolean | null; message: string } => {
    if (!address.trim()) {
      return { isValid: null, message: '' };
    }

    const trimmedAddress = address.trim();
    const networkLower = network.toLowerCase();

    const aptosCoinTypeRegex =
      /^0x[a-fA-F0-9]{1,64}::[A-Za-z_][A-Za-z0-9_]*::[A-Za-z_][A-Za-z0-9_]*$/;
    const aptosHexRegex = /^0x[a-fA-F0-9]{1,64}$/;
    const solanaPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    const evmPattern = /^0x[a-fA-F0-9]{40}$/;

    // Solana: Base58 encoded, 32-44 characters
    if (networkLower === 'solana') {
      if (solanaPattern.test(trimmedAddress)) {
        return { isValid: true, message: 'This contract is valid. Proceed to scan' };
      } else {
        return { isValid: false, message: 'Invalid address format. Please enter a correct Solana contract address' };
      }
    }

    // Aptos/Movement: support coin type (0x...::module::Coin) OR metadata address (0x...)
    if (networkLower === 'aptos' || networkLower === 'movement') {
      if (aptosCoinTypeRegex.test(trimmedAddress) || aptosHexRegex.test(trimmedAddress)) {
        return { isValid: true, message: 'This contract is valid. Proceed to scan' };
      } else {
        return { isValid: false, message: 'Use Aptos format: 0x...::module::CoinName or 0x... metadata address' };
      }
    }

    // BNB (BSC), Base, Monad: EVM format, hex starting with 0x, 42 characters
    if (networkLower === 'bnb' || networkLower === 'base' || networkLower === 'monad') {
      if (evmPattern.test(trimmedAddress)) {
        return { isValid: true, message: 'This contract is valid. Proceed to scan' };
      } else {
        const networkName = networkLower === 'bnb' ? 'BNB' : networkLower.charAt(0).toUpperCase() + networkLower.slice(1);
        return { isValid: false, message: `Invalid address format. Please enter a correct ${networkName} contract address` };
      }
    }

    // Default: accept any non-empty string (for unknown networks)
    if (trimmedAddress.length > 0) {
      return { isValid: true, message: 'This contract is valid. Proceed to scan' };
    }

    return { isValid: false, message: 'Invalid address format' };
  };

  useEffect(() => {
    const addr = contractAddress.trim();
    if (!addr) {
      setAddressValidation({ isValid: null, message: '' });
      return;
    }
    setAddressValidation(validateContractAddress(contractAddress, selectedNetwork));
  }, [contractAddress, selectedNetwork]);

  // Handle address input change with validation
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setContractAddress(value);
    
    // Pass to parent component
    if (onContractAddressChange) {
      onContractAddressChange(value);
    }
    
    if (value.trim()) {
      const validation = validateContractAddress(value, selectedNetwork);
      setAddressValidation(validation);
    } else {
      setAddressValidation({ isValid: null, message: '' });
    }
  };

  const startScan = async () => {
    if (!contractAddress.trim()) {
      toast.error('Please enter a contract address');
      return;
    }

    const validation = validateContractAddress(contractAddress, selectedNetwork);
    if (validation.isValid === false) {
      toast.error(validation.message || 'Invalid contract address format');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login first to scan tokens');
      return;
    }

    setScanComplete(false);
    setProgress(0);
    
    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Stop at 90% until API call completes
          }
          return prev + 2;
        });
      }, 100);

      // Use userListingsService to scan token
      // Note: Uses contractAddr (not contractAddress) and chain (not network)
      // Convert selectedNetwork to uppercase chain format (e.g., "aptos" -> "APTOS", "solana" -> "SOLANA")
      const chain = selectedNetwork.toUpperCase();
      
      const scanResult = await userListingsService.scan(contractAddress.trim(), chain);
      
      // Store scan result for use in payment dialog
      setScanResult(scanResult);
      // Also pass to parent component for Step4
      if (onScanResultChange) {
        onScanResultChange(scanResult);
      }
      
      // Complete progress animation
      setProgress(100);
      setTimeout(() => {
        setScanComplete(true);
      }, 500);

    } catch (error) {
      // On 401, clear session and redirect (match cto-test-frontend)
      const is401 = isApiError(error) && error.status === 401;
      const isUnauthorized = error instanceof Error && error.message === 'Unauthorized';
      if (is401 || isUnauthorized) {
        if (typeof window !== 'undefined') {
          clearSessionStorage();
        }
        toast.error('Session expired. Please sign in again.');
        router.push('/');
        setProgress(0);
        setScanComplete(false);
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Scan failed: ${errorMessage}. Please try again.`);

      setProgress(0);
      setScanComplete(false);
    }
  };

  return (
    <>
      <h2 className="font-bold text-[18px] text-center mb-2">
        Scan Token Contract
      </h2>
      <p className="text-sm text-white/70 text-center">
        Select network & paste contract address to begin
      </p>

      <Select
        defaultOpen={networkDialogueOpen}
        onOpenChange={(open) => setNetworkDialogueOpen(open)}
        value={selectedNetwork}
        onValueChange={(value) => {
          setSelectedNetwork(value);
          // Re-validate address when network changes
          if (contractAddress.trim()) {
            const validation = validateContractAddress(contractAddress, value);
            setAddressValidation(validation);
          }
        }}
      >
        <SelectTrigger className="w-full mt-6 h-10 rounded-lg border-[0.2px] border-[#FFFFFF20]">
          <div className="w-full flex items-center justify-between gap-2 pr-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {selectedNetworkMeta ? (
                <>
                  <Image
                    src={selectedNetworkMeta.src}
                    alt=""
                    className="size-6 shrink-0 rounded-full border-[0.3px] border-[#FFFFFF]"
                    width={24}
                    height={24}
                  />
                  <span className="font-medium truncate text-left">
                    {selectedNetworkMeta.name}
                  </span>
                </>
              ) : (
                <span className="font-medium text-white/60">Select network</span>
              )}
            </div>
          </div>
        </SelectTrigger>
        <SelectContent
          align="end"
          className="bg-[#010101] text-white border-[0.2px] p-4 border-[#FFFFFF20]"
        >
          <div className="pb-2 mb-4 border-b-[0.5px] border-[#FFFFFF20]">
            <span className="text-white font-bold">Network</span>
          </div>
          <SelectGroup className="flex flex-col gap-2.5">
            {networks.map((network, index) => (
              <SelectItem
                className="p-2 w-full rounded-lg flex items-center relative"
                key={index}
                value={network.name.toLowerCase()}
              >
                <div className="flex items-center gap-2">
                  <Image
                    className="size-6 rounded-full border-[0.3px] border-[#FFFFFF]"
                    src={network.src}
                    alt={`${network.name}-img`}
                    width={24}
                    height={24}
                  />
                  {network.name}
                </div>{" "}
                {selectedNetwork === network.name.toLowerCase() && (
                  <Check className="absolute right-2" size={16} />
                )}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="mt-4">
        <div className="relative flex items-center">
          <Input
            placeholder={placeholderText}
            className={`border-[0.2px] h-12 py-3 px-2 pr-12 bg-white/5 rounded-lg text-white placeholder:text-white/50 ${
              addressValidation.isValid === true
                ? 'border-[#16C784]'
                : addressValidation.isValid === false
                ? 'border-[#FF3939]'
                : 'border-white/20'
            }`}
            value={contractAddress}
            onChange={handleAddressChange}
          />
          <div className="absolute right-2 flex items-center gap-2">
            {addressValidation.isValid !== null && (
              <div className={`size-6 rounded flex items-center justify-center ${
                addressValidation.isValid ? 'bg-[#16C784]/20' : 'bg-[#FF3939]/20'
              }`}>
                {addressValidation.isValid ? (
                  <Check size={16} color="#16C784" />
                ) : (
                  <X size={16} color="#FF3939" />
                )}
              </div>
            )}
            <Button 
              className="p-0 px-1 py-1.5 h-fit rounded-[4px] text-white/50 text-xs bg-white/5"
              onClick={() => navigator.clipboard.readText().then(text => {
                setContractAddress(text);
                if (text.trim()) {
                  const validation = validateContractAddress(text, selectedNetwork);
                  setAddressValidation(validation);
                }
              })}
            >
              paste
            </Button>
          </div>
        </div>
        {addressValidation.message && (
          <p className={`text-xs mt-2 ${
            addressValidation.isValid ? 'text-[#16C784]' : 'text-[#FF3939]'
          }`}>
            {addressValidation.message}
          </p>
        )}
      </div>

      <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={startScan}
            className="font-medium mt-4 mb-6 w-full gap-2 bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-lg h-9"
          >
            <Search size={16} color="#FFFFFF50" /> Scan Token
          </Button>
        </DialogTrigger>
        <DialogContent className={`bg-[#010101] ${!scanComplete ? '!max-w-[484px]' : '!max-w-[534px]'} border-white/20 text-white py-6 px-6.5 max-h-full overflow-auto hover-scrollbar`}>
          {!scanComplete ? (
            // Scanning UI
            <>
              <DialogHeader>
                <div className='flex justify-center mb-6'><span className='size-[100px] flex justify-center items-center rounded-full bg-[#FBA43A]/20'><Image loading="lazy" src={'/analyze-token.svg'} alt={'analyze-token'} width={34} height={44}/></span></div>
                <DialogTitle className="font-bold text-center text-[22.5px] mb-2">Analysing token</DialogTitle>
                <DialogDescription className="text-xs text-center text-white/70 mb-6">
                Running comprehensive security and risk assessment  
                </DialogDescription>
              </DialogHeader>
              <div>
                <div className="space-y-6">
                    {info.map((info, index) => (
                      <div className="flex items-center justify-between" key={index}>
                        <div className='flex items-center gap-3'>
                          <Image loading="lazy" src={info.image} alt={info.description} width={28} height={28} />
                          <p className='text-xs '>{info.description}</p>
                        </div>

                        <Button className='p-2 h-fit bg-transparent w-fit'><Ellipsis color='#FFFFFF' /></Button>
                      </div>
                    ))}
                </div>

                 <div className='mt-[34px]'>
                  <Progress 
                    value={progress} 
                    backgroundColor="#27272A" 
                    progressGradient="linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)"
                    className='h-[3px]' 
                  />
                    <div className='flex justify-between items-center text-sm !text-[#71717B] mt-1.5'>
                      <span>Processing</span>
                      <span>~15 -25 seconds</span>
                    </div>
                 </div>

                 <div className='rounded-lg py-4.5 px-2 border border-[#8686864D] mt-6 flex gap-2'>
                  <Zap color='#FFCB45' size={20} />
                  <p className='text-sm text-white/70'><span className='font-medium text-white'>Did you know?</span> Our system analyzes blockchain data instead of cached results for maximum accuracy</p>
                 </div>
              </div>
            </>
          ) : (
            // Scan Complete UI
            <>
              <DialogHeader className='py-2 border-b-[0.5px] border-[#FFFFFF]/20'>
                <DialogTitle className="font-bold">Vetting result</DialogTitle>
                <DialogDescription className="hidden">
                  Token analysis completed successfully
                </DialogDescription>
              </DialogHeader>
              <div>
                {(() => {
                  // Handle nested details.details structure
                  const nestedDetails = scanResult?.details?.details;
                  const tier = nestedDetails?.tier || scanResult?.details?.tier || scanResult?.tier;
                  const riskScore = nestedDetails?.risk_score || scanResult?.details?.risk_score || scanResult?.risk_score || 0;
                  // const riskLevel = nestedDetails?.risk_level || scanResult?.details?.risk_level || scanResult?.risk_level;
                  const tierInfo = getTierInfo(tier);
                  const metadata = nestedDetails?.metadata || scanResult?.details?.metadata || scanResult?.metadata;
                  const summary = nestedDetails?.summary || scanResult?.details?.summary || scanResult?.summary;
                  
                  return (
                    <>
                      <div className='grid grid-cols-2 gap-2'>
                        <div className='flex justify-between p-2 rounded-xl border border-[#8686864D]'>
                          <div className='space-y-2'>
                            <h2 className='font-bold text-sm text-white/50'>Tier classification</h2>
                            <p className={`text-[19px] font-bold ${tierInfo.textColor}`}>{tierInfo.name}</p>
                          </div>
                          <span className={`size-7 rounded-lg ${tierInfo.bgColor} flex justify-center items-center`}>
                            <Image loading="lazy" src={tierInfo.icon} alt={tierInfo.name.toLowerCase()} width={16} height={16} />
                          </span>
                        </div>
                        
                        <div className='flex justify-between p-2 rounded-xl border border-[#8686864D]'>
                          <div className='space-y-2'>
                            <h2 className='font-bold text-sm text-white/50'>Risk score</h2>
                            <p className='text-[19px] font-bold'><span className={getRiskScoreColor(riskScore)}>{riskScore}</span>/100</p>
                          </div>
                          <span className='size-7 rounded-lg bg-[#15FF00]/20 flex justify-center items-center'>
                            <Image 
                              loading="lazy" 
                              src={
                                riskScore >= 70
                                  ? "/risk-score/good.svg"
                                  : riskScore >= 50
                                  ? "/risk-score/average.svg"
                                  : "/risk-score/bad.svg"
                              }
                              alt={'risk-score'} 
                              width={12} 
                              height={12} 
                            />
                          </span>
                        </div>
                      </div>

                      <div className='mt-5 mb-6'>
                        <h3 className='font-bold text-[18px] mb-4'>Details</h3>

                        <div className='grid grid-cols-2 gap-6'>
                          <div className='space-y-4.5'>
                            <p><span className='text-white/70'>Name:</span> <span>{metadata?.token_name || 'N/A'}</span></p>
                            <p><span className='text-white/70'>Ticker:</span> <span className='uppercase'>${metadata?.token_symbol || 'N/A'}</span></p>
                            <p><span className='text-white/70'>Age:</span> <span>{metadata?.age_display_short || metadata?.age_display || 'N/A'}</span></p>
                            <p><span className='text-white/70'>Created:</span> <span>{metadata?.creation_date ? new Date(metadata.creation_date).toLocaleDateString() : 'N/A'}</span></p>
                          </div>
                          <div className='space-y-4.5'>
                            <p><span className='text-white/70'>Price:</span> <span>${metadata?.token_price ? metadata.token_price.toFixed(6) : 'N/A'}</span></p>
                            <p><span className='text-white/70'>Market cap:</span> <span>{formatCurrency(metadata?.market_cap)}</span></p>
                            <p><span className='text-white/70'>24h volume:</span> <span>{formatCurrency(metadata?.volume_24h)}</span></p>
                          </div>
                        </div>
                      </div>

                      {summary && (
                        <div className='py-4.5 px-2 space-y-4 border border-[#8686864D] rounded-lg'>
                          <h3><Zap className='inline-block' size={16} color='#FFCB45' /> <span className='font-medium text-[18px]'>Summary</span></h3>
                          <p className='text-sm text-white/70'>
                            {summary}
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}

                {(() => {
                  // Handle nested details.details structure
                  const nestedDetails = scanResult?.details?.details;
                  const metadata = nestedDetails?.metadata || scanResult?.details?.metadata || scanResult?.metadata;
                  const riskScore = nestedDetails?.risk_score || scanResult?.details?.risk_score || scanResult?.risk_score || 0;
                  const riskLevel = nestedDetails?.risk_level || scanResult?.details?.risk_level || scanResult?.risk_level || 'UNKNOWN';
                  
                  return (
                    <div className='grid grid-cols-3 gap-2 mt-4 mb-8'>
                      <div className='h-[113px] rounded-xl border border-[#8686864D] flex items-center jusify-center'>
                        <div className='text-center space-y-[2px] w-full'>
                          <h3 className='text-white/50 font-bold text-xs'>LP Security</h3>
                          <div className='flex items-center gap-1 justify-center'>
                            <span className='font-bold text-[24px]'>{formatCurrency(metadata?.lp_amount_usd)}</span>
                            {(metadata?.lp_locked || metadata?.lp_burned) && (
                              <Image loading="lazy" src={'/lock.svg'} alt={'lock'} width={23} height={23} />
                            )}
                          </div>
                          <p className='text-white/50 font-bold text-xs'>
                            {metadata?.lp_locked ? 'Locked' : metadata?.lp_burned ? 'Burned' : 'Unlocked'}
                            {metadata?.lp_lock_months ? `: ${metadata.lp_lock_months}mo` : ''}
                          </p>
                        </div>
                      </div>

                      <div className='h-[113px] rounded-xl border border-[#8686864D] flex items-center jusify-center'>
                        <div className='text-center space-y-[2px] w-full'>
                          <h3 className='text-white/50 font-bold text-xs'>Holders</h3>
                          <div className='flex items-center gap-1 justify-center'>
                            <span className='font-bold text-[24px]'>{formatNumber(metadata?.holder_count)}</span>
                          </div>
                          <p className='text-white/50 font-bold text-xs'>
                            {metadata?.holder_count ? 'Active holders' : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className='h-[113px] rounded-xl border border-[#8686864D] flex items-center jusify-center'>
                        <div className='text-center space-y-[2px] w-full'>
                          <h3 className='text-white/50 font-bold text-xs'>Security</h3>
                          <div className='flex items-center gap-1 justify-center'>
                            <span className='font-bold text-[24px]'>{riskLevel}</span>
                            <Image loading="lazy" src={getRiskScoreIcon(riskScore)} alt={'security'} width={22} height={22} />
                          </div>
                          <p className='text-white/50 font-bold text-xs'>Score: {riskScore}/100</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className='flex flex-col items-center gap-3'>
                  {(() => {
                    // Check risk score threshold returned by backend
                    const nestedDetails = scanResult?.details?.details;
                    const riskScore = nestedDetails?.risk_score || scanResult?.details?.risk_score || scanResult?.risk_score || 0;
                    const minRequiredScore =
                      nestedDetails?.minimum_required_score ||
                      scanResult?.details?.minimum_required_score ||
                      scanResult?.minimum_required_score ||
                      50;
                    const backendEligible =
                      nestedDetails?.eligible ??
                      scanResult?.details?.eligible ??
                      scanResult?.eligible ??
                      false;
                    const provisionalReason =
                      nestedDetails?.provisional_reason ||
                      scanResult?.details?.provisional_reason ||
                      scanResult?.provisional_reason ||
                      null;
                    const canProceed = backendEligible === true || riskScore >= minRequiredScore;
                    
                    return (
                      <>
                        {!!provisionalReason && (
                          <div className="w-full py-3 px-4 rounded-lg bg-amber-500/20 border border-amber-500/50">
                            <p className="text-sm text-amber-300 text-center font-medium">
                              {provisionalReason}
                            </p>
                          </div>
                        )}
                        {!canProceed && (
                          <div className="w-full py-3 px-4 rounded-lg bg-red-500/20 border border-red-500/50">
                            <p className="text-sm text-red-400 text-center font-medium">
                              ⚠️ Risk score too low. Minimum required: {minRequiredScore}
                            </p>
                          </div>
                        )}
                        <Button 
                          onClick={() => {
                            setCurrentStep(2);
                          }}
                          disabled={!canProceed}
                          className="w-[155px] bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-lg h-9 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          List
                        </Button>
                      </>
                    );
                  })()}
                </div>

                <p className='text-center mt-6 font-medium text-xs text-white/70'>
                <span className='text-white'>Disclaimer:</span> this analysis is for informational purpose and does not constitute financial advice. always conduct your own research
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        projectTitle={(scanResult?.details?.details?.metadata?.token_name || scanResult?.details?.metadata?.token_name || scanResult?.metadata?.token_name) || 'Token Listing'}
        listingId={scanResult?.details?.details?.id || scanResult?.details?.id || '#432738'}
        listingFee={5}
      />

      <div className="border border-white/20 rounded-lg px-2 py-4.5">
        <div className="flex items-center gap-2">
          <Zap size={16} color="#FFCB45" />{" "}
          <h3 className="font-medium">What we analyze:</h3>
        </div>
        <ul className="style-none list-disc list-inside text-[14px] ml-7">
          <li>Smart contract security vulnerabilities</li>
          <li>Liquidity pool amount and lock duration</li>
          <li>Wallet holder distribution and activity</li>
          <li>Project age and development timeline</li>
        </ul>
      </div>
    </>
  );
}
