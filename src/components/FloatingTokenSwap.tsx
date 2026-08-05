"use client";

import dynamic from "next/dynamic";

/** Lazy: pulls Privy Solana signing via walletRouter — keep off the critical path. */
const TokenSwapCard = dynamic(() => import("@/components/TokenSwapCard"), {
  ssr: false,
});

export default function FloatingTokenSwap() {
  return (
    <div className="fixed bottom-15 right-20 z-50">
      <TokenSwapCard />
    </div>
  );
}
