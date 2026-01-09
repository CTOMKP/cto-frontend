import React from "react";
import WalletBalanceHeader from "./WalletBalanceHeader";
import AssetDropdown from "./AssetDropdown";
import BalanceDisplay from "./BalanceDisplay";
import BalanceStats from "./BalanceStats";
import { WalletAsset } from "./types";

interface WalletBalanceContentProps {
  balanceVisible: boolean;
  onToggleVisibility: () => void;
  isLoading: boolean;
  walletAssets: WalletAsset[];
  selectedAsset: WalletAsset | null;
  onSelectAsset: (asset: WalletAsset) => void;
  walletBalance: number;
}

export default function WalletBalanceContent({
  balanceVisible,
  onToggleVisibility,
  isLoading,
  walletAssets,
  selectedAsset,
  onSelectAsset,
  walletBalance,
}: WalletBalanceContentProps) {
  return (
    <div className="bg-white/6 rounded-lg py-3 px-2.5">
      <WalletBalanceHeader
        balanceVisible={balanceVisible}
        onToggleVisibility={onToggleVisibility}
      />

      <AssetDropdown
        isLoading={isLoading}
        walletAssets={walletAssets}
        selectedAsset={selectedAsset}
        onSelectAsset={onSelectAsset}
      />

      <BalanceDisplay
        balanceVisible={balanceVisible}
        selectedAsset={selectedAsset}
        walletBalance={walletBalance}
      />

      <BalanceStats />
    </div>
  );
}
