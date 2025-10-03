"use client";

import React from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

interface WalletProviderProps {
  children: React.ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: Network.MAINNET }}
      // optInWallets={["Petra"]}
      onError={(error) => {
        console.error("Aptos Wallet Error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
