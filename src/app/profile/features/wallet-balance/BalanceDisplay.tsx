import React from "react";
import { WalletAsset } from "./types";

interface BalanceDisplayProps {
  balanceVisible: boolean;
  selectedAsset: WalletAsset | null;
  walletBalance: number;
  balanceTextSize: string;
}

export default function BalanceDisplay({
  balanceVisible,
  selectedAsset,
  walletBalance,
  balanceTextSize,
}: BalanceDisplayProps) {
  return (
    <div className="mb-6">
      {balanceVisible ? (
        <div className="flex justify-center gap-2 flex-col items-center">
          <span className={`text-[${balanceTextSize}] font-semibold text-white`}>
            {selectedAsset?.name === "MOVE" ||
            selectedAsset?.name === "USDC"
              ? `${walletBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ${selectedAsset.name}`
              : `$${walletBalance.toLocaleString()}`}
          </span>
        </div>
      ) : (
        <div className="text-4xl font-bold text-white text-center">
          ••••••
        </div>
      )}
    </div>
  );
}
