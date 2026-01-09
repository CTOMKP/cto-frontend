import React from "react";
import { Wallet, Eye, EyeOff } from "lucide-react";

interface WalletBalanceHeaderProps {
  balanceVisible: boolean;
  onToggleVisibility: () => void;
}

export default function WalletBalanceHeader({
  balanceVisible,
  onToggleVisibility,
}: WalletBalanceHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="text-sm text-[#A1A1AA] flex items-center gap-2.5">
          <Wallet size={18} /> Wallet Balance:
        </div>
      </div>
      <button
        onClick={onToggleVisibility}
        className="text-gray-400 hover:text-white transition-colors"
      >
        {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
