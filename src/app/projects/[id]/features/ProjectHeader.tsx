"use client";

import Image from "next/image";
import { ChevronDown, Clock3, Link2 } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { ApiCoinItem } from "@/types/api";
import FiatText from "@/components/FiatText";
import { shortenAddress } from "@/utils/helper/shortenAddress";
import ProjectTierBadge from "@/components/ProjectTierBadge";
import { toast } from "react-toastify";
import { getChainImage } from "@/app/listings/features/utils/listingUtils";
import {
  CHAIN_DISPLAY_NAMES,
  normalizeChainSlug,
} from "@/lib/constants/slugs";

interface ProjectHeaderProps {
  projectData: ApiCoinItem | null;
  formatJoinedDate: (dateString: string) => string;
}

export default function ProjectHeader({ projectData, formatJoinedDate }: ProjectHeaderProps) {
  const favorites = useFavorites();
  const chainSlug = normalizeChainSlug(projectData?.chain);
  const chainLabel = CHAIN_DISPLAY_NAMES[chainSlug] ?? chainSlug;
  const displayName =
    projectData?.name || projectData?.symbol || "CHILLGUY";

  const handleCopyAddress = async () => {
    const address = projectData?.contractAddress;
    if (!address) {
      toast.error("No address to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    } catch {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="px-[100px] border-b border-b-[#8686864D]">
      <div className='mt-6.5 bg-[url("/project-profile/default-project-bg-img.png")] bg-cover bg-center bg-no-repeat h-[167px] rounded-t-lg'></div>
      <div className="relative ml-2 -mt-10 size-[80px]">
        <Image
          loading="lazy"
          src={
            projectData?.logoUrl ||
            projectData?.metadata?.market?.logoUrl ||
            "/project-profile/default-project-pfp.png"
          }
          alt="project-pfp"
          width={80}
          height={80}
          className="size-[80px] rounded-full"
        />
        <Image
          loading="lazy"
          src={getChainImage(chainSlug)}
          alt={chainLabel}
          width={24}
          height={24}
          className="absolute bottom-0 right-0 size-6 rounded-full border border-[#010101] bg-[#010101]"
          title={chainLabel}
        />
      </div>
      <div className="mt-6.5">
        <div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1 flex-wrap">
              <h1
                className="font-bold text-[32px] mr-1 max-w-[200px] truncate"
                title={displayName}
              >
                {displayName.length > 12
                  ? `${displayName.substring(0, 12)}...`
                  : displayName}
              </h1>

              <span
                className="bg-[#FFFFFF0D] rounded-[26px] flex items-center gap-1.5 justify-center px-2 h-6 text-xs font-medium text-white/80"
                title={chainLabel}
              >
                <Image
                  loading="lazy"
                  src={getChainImage(chainSlug)}
                  alt=""
                  width={14}
                  height={14}
                  className="size-3.5 rounded-full"
                />
                {chainLabel}
              </span>

              <div className="flex items-center gap-1">
                <ProjectTierBadge tier={projectData?.tier} iconSize={14} />
              </div>
              <div className="flex items-center gap-1">
                <span className="bg-[#FFFFFF]/5 rounded-[26px] flex items-center justify-center px-1.5 h-6">
                  {projectData?.contractAddress
                    ? shortenAddress(projectData.contractAddress)
                    : "C19J3fcX...nRpump"}
                </span>
                <span 
                  className="size-6 flex justify-center items-center rounded-full bg-[#FFFFFF0D] cursor-pointer hover:bg-[#FFFFFF1A] transition-colors"
                  onClick={handleCopyAddress}
                >
                  <Image
                    loading="lazy"
                    src="/copy.svg"
                    alt="copy"
                    width={12}
                    height={12}
                    className="size-[14px]"
                  />
                </span>
                <span className="size-6 flex justify-center items-center rounded-full bg-[#FFFFFF0D]">
                  <Image
                    loading="lazy"
                    src="/go-to.svg"
                    alt="go-to"
                    width={12}
                    height={12}
                    className="size-[14px]"
                  />
                </span>
              </div>
            </span>

            <div className="flex items-center gap-2">
              {projectData?.contractAddress ? (
                <button
                  type="button"
                  className="size-9 flex items-center justify-center rounded-full bg-[#FFFFFF0D] hover:bg-[#FFFFFF1A]"
                  disabled={favorites.isCoinPending({
                    address: projectData.contractAddress,
                    chain: projectData.chain,
                  })}
                  title={
                    favorites.isCoinFavorited({
                      address: projectData.contractAddress,
                      chain: projectData.chain,
                    })
                      ? "Remove from watchlist"
                      : "Add to watchlist"
                  }
                  onClick={() =>
                    void favorites.toggleCoin({
                      address: projectData.contractAddress,
                      chain: projectData.chain,
                    })
                  }
                >
                  <Image
                    src={
                      favorites.isCoinFavorited({
                        address: projectData.contractAddress,
                        chain: projectData.chain,
                      })
                        ? "/watchlist-active.svg"
                        : "/white-watchlist.svg"
                    }
                    alt="watchlist"
                    width={16}
                    height={16}
                  />
                </button>
              ) : null}
              <span className="font-bold text-[32px]">
                <FiatText usd={projectData?.priceUsd} compact={false} />
              </span>
              <span
                className={`flex items-center border-[0.12px] p-1 rounded-[34px] font-medium ${
                  (projectData?.change24h || 0) < 0
                    ? "bg-[#C716240D] border-[#C71624]/20"
                    : "bg-[#16C7840D] border-[#16C784]/20"
                }`}
              >
                <span>24h</span>
                <span
                  className={`flex items-center ${
                    (projectData?.change24h || 0) < 0
                      ? "text-[#C71624]"
                      : "text-[#16C784]"
                  }`}
                >
                  {(projectData?.change24h || 0) < 0 ? (
                    <ChevronDown
                      size={16}
                      stroke="false"
                      className="border-none p-0 -mb-0.5"
                      fill="#C71624"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      stroke="false"
                      className="border-none p-0 -mb-0.5 rotate-180"
                      fill="#16C784"
                    />
                  )}
                  {Math.abs(projectData?.change24h || 0).toFixed(2)}
                </span>
              </span>
            </div>
          </div>
          <span className="text-[#FFFFFF]/50 font-bold mt-2">
            {"Just a chill guy"}
          </span>

          <div className="flex gap-1 mt-4.5 items-center mb-15">
            <span className="bg-[#FFFFFF0D] rounded-[26px] flex gap-1.5 items-center justify-center px-1.5 h-6">
              <Clock3 size={16} />
              <span>
                Joined{" "}
                {projectData?.createdAt
                  ? formatJoinedDate(projectData.createdAt)
                  : "09/07/25"}
              </span>
            </span>

            <span className="bg-[#FFFFFF0D] rounded-[26px] flex gap-1.5 items-center justify-center px-1.5 h-6">
              <Link2 size={16} className="rotate-135" />
              <span>x.com/phiprotocolai</span>
            </span>

            <span className="bg-[#FFFFFF0D] rounded-[26px] flex gap-1.5 items-center justify-center px-1.5 h-6">
              <Image
                loading="lazy"
                src="/x.svg"
                alt="twitter"
                width={12}
                height={12}
                className="size-[14px]"
              />
              <span>x.com/phiprotocolai</span>
            </span>
          </div>

          {/* <p className="font-medium mt-4 max-w-[608px] text-wrap mb-[34px]">
            {projectData?.summary ||
              "AI native liquidity layer for Hyperliquid, Solana & more chains. Instantly deploy AI-powered onchain agents that aggregate & route liquidity via our powerful API."}
          </p> */}
        </div>
      </div>
    </div>
  );
}

