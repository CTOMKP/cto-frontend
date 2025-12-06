"use client";

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Check, Ellipsis, Search, Zap } from 'lucide-react'
import { usePrivyAuth } from '@/hooks/usePrivyAuth'
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

interface Step1Props {
  selectedNetwork: string;
  setSelectedNetwork: (network: string) => void;
  networkDialogueOpen: boolean;
  setNetworkDialogueOpen: (open: boolean) => void;
  networks: Array<{
    name: string;
    src: string;
  }>;
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

export default function Step1({ 
  selectedNetwork, 
  setSelectedNetwork, 
  networkDialogueOpen, 
  setNetworkDialogueOpen, 
  networks 
}: Step1Props) {
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [contractAddress, setContractAddress] = useState('');
  
  const { isAuthenticated, getAccessToken } = usePrivyAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      getAccessToken().then(t => setToken(t || null)).catch(() => setToken(null));
    }
  }, [isAuthenticated, getAccessToken]);

  const startScan = async () => {
    if (!contractAddress.trim()) {
      alert('Please enter a contract address');
      return;
    }

    if (!isAuthenticated) {
      alert('Please login first to scan tokens');
      return;
    }

    // setIsScanning(true);
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

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      // Make API call to scan token with authentication
      const response = await fetch(`${backendUrl}/api/scan/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contractAddress: contractAddress.trim(),
          network: selectedNetwork
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Log the data to console for you to see
      console.log('Scan API Response:', data);
      
      // Complete progress animation
      setProgress(100);
      setTimeout(() => {
        setScanComplete(true);
      }, 500);

    } catch (error) {
      console.error('Scan failed:', error);
      alert('Scan failed. Please try again.');
      setProgress(0);
    }
  };

  const resetScan = () => {
    setScanDialogOpen(false);
    setScanComplete(false);
    setProgress(0);
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
        defaultValue={selectedNetwork}
        onValueChange={(value) => setSelectedNetwork(value)}
      >
        <SelectTrigger className="w-full mt-6 h-10 rounded-lg border-[0.2px] border-[#FFFFFF20]">
          <div className="w-full items-center pr-4 flex justify-between">
            <span className="font-medium">Select Network</span>
            <div className="flex gap-1 ml-1">
              {networks.map((network, index) => (
                <div key={index} className="size-[24px] -m-1.5">
                  <Image
                    src={network.src}
                    alt={`${network.name}-img`}
                    className="w-full h-full rounded-full border-[0.3px] border-[#FFFFFF]"
                    width={24}
                    height={24}
                  />
                </div>
              ))}
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

      <div className="mt-4 relative flex items-center">
        <Input
          placeholder="Enter Contract address (32-44 characters)"
          className="border-[0.2px] border-white/20 h-12 py-3 px-2 bg-white/5 rounded-lg text-white placeholder:text-white/50"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
        <Button 
          className="p-0 px-1 py-1.5 h-fit rounded-[4px] text-white/50 text-xs absolute right-2 bg-white/5"
          onClick={() => navigator.clipboard.readText().then(text => setContractAddress(text))}
        >
          paste
        </Button>
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
        <DialogContent className={`bg-[#010101] ${!scanComplete ? '!max-w-[484px]' : '!max-w-[534px]'} border-white/20 text-white py-6 px-6.5 max-h-full overflow-auto`}>
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
                <div className='grid grid-cols-2 gap-2'>
                  <div className='flex justify-between p-2 rounded-xl border border-[#8686864D]'>
                    <div className='space-y-2'>
                      <h2 className='font-bold text-sm text-white/50'>Tier classification</h2>
                      <p className='text-[19px] font-bold text-[#FF5900]'>Sprout </p>
                    </div>
                    <span className='size-7 rounded-lg bg-[#FF5900]/20 flex justify-center items-center'>
                      <Image loading="lazy" src={'/project-categories/sprout.svg'} alt={'sprout'} width={16} height={16} />
                    </span>
                  </div>
                  
                  <div className='flex justify-between p-2 rounded-xl border border-[#8686864D]'>
                    <div className='space-y-2'>
                      <h2 className='font-bold text-sm text-white/50'>Risk score</h2>
                      <p className='text-[19px] font-bold'><span className='text-[#0B8700]'>85</span>/100</p>
                    </div>
                    <span className='size-7 rounded-lg bg-[#15FF00]/20 flex justify-center items-center'>
                      <Image loading="lazy" src={'/risk-score/good.svg'} alt={'sprout'} width={12} height={12} />
                    </span>
                  </div>
                </div>

                <div className='mt-5 mb-6'>
                  <h3 className='font-bold text-[18px] mb-4'>Details</h3>

                  <div className='grid grid-cols-2 gap-6'>
                    <div className='space-y-4.5'>
                      <p><span className='text-white/70'>Name:</span> <span>Just a Chill guy</span></p>
                      <p><span className='text-white/70'>Ticker:</span> <span className='uppercase'>$CHILLGUY</span></p>
                      <p><span className='text-white/70'>Age:</span> <span>2mo 5d</span></p>
                      <p><span className='text-white/70'>Created:</span> <span>07/06/2025</span></p>
                    </div>
                    <div className='space-y-4.5'>
                      <p><span className='text-white/70'>Price:</span> <span>$1,000,000</span></p>
                      <p><span className='text-white/70'>Market cap:</span> <span>2mo 5d</span></p>
                      <p><span className='text-white/70'>24h volume:</span> <span>07/06/2025</span></p>
                    </div>
                  </div>
                </div>

                <div className='py-4.5 px-2 space-y-4 border border-[#8686864D] rounded-lg'>
                  <h3><Zap className='inline-block' size={16} color='#FFCB45' /> <span className='font-medium text-[18px]'>Summary</span></h3>
                  <p className='text-sm text-white/70'>
                  This project has been active for several weeks and shows growth potential. it features excellent liquidity wiith short ter,m LPP commitment. classified as Bloom teeir demonstrating maturity strong fundamentalls and
                  </p>
                </div>

                <div className='grid grid-cols-3 gap-2 mt-4 mb-8'>
                  <div className='h-[113px] rounded-xl border border-[#8686864D] flex items-center jusify-center'>
                    <div className='text-center space-y-[2px] w-full'>
                    <h3 className='text-white/50 font-bold text-xs'>Lp security</h3>
                    <div className='flex items-center gap-1 justify-center'>
                      <span className='font-bold text-[24px]'>$3.4M</span>
                      <Image loading="lazy" src={'/lock.svg'} alt={'lock'} width={23} height={23} />
                    </div>
                    <p className='text-white/50 font-bold text-xs'>locked: 95%</p>
                    </div>
                  </div>

                  <div className='h-[113px] rounded-xl border border-[#8686864D] flex items-center jusify-center'>
                    <div className='text-center space-y-[2px] w-full'>
                    <h3 className='text-white/50 font-bold text-xs'>Holders</h3>
                    <div className='flex items-center gap-1 justify-center'>
                      <span className='font-bold text-[24px]'>15,234</span>
                    </div>
                    <p className='text-white/50 font-bold text-xs'>Top 10 &lt; 10%</p>
                    </div>
                  </div>

                  <div className='h-[113px] rounded-xl border border-[#8686864D] flex items-center jusify-center'>
                    <div className='text-center space-y-[2px] w-full'>
                    <h3 className='text-white/50 font-bold text-xs'>Security</h3>
                    <div className='flex items-center gap-1 justify-center'>
                      <span className='font-bold text-[24px]'>Low risk</span>
                      <Image loading="lazy" src={'/degen-audit/3.svg'} alt={'degen-audit'} width={22} height={22} />
                    </div>
                    <p className='text-white/50 font-bold text-xs'>Score: 85/100</p>
                    </div>
                  </div>
                </div>

                <div className='flex justify-center'>
                  <Button 
                    onClick={resetScan}
                    className="w-[155px] bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-lg h-9"
                  >
                    List
                  </Button>
                </div>

                <p className='text-center mt-6 font-medium text-xs text-white/70'>
                <span className='text-white'>Disclaimer:</span> this analysis is for informational purpose and does not constitute financial advice. always conduct your own research
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
