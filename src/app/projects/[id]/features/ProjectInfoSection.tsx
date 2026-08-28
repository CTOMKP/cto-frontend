"use client";

import Image from "next/image";
import ProjectProfileInfoTabs, { Info } from "./ProjectProfileInfoTabs";
import { ApiCoinItem } from "@/types/api";
import { compactNumber } from "@/utils/helper/compactNumber";
import FiatText from "@/components/FiatText";
import ProjectStatsCard from "./ProjectStatsCard";
import { useTranslation } from "react-i18next";

interface ProjectInfoSectionProps {
  info: Info;
  setInfo: (info: Info) => void;
  projectData: ApiCoinItem | null;
  formatAge: (ageString: string | null) => string;
}

export default function ProjectInfoSection({ 
  info, 
  setInfo, 
  projectData,
  formatAge 
}: ProjectInfoSectionProps) {
  const { t } = useTranslation();
  return (
    <div className="px-[100px] mt-4">
      <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] w-full p-[1px] rounded-xl inline-block">
        <div className="bg-[#010101] rounded-xl p-2">
          <ProjectProfileInfoTabs selected={info} onChange={setInfo} />

          {info === "about" && (
            <div className="mt-4 grid grid-cols-5 gap-[5px]">
              <ProjectStatsCard
                title={t("project.marketCap")}
                showInfoIcon
                value={
                  <FiatText
                    usd={
                      projectData?.marketCap ||
                      projectData?.metadata?.market?.fdv ||
                      38700000
                    }
                  />
                }
              />
              <ProjectStatsCard
                title={t("project.liquidity")}
                value={
                  <>
                    <FiatText
                      usd={
                        projectData?.liquidityUsd ||
                        projectData?.metadata?.market?.liquidityUsd ||
                        3000000
                      }
                    />{" "}
                    <Image loading="lazy" src="/lock.svg" alt="lock" width={24} height={24} />
                  </>
                }
              />
              <ProjectStatsCard
                title={t("project.age")}
                showInfoIcon
                value={
                  projectData?.age
                    ? formatAge(projectData.age)
                    : "0d"
                }
              />
              <ProjectStatsCard
                title={t("project.risk")}
                showInfoIcon
                value={
                  <>
                    {projectData?.riskScore ||
                      projectData?.metadata?.market?.riskScore ||
                      0}{" "}
                    <Image
                      loading="lazy"
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
                      className="ml-1"
                    />
                  </>
                }
              />
              <ProjectStatsCard
                title={t("project.communityScore")}
                showInfoIcon
                value={
                  <>
                    <Image
                      loading="lazy"
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
                  </>
                }
              />
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
              <ProjectStatsCard
                title="Lp security"
                value={
                  <>
                    Burned
                    <Image
                      loading="lazy"
                      src="/degen-audit/3.svg"
                      alt="good"
                      width={24}
                      height={24}
                    />
                  </>
                }
                subtitle="Pumpfun"
              />
              <ProjectStatsCard
                title="Holders"
                value={compactNumber(
                  projectData?.holders ||
                    projectData?.metadata?.market?.holders ||
                    15234
                )}
                subtitle={"Top 10 < 10%"}
              />
              <ProjectStatsCard
                title="Security"
                value={
                  <>
                    Low risk{" "}
                    <Image
                      loading="lazy"
                      src="/degen-audit/3.svg"
                      alt="good"
                      width={24}
                      height={24}
                    />
                  </>
                }
                subtitle="Score: 85/100"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

