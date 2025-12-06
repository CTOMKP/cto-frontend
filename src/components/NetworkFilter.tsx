'use client'

import { Button } from "./ui/button";
import { ChevronDown, Check, Globe } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export type Network = "solana" | "ethereum" | "bsc" | "sui" | "base" | "aptos" | "near" | "osmosis";

export default function NetworkFilter({
  selectedNetwork,
  onChange,
}: {
  selectedNetwork: Network | null;
  onChange: (network: Network | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const networks = [
    { name: "Solana", value: "solana" as Network, src: "/listings-chains/solana.png" },
    { name: "Ethereum", value: "ethereum" as Network, src: "/listings-chains/ethereum.png" },
    { name: "BSC", value: "bsc" as Network, src: "/listings-chains/bnb.png" },
    { name: "Sui", value: "sui" as Network, src: "/listings-chains/sui.jpg" },
    { name: "Base", value: "base" as Network, src: "/listings-chains/base.png" },
    { name: "Aptos", value: "aptos" as Network, src: "/listings-chains/aptos.png" },
    { name: "NEAR", value: "near" as Network, src: "/listings-chains/near.png" },
    { name: "Osmosis", value: "osmosis" as Network, src: "/listings-chains/osmosis.jpg" },
  ];

  const handleNetworkToggle = (network: Network) => {
    // If clicking the same network, deselect it (show all chains)
    // If clicking a different network, select that network
    if (selectedNetwork === network) {
      onChange(null);
    } else {
      onChange(network);
    }
  };

  const handleAllToggle = () => {
    // Always clear selection (show all chains)
    onChange(null);
  };

  return (
    <div className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF20] rounded-lg items-center px-1 relative">
      {/* All button */}
      <Button
        onClick={handleAllToggle}
        className={`text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg ${
          selectedNetwork === null
            ? "bg-[#17171C] text-white"
            : "bg-transparent text-[#A1A1AA]"
        }`}
      >
        All
      </Button>

      {/* Network images - responsive count */}
      <div className="hidden xl:flex gap-4">
        {networks.slice(0, 6).map((network) => (
          <Button
            key={network.value}
            onClick={() => handleNetworkToggle(network.value)}
            className="p-1 h-[20px] w-[20px] rounded-lg bg-transparent hover:bg-[#17171C]"
          >
            <div className="relative">
              <div className={`size-5 rounded-full p-[2px] ${
                selectedNetwork === network.value 
                  ? 'bg-gradient-to-r from-pink-500 to-yellow-400' 
                  : ''
              }`}>
                <Image
                  loading="lazy"
                  className="size-4 rounded-full border-[0.3px] border-[#FFFFFF] w-full h-full"
                  src={network.src}
                  alt={`${network.name}-img`}
                  width={16}
                  height={16}
                />
              </div>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="hidden lg:flex xl:hidden gap-4">
        {networks.slice(0, 5).map((network) => (
          <Button
            key={network.value}
            onClick={() => handleNetworkToggle(network.value)}
            className="p-1 h-[20px] w-[20px] rounded-lg bg-transparent hover:bg-[#17171C]"
          >
            <div className="relative">
              <div className={`size-5 rounded-full p-[2px] ${
                selectedNetwork === network.value 
                  ? 'bg-gradient-to-r from-pink-500 to-yellow-400' 
                  : ''
              }`}>
                <Image
                  loading="lazy"
                  className="size-4 rounded-full border-[0.3px] border-[#FFFFFF] w-full h-full"
                  src={network.src}
                  alt={`${network.name}-img`}
                  width={16}
                  height={16}
                />
              </div>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="hidden md:flex lg:hidden gap-4">
        {networks.slice(0, 4).map((network) => (
          <Button
            key={network.value}
            onClick={() => handleNetworkToggle(network.value)}
            className="p-1 h-[20px] w-[20px] rounded-lg bg-transparent hover:bg-[#17171C]"
          >
            <div className="relative">
              <div className={`size-5 rounded-full p-[2px] ${
                selectedNetwork === network.value 
                  ? 'bg-gradient-to-r from-pink-500 to-yellow-400' 
                  : ''
              }`}>
                <Image
                  loading="lazy"
                  className="size-4 rounded-full border-[0.3px] border-[#FFFFFF] w-full h-full"
                  src={network.src}
                  alt={`${network.name}-img`}
                  width={16}
                  height={16}
                />
              </div>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="flex md:hidden gap-4">
        {networks.slice(0, 3).map((network) => (
          <Button
            key={network.value}
            onClick={() => handleNetworkToggle(network.value)}
            className="p-1 h-[20px] w-[20px] rounded-lg bg-transparent hover:bg-[#17171C]"
          >
            <div className="relative">
              <div className={`size-5 rounded-full p-[2px] ${
                selectedNetwork === network.value 
                  ? 'bg-gradient-to-r from-pink-500 to-yellow-400' 
                  : ''
              }`}>
                <Image
                  loading="lazy"
                  className="size-4 rounded-full border-[0.3px] border-[#FFFFFF] w-full h-full"
                  src={network.src}
                  alt={`${network.name}-img`}
                  width={16}
                  height={16}
                />
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Chevron down button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 h-[20px] w-[20px] rounded-lg bg-transparent hover:bg-[#17171C]"
      >
        <ChevronDown size={12} color="#A1A1AA" />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-[#010101] border-[0.2px] border-[#FFFFFF20] rounded-lg p-3 z-50 max-w-[344px] min-w-[300px]">
          <div className="space-y-2">
            {/* All option */}
            <div
              className="flex items-center justify-between p-2 rounded-lg hover:bg-[#17171C] cursor-pointer"
              onClick={handleAllToggle}
            >
              <div className="flex items-center gap-2">
                <Globe size={24} className="text-white" />
                <span className="text-white text-sm">All</span>
              </div>
              {selectedNetwork === null ? (
                <Check size={16} color="#A1A1AA" />
              ) : null}
            </div>
            
            {networks.map((network) => (
              <div
                key={network.value}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#17171C] cursor-pointer"
                onClick={() => handleNetworkToggle(network.value)}
              >
                <div className="flex items-center gap-2">
                  <Image
                    loading="lazy"
                    className="size-6 rounded-full border-[0.3px] border-[#FFFFFF]"
                    src={network.src}
                    alt={`${network.name}-img`}
                    width={24}
                    height={24}
                  />
                  <span className="text-white text-sm">{network.name}</span>
                </div>
                {selectedNetwork === network.value ? (
                  <Check size={16} color="#A1A1AA" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
