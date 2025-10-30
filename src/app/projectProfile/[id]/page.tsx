"use client";

import Image from "next/image";
import { ChevronDown, Clock3, InfoIcon, Link2, SquareArrowOutUpRight } from "lucide-react";
import ProjectProfileInfoTabs, {
  Info,
} from "./features/ProjectProfileInfoTabs";
import { useState, useEffect } from "react";
import Chart from "./features/Chart";
import { useParams } from "next/navigation";
import { ApiCoinItem } from "@/types/api";
import { compactNumber } from "@/utils/helper/compactNumber";
import { shortenAddress } from "@/utils/helper/shortenAddress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

export default function ProjectProfilePage() {
  const [info, setInfo] = useState<Info>("about");
  const [sellPercent, setSellPercent] = useState<'clear' | '25' | '50' | '75' | 'max'>('clear');
  const { id } = useParams();
  const [projectData, setProjectData] = useState<ApiCoinItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to format relative age
  function formatRelativeAge(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}hr`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    return `${months}mo`;
  }

  // Helper function to format joined date
  function formatJoinedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  }

  // Fetch project data from API
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "https://cto-backend-production-28e3.up.railway.app";
      const url = `${base}/api/listing/${id}`;
      
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Failed to fetch project data');
          setIsLoading(false);
          return;
        }
        
        const data: ApiCoinItem = await res.json();
        console.log('Project API Response:', data);
        setProjectData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  console.log(id);

  if (isLoading) {
    return (
      <main>
        <div className="px-[100px] border-b border-b-[#8686864D]">
          <div className='mt-6.5 bg-[url("/project-profile/default-project-bg-img.png")] bg-cover bg-center bg-no-repeat h-[167px] rounded-t-lg'></div>
          <div className="size-[80px] ml-2 -mt-10 rounded-full bg-gray-600 animate-pulse"></div>
          <div className="mt-6.5">
            <div className="flex justify-between">
              <div className="h-8 w-32 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-600 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-48 bg-gray-600 rounded animate-pulse mt-2"></div>
            <div className="h-4 w-96 bg-gray-600 rounded animate-pulse mt-4"></div>
          </div>
        </div>
        <div className="px-[100px] mt-4">
          <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] w-full p-[0.7px] rounded-xl inline-block">
            <div className="bg-[#010101] rounded-xl p-2">
              <div className="grid grid-cols-5 gap-[5px]">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-[113px] bg-gray-600 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="px-[100px] border-b border-b-[#8686864D]">
        <div className='mt-6.5 bg-[url("/project-profile/default-project-bg-img.png")] bg-cover bg-center bg-no-repeat h-[167px] rounded-t-lg'></div>
        <Image
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
                <span className="p-1 mt-1 rounded-[5px] bg-[#15FF00]/20">
                  <Image
                    src="/project-categories/bloom.svg"
                    alt="green"
                    width={14}
                    height={14}
                    className="size-[14px]"
                  />
                </span>
                <div className="flex items-center gap-1">
                  <span className="bg-[#FFFFFF]/5 rounded-[26px] flex items-center justify-center px-1.5 h-6">
                    {projectData?.contractAddress
                      ? shortenAddress(projectData.contractAddress)
                      : "C19J3fcX...nRpump"}
                  </span>
                  <span className="size-6 flex justify-center items-center rounded-full bg-[#FFFFFF0D]">
                    <Image
                      src="/copy.svg"
                      alt="green"
                      width={12}
                      height={12}
                      className="size-[14px]"
                    />
                  </span>
                  <span className="size-6 flex justify-center items-center rounded-full bg-[#FFFFFF0D]">
                    <Image
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
                  ${projectData?.priceUsd?.toFixed(4) || "0.3793"}
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
              {projectData?.summary || "Just a chill guy"}
            </span>

            <div className="flex gap-1 mt-4.5 items-center">
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
                  src="/x.svg"
                  alt="twitter"
                  width={12}
                  height={12}
                  className="size-[14px]"
                />
                <span>x.com/phiprotocolai</span>
              </span>
            </div>

            <p className="font-medium mt-4 max-w-[608px] text-wrap mb-[34px]">
              {projectData?.summary ||
                "AI native liquidity layer for Hyperliquid, Solana & more chains. Instantly deploy AI-powered onchain agents that aggregate & route liquidity via our powerful API."}
            </p>
          </div>
        </div>
      </div>

      <div className="px-[100px] mt-4">
        <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] w-full p-[0.7px] rounded-xl inline-block">
          <div className="bg-[#010101] rounded-xl p-2">
            <ProjectProfileInfoTabs selected={info} onChange={setInfo} />

            {info === "about" && (
              <div className="mt-4 grid grid-cols-5 gap-[5px]">
                <div className="flex flex-col items-center justify-center gap-1.5 bg-[#FFFFFF]/5 border border-[#8686864D] max-w-[238px] rounded-xl h-[113px]">
                  <span className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                      Market cap
                    </h2>{" "}
                    <InfoIcon strokeWidth="3px" size={12} color="#FFFFFF50" />
                  </span>
                  <p className="font-bold text-[24px]">
                    $
                    {compactNumber(
                      projectData?.marketCap ||
                        projectData?.metadata?.market?.fdv ||
                        38700000
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5 bg-[#FFFFFF]/5 border border-[#8686864D] max-w-[238px] rounded-xl h-[113px]">
                  <span className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                      Liquidity
                    </h2>
                  </span>
                  <p className="font-bold text-[24px] flex items-center">
                    $
                    {compactNumber(
                      projectData?.liquidityUsd ||
                        projectData?.metadata?.market?.liquidityUsd ||
                        3000000
                    )}{" "}
                    <Image src="/lock.svg" alt="lock" width={24} height={24} />
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5 bg-[#FFFFFF]/5 border border-[#8686864D] max-w-[238px] rounded-xl h-[113px]">
                  <span className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                      Age
                    </h2>{" "}
                    <InfoIcon strokeWidth="3px" size={12} color="#FFFFFF50" />
                  </span>
                  <p className="font-bold text-[24px]">
                    {projectData?.createdAt
                      ? formatRelativeAge(new Date(projectData.createdAt))
                      : "10m 8d"}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5 bg-[#FFFFFF]/5 border border-[#8686864D] max-w-[238px] rounded-xl h-[113px]">
                  <span className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                      Risk
                    </h2>{" "}
                    <InfoIcon strokeWidth="3px" size={12} color="#FFFFFF50" />
                  </span>
                  <p className="font-bold text-[24px] flex gap-1 items-center">
                    {projectData?.riskScore ||
                      projectData?.metadata?.market?.riskScore ||
                      0}{" "}
                    <Image
                      src={`${
                        (projectData?.riskScore ||
                          projectData?.metadata?.market?.riskScore ||
                          0) >= 70
                          ? "/risk-score/good.svg"
                          : (projectData?.riskScore ||
                              projectData?.metadata?.market?.riskScore ||
                              0) >= 50
                          ? "/risk-score/average.svg"
                          : "/risk-score/bad.svg"
                      }`}
                      alt="risk-score"
                      width={19}
                      height={24}
                    />
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5 bg-[#FFFFFF]/5 border border-[#8686864D] max-w-[238px] rounded-xl h-[113px]">
                  <span className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                      Community score
                    </h2>{" "}
                    <InfoIcon strokeWidth="3px" size={12} color="#FFFFFF50" />
                  </span>
                  <p className="font-medium text-[24px] flex items-center">
                    <Image
                      src={
                        (projectData?.communityScore ||
                          projectData?.metadata?.market?.communityScore ||
                          73) < 50
                          ? "/communitry-score-icons/bad-red.svg"
                          : (projectData?.communityScore ||
                              projectData?.metadata?.market?.communityScore ||
                              73) >= 50 &&
                            (projectData?.communityScore ||
                              projectData?.metadata?.market?.communityScore ||
                              73) < 70
                          ? "/communitry-score-icons/average-yellow.svg"
                          : "/communitry-score-icons/good-green.svg"
                      }
                      alt="community-score"
                      width={24}
                      height={24}
                    />{" "}
                    {projectData?.communityScore ||
                      projectData?.metadata?.market?.communityScore ||
                      73}
                  </p>
                </div>
              </div>
            )}

            {info === "roadmap" && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-[5px]">
                <div className="p-4 bg-[#FFFFFF]/5 border border-[#8686864D] rounded-xl">
                  <span className="flex justify-between items-center gap-1.5 mb-4">
                    <h2 className="font-bold text-[24px] text-[#D9D9D9]">
                      $CHILLGUY rebrand
                    </h2>{" "}
                    <span className="bg-[#16C78436] rounded-[6px] py-[5.5px] px-1 text-[10px] text-[#16C784] font-bold">
                      Complete
                    </span>
                  </span>
                  <p className="font-medium text-[14px] text-[#FFFFFFB2]">
                    AI native liquidity layer for Hyperliquid, Solana & more
                    chains.Instantly deploy AI-powered onchain agents that
                    aggregate & route liquidity via our powerful API.
                  </p>
                </div>
                <div className="p-4 bg-[#FFFFFF]/5 border border-[#8686864D] rounded-xl">
                  <span className="flex justify-between items-center gap-1.5 mb-4">
                    <h2 className="font-bold text-[24px] text-[#D9D9D9]">
                      CTO marketplace listing
                    </h2>{" "}
                    <span className="bg-[#16C78436] rounded-[6px] py-[5.5px] px-1 text-[10px] text-[#16C784] font-bold">
                      Complete
                    </span>
                  </span>
                  <p className="font-medium text-[14px] text-[#FFFFFFB2]">
                    AI native liquidity layer for Hyperliquid, Solana & more
                    chains.Instantly deploy AI-powered onchain agents that
                    aggregate & route liquidity via our powerful API.
                  </p>
                </div>
              </div>
            )}

            {info === "audit" && (
              <div className="mt-4 grid grid-cols-3 gap-[5px]">
                <div className="flex flex-col items-center justify-center gap-[2px] bg-[#FFFFFF]/5 border border-[#8686864D] rounded-xl h-[113px]">
                  <span className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                      Lp security
                    </h2>{" "}
                  </span>
                  <p className="font-bold text-[24px] flex items-center">
                    Burned
                    <Image
                      src="/degen-audit/3.svg"
                      alt="good"
                      width={24}
                      height={24}
                    />
                  </p>
                  <span className="font-bold text-[12px] text-white/50">
                    Pumpfun
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-[2px] bg-[#FFFFFF]/5 border border-[#8686864D] rounded-xl h-[113px]">
                  <span className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                      Holders
                    </h2>
                  </span>
                  <p className="font-bold text-[24px]">
                    {compactNumber(
                      projectData?.holders ||
                        projectData?.metadata?.market?.holders ||
                        15234
                    )}
                  </p>
                  <span className="font-bold text-[12px] text-white/50">
                    {"Top 10 < 10%"}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-[2px] bg-[#FFFFFF]/5 border border-[#8686864D] rounded-xl h-[113px]">
                  <span className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                      Security
                    </h2>
                  </span>
                  <p className="font-bold text-[24px] flex items-center">
                    Low risk{" "}
                    <Image
                      src="/degen-audit/3.svg"
                      alt="good"
                      width={24}
                      height={24}
                    />
                  </p>
                  <span className="font-bold text-[12px] text-white/50">
                    Score: 85/100
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-[100px] mt-4 flex gap-2 max-h-[812px]">
        <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] w-full p-[0.7px] rounded-xl inline-block">
          <div className="bg-[#010101] rounded-xl p-2 flex h-full">
            <Chart
              address={projectData?.contractAddress}
              chain={projectData?.chain}
            />
          </div>
        </div>

        <div className="min-w-[420px] block space-y-2">
          <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] w-full p-[0.7px] rounded-xl inline-block">
            <div className="bg-[#010101] rounded-xl p-2">
              <div className="flex items-center gap-2 mb-4">
                <h1 className="font-bold text-[24px] text-white">
                  Community Vote
                </h1>
                <span className="text-[#858CA2] text-[11px]">4.3M votes</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#FFFFFF]/10 rounded-full overflow-hidden mb-4">
                <div className="flex h-full">
                  <div
                    className="bg-[#62BA01] h-full"
                    style={{ width: "70%" }}
                  ></div>
                  <div
                    className="bg-[#F04866] h-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>

              {/* Voting Buttons */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-[#62BA01]/10 hover:bg-[#62BA01]/20 rounded-lg py-2 px-4 transition-colors">
                  <span className="text-[#62BA01] font-medium">
                    Upvote (70%)
                  </span>
                </Button>
                <Button className="flex-1 bg-[#F04866]/10 hover:bg-[#F04866]/20 rounded-lg py-2 px-4 transition-colors">
                  <span className="text-[#F04866] font-medium">
                    Downvote (30%)
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] w-full p-[0.7px] rounded-xl inline-block">
            <div className="bg-[#010101] rounded-xl p-2">
              <div className="bg-white/3 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-white/70 font-medium">
                    You&apos;re Selling
                  </span>
                  <span className="text-white text-xs">
                    <span
                      className="mr-1"
                      style={{
                        background: "linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Max
                    </span>
                    0.00
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="text-white max-w-[200px] w-fit bg-transparent border-none !text-[24px] placeholder:text-[24px] placeholder:text-white appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <div className="flex rounded-[26px] bg-white/2 p-2 justify-center items-center gap-2">
                    <Image
                      width={24}
                      height={24}
                      className="size-6 rounded-full"
                      src={"/listings-chains/aptos.png"}
                      alt={"listings-chains"}
                    />
                    <span>APT</span>
                    <ChevronDown
                      size={20}
                      color="#FFFFFF"
                      className="text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-white/5 p-1.5 rounded-[16px] h-9.5 flex justify-between items-center w-full gap-1.5">
                    <Button
                      className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === 'clear' ? 'cta-gradient' : ''}`}
                      onClick={(e) => { e.preventDefault(); setSellPercent('clear'); }}
                    >
                      Clear
                    </Button>
                    <Button
                      className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === '25' ? 'cta-gradient' : ''}`}
                      onClick={(e) => { e.preventDefault(); setSellPercent('25'); }}
                    >
                      25%
                    </Button>
                    <Button
                      className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === '50' ? 'cta-gradient' : ''}`}
                      onClick={(e) => { e.preventDefault(); setSellPercent('50'); }}
                    >
                      50%
                    </Button>
                    <Button
                      className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === '75' ? 'cta-gradient' : ''}`}
                      onClick={(e) => { e.preventDefault(); setSellPercent('75'); }}
                    >
                      75%
                    </Button>
                    <Button
                      className={`p-0 text-xs font-medium h-full max-w-[68px] py-1 px-3.5 rounded-[16px] ${sellPercent === 'max' ? 'cta-gradient' : ''}`}
                      onClick={(e) => { e.preventDefault(); setSellPercent('max'); }}
                    >
                      Max
                    </Button>
                  </div>

                  <Button className="p-0 bg-[#FF4A15005] py-[5px] w-10 px-[13px] rounded-full">
                    <Image
                      src={"/convert.svg"}
                      alt={"convert"}
                      width={14}
                      height={14}
                    />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center relative">
                <Button className="absolute -top-3.5 z-10 bg-[#010101] border-[0.2px] border-white/20 size-13 p-0 rounded-full">
                  <span className="size-7 rounded-full flex justify-center items-center">
                    <Image
                      src={"/switch-diagonal.svg"}
                      alt={"switch"}
                      width={16}
                      height={16}
                    />
                  </span>
                </Button>
              </div>

              <div className="bg-white/3 p-4 rounded-lg mt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-white/70 font-medium">
                    You&apos;re Selling
                  </span>
                  <span className="text-white text-xs">
                    <span
                      className="mr-1"
                      style={{
                        background: "linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Max
                    </span>
                    0.00
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="text-white max-w-[200px] w-fit bg-transparent border-none !text-[24px] placeholder:text-[24px] placeholder:text-white appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <div className="flex rounded-[26px] bg-white/2 p-2 justify-center items-center gap-2">
                    <Image
                      width={24}
                      height={24}
                      className="size-6 rounded-full"
                      src={"/listings-chains/solana.png"}
                      alt={"listings-chains"}
                    />
                    <span>SOL</span>
                    <ChevronDown
                      size={20}
                      color="#FFFFFF"
                      className="text-white"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4 cta-gradient">Swap</Button>

              <div className="flex bg-white/3 rounded-lg justify-center mt-4 py-4.5 items-center gap-1">
                <Image
                  className="rounded-full"
                  src={"/panora-logo.jpg"}
                  alt={"panora-logo"}
                  width={13}
                  height={13}
                />
                <p className="text-xs text-white/70">
                  Powered by Panora Exchange
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-[0.5px] border-white/20 mt-4.5"></div>

      <div className="mt-4.5">
        <div className="px-[100px]">
          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF]/20 rounded-lg items-center px-1 w-fit bg-transparent">
              <TabsTrigger
                value="activities"
                className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
              >
                Activities
              </TabsTrigger>
              <TabsTrigger
                value="top-traders"
                className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
              >
                Top Traders
              </TabsTrigger>
              <TabsTrigger
                value="holders"
                className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
              >
                {`Holders (${compactNumber(
                  projectData?.holders ||
                    projectData?.metadata?.market?.holders ||
                    300150
                )})`}
              </TabsTrigger>
              <TabsTrigger
                value="liquidity"
                className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
              >
                Liquidity
              </TabsTrigger>
              <TabsTrigger
                value="positions"
                className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
              >
                Positions
              </TabsTrigger>
            </TabsList>
            <div className="border-t-[0.5px] border-white/20"></div>
            <ActivitiesFilter />
            <TabsContent value="activities" className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-left">
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Age</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Type</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Value (USD)</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Amount</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Price</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">MC</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Address</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-0 text-right">Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { age: "5m", type: "buy", value: "$100.61", amount: "1.78M", price: "$0.0₅15260", mc: "$0.0₅15260", address: "7RET3F...YGS5", tx: "#" },
                      { age: "12m", type: "sell", value: "$100.61", amount: "1.78M", price: "$0.0₅15260", mc: "$0.0₅15260", address: "7RET3F...YGS5", tx: "#" },
                      { age: "22m", type: "buy", value: "$100.61", amount: "1.78M", price: "$0.0₅15260", mc: "$0.0₅15260", address: "7RET3F...YGS5", tx: "#" },
                      { age: "35m", type: "sell", value: "$100.61", amount: "1.78M", price: "$0.0₅15260", mc: "$0.0₅15260", address: "7RET3F...YGS5", tx: "#" },
                    ].map((row, idx) => (
                      <tr key={idx} className="bg-white/2">
                        <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.age}</td>
                        <td className="text-xs font-medium py-3 pr-4 whitespace-nowrap">
                          <span className={row.type === "buy" ? "text-[#16C784]" : "text-[#C71624]"}>
                            {row.type === "buy" ? "Buy" : "Sell"}
                          </span>
                        </td>
                        <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.value}</td>
                        <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.amount}</td>
                        <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.price}</td>
                        <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.mc}</td>
                        <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.address}</td>
                        <td className="text-xs font-medium text-white py-3 pr-0 whitespace-nowrap text-right">
                          <a href={row.tx} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white/80 hover:text-white">
                            <SquareArrowOutUpRight size={16} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="top-traders" className="mt-6">
              <div></div>
            </TabsContent>
            <TabsContent value="holders" className="mt-6">
              <div></div>
            </TabsContent>
            <TabsContent value="liquidity" className="mt-6">
              <div></div>
            </TabsContent>
            <TabsContent value="positions" className="mt-6">
              <div></div>
            </TabsContent>
          </Tabs>

          <div className="borrder-t-[0.5px] border-white/20 my-1"></div>
        </div>
      </div>
    </main>
  );
}

const activitiesFilterOptions = [
  { key: "all", label: "All" },
  { key: "smart", label: "Smart KOL/VC" },
  { key: "whales", label: "Whales" },
  { key: "insider", label: "Insider" },
  { key: "top10", label: "Top 10" },
  { key: "fresh", label: "Fresh Wallet" },
  { key: "bundle", label: "Bundle" }
];

function ActivitiesFilter() {
  const [active, setActive] = React.useState("all");

  // Provide to ActivitiesContent if needed via context or props

  return (
    <div className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF]/20 rounded-lg items-center px-1 w-fit bg-transparent">
      {activitiesFilterOptions.map(opt => (
        <button
          key={opt.key}
          type="button"
          onClick={() => setActive(opt.key)}
          className={`text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg transition-colors ${
            active === opt.key ? "bg-[#17171C] text-white" : "bg-transparent text-[#A1A1AA]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
