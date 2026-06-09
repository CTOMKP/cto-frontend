import Image from "next/image";
import { ChevronDown, Clock3, Link2 } from "lucide-react";
import { ApiCoinItem } from "@/types/api";
import { shortenAddress } from "@/utils/helper/shortenAddress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "react-toastify";

interface ProjectHeaderProps {
  projectData: ApiCoinItem | null;
  formatJoinedDate: (dateString: string) => string;
}

export default function ProjectHeader({ projectData, formatJoinedDate }: ProjectHeaderProps) {
  const handleCopyAddress = async () => {
    const address = projectData?.contractAddress;
    if (!address) {
      toast.error("No address to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="px-[100px] border-b border-b-[#8686864D]">
      <div className='mt-6.5 bg-[url("/project-profile/default-project-bg-img.png")] bg-cover bg-center bg-no-repeat h-[167px] rounded-t-lg'></div>
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
        className="size-[80px] ml-2 -mt-10 rounded-full"
      />
      <div className="mt-6.5">
        <div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <h1
                className="font-bold text-[32px] mr-1 max-w-[200px] truncate"
                title={projectData?.name || projectData?.symbol || "CHILLGUY"}
              >
                {(projectData?.name || projectData?.symbol || "CHILLGUY")
                  .length > 12
                  ? `${(
                      projectData?.name ||
                      projectData?.symbol ||
                      "CHILLGUY"
                    ).substring(0, 12)}...`
                  : projectData?.name || projectData?.symbol || "CHILLGUY"}
              </h1>{" "}

              <div className="flex items-center gap-1">
                {(() => {
                  const rawTier = projectData?.tier;
                  
                  // Normalize tier - handle all invalid formats
                  if (!rawTier || rawTier === null || rawTier === undefined) {
                    return null;
                  }
                  
                  const tierStr = String(rawTier).trim().toLowerCase();
                  
                  // Check for all invalid tier values (including dash variations)
                  if (tierStr === 'none' || tierStr === 'null' || tierStr === 'undefined' || 
                      tierStr === '' || tierStr === '—' || tierStr === '----' || tierStr === '------' ||
                      tierStr.startsWith('---') || tierStr === 'n/a' || tierStr === 'na' ||
                      /^[-—]+$/.test(tierStr)) { // Match any string that's only dashes/em-dashes
                    return null;
                  }
                  
                  const tier = tierStr;
                  const tierIcons: Record<string, string> = {
                    stellar: "/project-categories/stellar.png",
                    bloom: "/project-categories/bloom.png",
                    sprout: "/project-categories/sprout.png",
                    seed: "/project-categories/seed.png",
                  };
                  
                  const tierBgColors: Record<string, string> = {
                    seed: "bg-[#6D6D6D]/20",
                    sprout: "bg-[#FF5900]/20",
                    bloom: "bg-[#15FF00]/20",
                    stellar: "bg-[#FFBB00]/20",
                  };
                  
                  const tierDescriptions: Record<string, string> = {
                    seed: "Entry-level tier, 14-21 days old with minimal liquidity and early activity",
                    sprout: "Mid-level tier, >21 days old, with moderate liquidity and stability",
                    bloom: "Premium tier, >1 month old, with significant liquidity and security",
                    stellar: "Elite tier, >1 month old, with significant liquidity and security",
                  };
                  
                  const tierLpRequirements: Record<string, { lp: string; lpLockBurn: string }> = {
                    seed: { lp: ">$10,000", lpLockBurn: ">30% / 6mo" },
                    sprout: { lp: ">$20,000", lpLockBurn: ">30% / 18mo" },
                    bloom: { lp: ">$50,000", lpLockBurn: ">30% / 24mo" },
                    stellar: { lp: ">$100,000", lpLockBurn: ">30% / 36mo" },
                  };
                  
                  const iconPath = tierIcons[tier] || "/project-categories/bloom.png";
                  const bgColor = tierBgColors[tier] || "bg-[#15FF00]/20";
                  const description = tierDescriptions[tier] || "";
                  const lpRequirements = tierLpRequirements[tier] || { lp: "", lpLockBurn: "" };
                  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
                  
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`${bgColor} rounded-[4px] p-[3px] cursor-help`}>
                          <Image
                            loading="lazy"
                            src={iconPath}
                            width={14}
                            height={14}
                            alt={tier}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#010101] p-2 rounded-lg border-[0.5px] border-white max-w-[180px]">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                          <span className="font-semibold text-white">{tierName}</span>
                          <span className={`${bgColor} rounded-[4px] p-[3px] cursor-help`}>
                          <Image
                            loading="lazy"
                            src={iconPath}
                            width={8.36}
                            height={8.36}
                            alt={tier}
                          />
                        </span>
                          </div>
                          {description && (
                            <p className="text-xs font-medium text-white/70 w-full text-wrap">{description}</p>
                          )}
                          {lpRequirements.lp && (
                            <>
                              <div className="flex flex-col gap-0.5 mt-1 ">
                                <span className="text-xs font-medium flex justify-between items-center text-white/70">
                                  <span className="text-white/70">Lp: </span> <span>{lpRequirements.lp}</span>
                                </span>
                                <span className="text-xs font-medium flex justify-between items-center text-white/70">
                                  <span className="text-white/70">Lp lock/burn: </span> <span>{lpRequirements.lpLockBurn}</span>
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })()}
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
              <span className="font-bold text-[32px]">
                ${projectData?.priceUsd?.toFixed(6) || "0.3793"}
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

