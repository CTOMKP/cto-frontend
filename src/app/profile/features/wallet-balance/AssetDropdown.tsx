import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { WalletAsset } from "./types";
import { getChainImage } from "./utils";

function formatAssetLabel(asset: WalletAsset): string {
  if (asset.name === "USDC" && asset.networkLabel) {
    return `USDC (${asset.networkLabel})`;
  }
  return asset.name;
}

function formatAssetAmount(asset: WalletAsset): string {
  const n = asset.value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (asset.name === "MOVE" || asset.name === "USDC" || asset.name === "SOL") {
    return `${n} ${asset.name}`;
  }
  return `$${n}`;
}

function AssetTokenIcon({
  asset,
  size,
}: {
  asset: WalletAsset;
  size: "trigger" | "menu";
}) {
  const mainClass = size === "trigger" ? "w-4 h-4" : "w-6 h-6";
  const badgePx = size === "trigger" ? 10 : 14;

  return (
    <div className={`relative shrink-0 ${mainClass}`}>
      {asset.logo ? (
        <Image
          src={asset.logo}
          alt={asset.name}
          fill
          className="object-contain rounded-full"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs rounded-full bg-white/10">
          {asset.name.charAt(0)}
        </div>
      )}
      {asset.chainBadge ? (
        <Image
          loading="lazy"
          className="absolute bottom-0 left-0 rounded-full border-[0.36px] border-white/40"
          src={getChainImage(asset.chainBadge, asset.chainBadge)}
          alt=""
          width={badgePx}
          height={badgePx}
        />
      ) : null}
    </div>
  );
}

interface AssetDropdownProps {
  isLoading: boolean;
  walletAssets: WalletAsset[];
  selectedAsset: WalletAsset | null;
  onSelectAsset: (asset: WalletAsset) => void;
}

export default function AssetDropdown({
  isLoading,
  walletAssets,
  selectedAsset,
  onSelectAsset,
}: AssetDropdownProps) {
  return (
    <div className="flex w-full justify-center mb-4">
      {isLoading ? (
        <div className="text-white/50 text-sm">Loading wallets...</div>
      ) : walletAssets.length === 0 ? (
        <div className="text-white/50 text-sm">No wallets found</div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="border-[0.5px] border-[#27272A] rounded-lg py-2 px-1 text-white/50 flex items-center gap-2">
              {selectedAsset ? (
                <AssetTokenIcon asset={selectedAsset} size="trigger" />
              ) : null}
              {selectedAsset ? formatAssetLabel(selectedAsset) : "Select Wallet"}{" "}
              <ChevronDown size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#010101] text-white border-[0.5px] border-[#27272A] min-w-[200px]">
            {walletAssets.map((asset) => (
              <DropdownMenuItem
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/10 focus:bg-white/10"
              >
                <AssetTokenIcon asset={asset} size="menu" />
                <span className="text-white font-medium flex-1">
                  {formatAssetLabel(asset)}
                </span>
                <span className="text-white/70 text-sm whitespace-nowrap">
                  {formatAssetAmount(asset)}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
