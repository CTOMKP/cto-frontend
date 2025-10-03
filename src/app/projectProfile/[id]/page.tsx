"use client";

import Image from "next/image";
import {
  ChevronDown,
  Clock3,
  InfoIcon,
  Link2,
} from "lucide-react";
import ProjectProfileInfoTabs, {
  Info,
} from "./features/ProjectProfileInfoTabs";
import { useState } from "react";

export default function ProjectProfilePage() {
  const [info, setInfo] = useState<Info>("about");
  //   const projectId = params.id;

  return (
    <main>
      <div className="px-[100px] border-b border-b-[#8686864D]">
        <div className='mt-6.5 bg-[url("/project-profile/default-project-bg-img.png")] bg-cover bg-center bg-no-repeat h-[167px] rounded-t-lg'></div>
        <Image
          src="/project-profile/default-project-pfp.png"
          alt="project-pfp"
          width={80}
          height={80}
          className="size-[80px] ml-2 -mt-10 rounded-full"
        />
        <div className="mt-6.5">
          <div>
            <div className="flex justify-between">
              <span className="flex items-center">
                <h1 className="font-bold text-[32px] mr-1">CHILLGUY</h1>{" "}
                <span className="p-1 mt-1 rounded-[5px] bg-[#15FF00]/20">
                  <Image
                    src="/project-categories/bloom.svg"
                    alt="green"
                    width={14}
                    height={14}
                    className="size-[14px]"
                  />
                </span>
              </span>

              <div className="flex items-center gap-2">
                <span className="font-bold text-[32px]">$0.3793</span>
                <span className="flex items-center bg-[#16C7840D] border-[0.12px] border-[#16C784]/20 p-1 rounded-[34px] font-medium">
                  <span>24h</span>
                  <span className="flex items-center text-[#C71624]">
                    <ChevronDown
                      size={16}
                      stroke="false"
                      className="border-none p-0 -mb-0.5"
                      fill="#C71624"
                    />
                    0.79
                  </span>
                </span>
              </div>
            </div>
            <span className="text-[#FFFFFF]/50 font-bold mt-2">
              Just a chill guy
            </span>

            <div className="flex gap-1 mt-4.5 items-center">
              <span className="border-[0.09px] border-[#FFFFFF]/20 bg-[#FFFFFF0D] rounded-[26px] flex items-center justify-center px-1.5 h-6">
                C19J3fcX...nRpump
              </span>
              <span className="size-6 flex justify-center items-center rounded-full border-[0.09px] border-[#FFFFFF]/20 bg-[#FFFFFF0D]">
                <Image
                  src="/copy.svg"
                  alt="green"
                  width={12}
                  height={12}
                  className="size-[14px]"
                />
              </span>
              <span className="size-6 flex justify-center items-center rounded-full border-[0.09px] border-[#FFFFFF]/20 bg-[#FFFFFF0D]">
                <Image
                  src="/go-to.svg"
                  alt="go-to"
                  width={12}
                  height={12}
                  className="size-[14px]"
                />
              </span>

              <span className="border-[0.09px] border-[#FFFFFF]/20 bg-[#FFFFFF0D] rounded-[26px] flex gap-1.5 items-center justify-center px-1.5 h-6">
                <Clock3 size={16} />
                <span>Joined 09/07/25</span>
              </span>

              <span className="border-[0.09px] border-[#FFFFFF]/20 bg-[#FFFFFF0D] rounded-[26px] flex gap-1.5 items-center justify-center px-1.5 h-6">
                <Link2 size={16} className="rotate-135" />
                <span>x.com/phiprotocolai</span>
              </span>

              <span className="border-[0.09px] border-[#FFFFFF]/20 bg-[#FFFFFF0D] rounded-[26px] flex gap-1.5 items-center justify-center px-1.5 h-6">
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
              AI native liquidity layer for Hyperliquid, Solana & more
              chains.Instantly deploy AI-powered onchain agents that aggregate &
              route liquidity via our powerful API.
            </p>
          </div>
        </div>
      </div>

      <div className="px-[100px] mt-4">
        <div className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] w-full p-[0.7px] rounded-xl inline-block">
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
                  <p className="font-bold text-[24px]">$38.7M</p>
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5 bg-[#FFFFFF]/5 border border-[#8686864D] max-w-[238px] rounded-xl h-[113px]">
                  <span className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                      Liquidity
                    </h2>
                  </span>
                  <p className="font-bold text-[24px] flex items-center">
                    $3.0M{" "}
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
                  <p className="font-bold text-[24px]">10m 8d</p>
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5 bg-[#FFFFFF]/5 border border-[#8686864D] max-w-[238px] rounded-xl h-[113px]">
                  <span className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                      Risk
                    </h2>{" "}
                    <InfoIcon strokeWidth="3px" size={12} color="#FFFFFF50" />
                  </span>
                  <p className="font-bold text-[24px] flex items-center">
                    90{" "}
                    <Image
                      src="/risk-score/good.svg"
                      alt="good"
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
                      src="/communitry-score-icons/good-green.svg"
                      alt="good-green"
                      width={24}
                      height={24}
                    />{" "}
                    73
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
                  <span className="bg-[#16C78436] rounded-[6px] py-[5.5px] px-1 text-[10px] text-[#16C784] font-bold">Complete</span>
                </span>
                <p className="font-medium text-[14px] text-[#FFFFFFB2]">AI native liquidity layer for Hyperliquid, Solana & more chains.Instantly deploy AI-powered onchain agents that aggregate & route liquidity via our powerful API.</p>
              </div>
              <div className="p-4 bg-[#FFFFFF]/5 border border-[#8686864D] rounded-xl">
                <span className="flex justify-between items-center gap-1.5 mb-4">
                  <h2 className="font-bold text-[24px] text-[#D9D9D9]">
                  CTO marketplace listing
                  </h2>{" "}
                  <span className="bg-[#16C78436] rounded-[6px] py-[5.5px] px-1 text-[10px] text-[#16C784] font-bold">Complete</span>
                </span>
                <p className="font-medium text-[14px] text-[#FFFFFFB2]">AI native liquidity layer for Hyperliquid, Solana & more chains.Instantly deploy AI-powered onchain agents that aggregate & route liquidity via our powerful API.</p>
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
                <span className="font-bold text-[12px] text-white/50">Pumpfun</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-[2px] bg-[#FFFFFF]/5 border border-[#8686864D] rounded-xl h-[113px]">
                <span className="flex items-center gap-1.5">
                  <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
                  Holders
                  </h2>
                </span>
                <p className="font-bold text-[24px]">
                15,234
                </p>
                <span className="font-bold text-[12px] text-white/50">{"Top 10 &lt; 10%"}</span>
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
                <span className="font-bold text-[12px] text-white/50">Score: 85/100</span>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
