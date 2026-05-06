"use client";

import { useMemo, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { usePathname } from "next/navigation";
import { apiPost } from "@/lib/apiClient";
import { toRecord, unwrapApiJsonBody } from "@/lib/apiResponse";
import { useWalletRouter } from "@/utils/walletRouter";
import { toast } from "react-toastify";

type TokenMeta = { mint: string; decimals: number };

function unwrapSwapPayload(payload: unknown): Record<string, unknown> {
  return toRecord(unwrapApiJsonBody(payload));
}

export default function TokenSwapCard() {
  const [sellPercent, setSellPercent] = useState<'clear' | '25' | '50' | '75' | 'max'>('clear');
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("SOL");
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [result, setResult] = useState<{ txHash?: string; error?: string } | null>(null);
  const { executeTrade, getSolanaWallet } = useWalletRouter();

  const pathname = usePathname();
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.REACT_APP_SOLANA_RPC_URL || "";
  const isNonMainnetRpc = /devnet|testnet|localhost/i.test(rpcUrl);
  const tokenMap = useMemo<Record<string, TokenMeta>>(() => {
    const defaultUsdcMint = /devnet/i.test(rpcUrl)
      ? "6e5qtpMzrLzDM8R6fHQtoF6d2iybHBYdj56tceKZo9sn"
      : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    const usdcMint = process.env.NEXT_PUBLIC_SOLANA_USDC_MINT || process.env.REACT_APP_SOLANA_USDC_MINT || defaultUsdcMint;
    const bonkMint = process.env.NEXT_PUBLIC_SOLANA_BONK_MINT || process.env.REACT_APP_SOLANA_BONK_MINT || "";
    const map: Record<string, TokenMeta> = {
      USDC: { mint: usdcMint, decimals: 6 },
      SOL: { mint: "So11111111111111111111111111111111111111112", decimals: 9 },
    };
    if (bonkMint) map.BONK = { mint: bonkMint, decimals: 5 };
    return map;
  }, [rpcUrl]);

  const handleSwap = async () => {
    if (isNonMainnetRpc) {
      toast.error("Swap is disabled on devnet/testnet in this app. Use mainnet RPC + mainnet token mints.");
      return;
    }
    const amountNum = Number(amount);
    if (!amount || !Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    const fromMeta = tokenMap[fromToken];
    const toMeta = tokenMap[toToken];
    if (!fromMeta || !toMeta || fromToken === toToken) {
      toast.error("Invalid token selection.");
      return;
    }
    const amountRaw = Math.floor(amountNum * Math.pow(10, fromMeta.decimals));
    if (!Number.isFinite(amountRaw) || amountRaw <= 0) {
      toast.error("Invalid amount.");
      return;
    }

    setIsSwapping(true);
    setResult(null);
    try {
      const solanaWallet = getSolanaWallet();

      const quoteRes = await apiPost<unknown>("/api/v1/trades/quote", {
        chain: "solana",
        inputToken: fromMeta.mint,
        outputToken: toMeta.mint,
        amount: amountRaw.toString(),
        slippageBps: 50,
      });
      const quotePayload = unwrapSwapPayload(quoteRes);
      const quote = toRecord(quotePayload.rawQuote ? quotePayload : quotePayload.data ?? quotePayload);
      if (!quote.inputMint || !quote.outputMint || !quote.inAmount) {
        throw new Error(String(quotePayload.message || "Invalid quote response from backend"));
      }

      const buildRes = await apiPost<unknown>("/api/v1/trades/build-transaction", {
        chain: "solana",
        quote: { ...quotePayload, rawQuote: quotePayload.rawQuote ?? quote },
        walletAddress: solanaWallet.address,
        slippageBps: 50,
      });
      const buildPayload = unwrapSwapPayload(buildRes);
      const unsignedTx = String(buildPayload.transaction || "");
      if (!unsignedTx) {
        throw new Error(String(buildPayload.message || "Failed to build swap transaction"));
      }

      const exec = await executeTrade("SOLANA", {
        transaction: unsignedTx,
        quote: buildPayload.rawQuote ?? quote,
      });
      if (!exec.success || !exec.transactionHash) {
        throw new Error(exec.error || "Swap failed");
      }

      setResult({ txHash: exec.transactionHash });
      toast.success("Swap submitted successfully.");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Swap failed";
      setResult({ error: msg });
      toast.error(msg);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className={`${pathname === '/' || pathname === '/faq' ? 'hidden' : ''}`}>
      <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-2xl inline-block">
        <DialogTrigger className="bg-black cursor-pointer text-white size-15 text-sm rounded-2xl flex items-center justify-center hover:opacity-90 transition">
          <Image loading="lazy" src="/emoji-icons/grape.svg" className="size-6.5" alt="grape icon" width={26} height={26} />
        </DialogTrigger>
      </div>
      <DialogContent className="bg-[#010101] border-2 border-[#86868630]">
        <DialogHeader className="hidden">
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>Grape swap</DialogDescription>
        </DialogHeader>

        <div className="text-white rounded-xl shadow-lg  space-y-4">
          <div className="flex items-center justify-end pb-4.5 border-b-[0.5px] border-[#FFFFFF33]">
            {/* <div className="text-2xl"><Image src="/emoji-icons/grape.svg" className="size-6.5" alt="grape icon" width={26} height={26} /></div> */}
            <DialogClose className="cursor-pointer"><X /></DialogClose>
          </div>

          <div className="bg-[#010101] rounded-xl">
              <div className="bg-white/3 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-white/70 font-medium">
                    You&apos;re Selling
                  </span>
                  <span className="text-white text-xs">
                    <span
                      className="mr-1"
                      style={{
                        background: "linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Max
                    </span>
                    0.00
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-white max-w-[200px] w-fit bg-transparent border-none !text-[24px] placeholder:text-[24px] placeholder:text-white appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <div className="flex rounded-[26px] bg-white/2 p-2 justify-center items-center gap-2">
                    <Image
                      loading="lazy"
                      width={24}
                      height={24}
                      className="size-6 rounded-full"
                      src={"/listings-chains/movement.png"}
                      alt={"listings-chains"}
                    />
                    <select
                      className="bg-transparent text-white text-sm outline-none"
                      value={fromToken}
                      onChange={(e) => setFromToken(e.target.value)}
                    >
                      {Object.keys(tokenMap).map((token) => (
                        <option key={token} value={token} className="text-black">{token}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={20}
                      color="#FFFFFF"
                      className="text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-white/5 p-1.5 rounded-[16px] h-9.5 flex justify-between items-center w-full gap-1.5">
                    <Button
                      className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === 'clear' ? 'cta-gradient' : ''}`}
                      onClick={(e) => { e.preventDefault(); setSellPercent('clear'); }}
                    >
                      Clear
                    </Button>
                    <Button
                      className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === '25' ? 'cta-gradient' : ''}`}
                      onClick={(e) => { e.preventDefault(); setSellPercent('25'); }}
                    >
                      25%
                    </Button>
                    <Button
                      className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === '50' ? 'cta-gradient' : ''}`}
                      onClick={(e) => { e.preventDefault(); setSellPercent('50'); }}
                    >
                      50%
                    </Button>
                    <Button
                      className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === '75' ? 'cta-gradient' : ''}`}
                      onClick={(e) => { e.preventDefault(); setSellPercent('75'); }}
                    >
                      75%
                    </Button>
                    <Button
                      className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === 'max' ? 'cta-gradient' : ''}`}
                      onClick={(e) => { e.preventDefault(); setSellPercent('max'); }}
                    >
                      Max
                    </Button>
                  </div>

                  <Button className="p-0 bg-[#FF4A15005] py-[5px] w-10 px-[13px] rounded-full">
                    <Image
                      loading="lazy"
                      src={"/convert.svg"}
                      alt={"convert"}
                      width={14}
                      height={14}
                    />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center relative">
                <Button className="absolute -top-3.5 z-10 bg-[#010101] border-[0.2px] border-white/20 size-13 p-0 rounded-full">
                  <span className="size-7 rounded-full flex justify-center items-center">
                    <Image
                      loading="lazy"
                      src={"/switch-diagonal.svg"}
                      alt={"switch"}
                      width={16}
                      height={16}
                    />
                  </span>
                </Button>
              </div>

              <div className="bg-white/3 p-4 rounded-lg mt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-white/70 font-medium">
                    You&apos;re Selling
                  </span>
                  <span className="text-white text-xs">
                    <span
                      className="mr-1"
                      style={{
                        background: "linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Max
                    </span>
                    0.00
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <Input
                    type="number"
                    placeholder="Quote output"
                    readOnly
                    className="text-white max-w-[200px] w-fit bg-transparent border-none !text-[24px] placeholder:text-[24px] placeholder:text-white appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <div className="flex rounded-[26px] bg-white/2 p-2 justify-center items-center gap-2">
                    <Image
                      loading="lazy"
                      width={24}
                      height={24}
                      className="size-6 rounded-full"
                      src={"/listings-chains/solana.png"}
                      alt={"listings-chains"}
                    />
                    <select
                      className="bg-transparent text-white text-sm outline-none"
                      value={toToken}
                      onChange={(e) => setToToken(e.target.value)}
                    >
                      {Object.keys(tokenMap).map((token) => (
                        <option key={token} value={token} className="text-black">{token}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={20}
                      color="#FFFFFF"
                      className="text-white"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSwap} disabled={isSwapping} className="w-full mt-4 cta-gradient">
                {isSwapping ? "Swapping..." : "Swap"}
              </Button>
              {result?.txHash && <p className="mt-2 text-xs text-green-400 break-all">Tx: {result.txHash}</p>}
              {result?.error && <p className="mt-2 text-xs text-red-400">{result.error}</p>}
              {isNonMainnetRpc && (
                <p className="mt-2 text-xs text-amber-400">Swap disabled on devnet/testnet RPC.</p>
              )}

              {/* <div className="flex bg-white/3 rounded-lg justify-center mt-4 py-4.5 items-center gap-1">
                <Image
                  className="rounded-full"
                  src={"/panora-logo.jpg"}
                  alt={"panora-logo"}
                  width={13}
                  height={13}
                  loading="lazy"
                />
                <p className="text-xs text-white/70">
                  Powered by Panora Exchange
                </p>
              </div> */}
            </div>
        </div>
      </DialogContent>
    </div>
  );
}
