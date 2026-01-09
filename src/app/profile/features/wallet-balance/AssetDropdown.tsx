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
              {selectedAsset?.logo ? (
                <div className="relative w-4 h-4">
                  <Image
                    src={selectedAsset.logo}
                    alt={selectedAsset.name}
                    fill
                    className="object-contain rounded-full"
                    loading="lazy"
                  />
                </div>
              ) : (
                selectedAsset && (
                  <div className="w-4 h-4 flex items-center justify-center text-xs">
                    {selectedAsset.name.charAt(0)}
                  </div>
                )
              )}
              {selectedAsset?.name || "Select Wallet"}{" "}
              <ChevronDown size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#010101] text-white border-[0.5px] border-[#27272A] min-w-[200px]">
            {walletAssets.map((asset, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => onSelectAsset(asset)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/10 focus:bg-white/10"
              >
                {asset.logo ? (
                  <div className="relative w-6 h-6">
                    <Image
                      src={asset.logo}
                      alt={asset.name}
                      fill
                      className="object-contain rounded-full"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 flex items-center justify-center text-xs">
                    {asset.name.charAt(0)}
                  </div>
                )}
                <span className="text-white font-medium flex-1">
                  {asset.name}
                </span>
                <span className="text-white/70 text-sm">
                  {asset.name === "MOVE" || asset.name === "USDC"
                    ? `${asset.value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} ${asset.name}`
                    : `$${asset.value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
