"use client";

import React, { useState } from "react";
import { useWalletBalance } from "./wallet-balance/useWalletBalance";
import WalletBalanceContent from "./wallet-balance/WalletBalanceContent";
import ActionButtons from "./wallet-balance/ActionButtons";

export default function WalletBalance() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { walletAssets, selectedAsset, setSelectedAsset, isLoading } =
    useWalletBalance();

  // Calculate wallet balance from selected asset
  const walletBalance = selectedAsset?.value || 0;

  return (
    <div className="rounded-lg border-[0.5px] border-white/20 p-5">
      <WalletBalanceContent
        balanceVisible={balanceVisible}
        onToggleVisibility={() => setBalanceVisible(!balanceVisible)}
        isLoading={isLoading}
        walletAssets={walletAssets}
        selectedAsset={selectedAsset}
        onSelectAsset={setSelectedAsset}
        walletBalance={walletBalance}
        balanceTextSize="58px"
      />

      <ActionButtons />
    </div>
  );
}
