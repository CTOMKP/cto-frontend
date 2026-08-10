"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ScanResult } from "@/services/userListingsService";
import {
  getTierInfo,
  getRiskScoreColor,
  getRiskScoreIcon,
  formatCurrency,
  formatNumber,
} from "./Step1";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step4Props {
  scanResult: ScanResult | null;
}

export default function Step4({ scanResult }: Step4Props) {
  const router = useRouter();
  
  // Handle nested details.details structure
  const nestedDetails = scanResult?.details?.details;
  const tier =
    nestedDetails?.tier || scanResult?.details?.tier || scanResult?.tier;
  const riskScore =
    nestedDetails?.risk_score ??
    scanResult?.details?.risk_score ??
    scanResult?.risk_score ??
    0;
//   const riskLevel =
//     nestedDetails?.risk_level ||
//     scanResult?.details?.risk_level ||
//     scanResult?.risk_level;
  const tierInfo = getTierInfo(tier);
  const metadata =
    nestedDetails?.metadata ||
    scanResult?.details?.metadata ||
    scanResult?.metadata;
  const summary =
    nestedDetails?.summary ||
    scanResult?.details?.summary ||
    scanResult?.summary;

  return (
    <>
      <div className="border-b-[0.3px] border-white/20 pb-2">
        <h3 className="font-bold">Project Summary</h3>
      </div>
      <div className="mt-5 mb-6">
        <h3 className="font-bold text-[18px] mb-4">Details</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4.5">
            <p>
              <span className="text-white/70">Name:</span>{" "}
              <span>{metadata?.token_name || "N/A"}</span>
            </p>
            <p>
              <span className="text-white/70">Ticker:</span>{" "}
              <span className="uppercase">
                ${metadata?.token_symbol || "N/A"}
              </span>
            </p>
            <p>
              <span className="text-white/70">Age:</span>{" "}
              <span>
                {metadata?.age_display_short || metadata?.age_display || "N/A"}
              </span>
            </p>
          </div>
          <div className="space-y-4.5">
            <p>
              <span className="text-white/70">Price:</span>{" "}
              <span>
                $
                {metadata?.token_price
                  ? metadata.token_price.toFixed(6)
                  : "N/A"}
              </span>
            </p>
            <p>
              <span className="text-white/70">Market cap:</span>{" "}
              <span>{formatCurrency(metadata?.market_cap)}</span>
            </p>
            <p>
              <span className="text-white/70">24h volume:</span>{" "}
              <span>{formatCurrency(metadata?.volume_24h)}</span>
            </p>
          </div>
        </div>
      </div>

      {summary && (
        <div className="py-4.5 px-2 space-y-4 border border-[#8686864D] rounded-lg">
          <h3>
            <Zap className="inline-block" size={16} color="#FFCB45" />{" "}
            <span className="font-medium text-[18px]">Summary</span>
          </h3>
          <p className="text-sm text-white/70">{summary}</p>
        </div>
      )}

      {(() => {
        const metadata =
          nestedDetails?.metadata ||
          scanResult?.details?.metadata ||
          scanResult?.metadata;
        const riskScore =
          nestedDetails?.risk_score ??
          scanResult?.details?.risk_score ??
          scanResult?.risk_score ??
          0;
        const riskLevel =
          nestedDetails?.risk_level ||
          scanResult?.details?.risk_level ||
          scanResult?.risk_level ||
          "UNKNOWN";

        return (
          <div className="grid grid-cols-3 gap-2 mt-4 mb-8">
            <div className="h-[113px] rounded-xl border border-[#8686864D] flex items-center jusify-center">
              <div className="text-center space-y-[2px] w-full">
                <h3 className="text-white/50 font-bold text-xs">LP Security</h3>
                <div className="flex items-center gap-1 justify-center">
                  <span className="font-bold text-[24px]">
                    {formatCurrency(metadata?.lp_amount_usd)}
                  </span>
                  {(metadata?.lp_locked || metadata?.lp_burned) && (
                    <Image
                      loading="lazy"
                      src={"/lock.svg"}
                      alt={"lock"}
                      width={23}
                      height={23}
                    />
                  )}
                </div>
                <p className="text-white/50 font-bold text-xs">
                  {metadata?.lp_lock_data_status !== "observed"
                    ? "Unverified"
                    : metadata?.lp_locked
                    ? "Locked"
                    : metadata?.lp_burned
                    ? "Burned"
                    : "Unlocked"}
                  {metadata?.lp_lock_months
                    ? `: ${metadata.lp_lock_months}mo`
                    : ""}
                </p>
              </div>
            </div>

            <div className="h-[113px] rounded-xl border border-[#8686864D] flex items-center jusify-center">
              <div className="text-center space-y-[2px] w-full">
                <h3 className="text-white/50 font-bold text-xs">Holders</h3>
                <div className="flex items-center gap-1 justify-center">
                  <span className="font-bold text-[24px]">
                    {formatNumber(metadata?.holder_count)}
                  </span>
                </div>
                <p className="text-white/50 font-bold text-xs">
                  {metadata?.holder_count ? "Active holders" : "N/A"}
                </p>
              </div>
            </div>

            <div className="h-[113px] rounded-xl border border-[#8686864D] flex items-center jusify-center">
              <div className="text-center space-y-[2px] w-full">
                <h3 className="text-white/50 font-bold text-xs">Security</h3>
                <div className="flex items-center gap-1 justify-center">
                  <span className="font-bold text-[24px]">{riskLevel}</span>
                  <Image
                    loading="lazy"
                    src={getRiskScoreIcon(riskScore)}
                    alt={"security"}
                    width={22}
                    height={22}
                  />
                </div>
                <p className="text-white/50 font-bold text-xs">
                  Score: {riskScore}/100
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-2 gap-2 mt-4 mb-8">
        <div className="flex justify-between p-2 rounded-xl border border-[#8686864D]">
          <div className="space-y-2">
            <h2 className="font-bold text-sm text-white/50">
              Tier classification
            </h2>
            <p className={`text-[19px] font-bold ${tierInfo.textColor}`}>
              {tierInfo.name}
            </p>
          </div>
          <span
            className={`size-7 rounded-lg ${tierInfo.bgColor} flex justify-center items-center`}
          >
            <Image
              loading="lazy"
              src={tierInfo.icon}
              alt={tierInfo.name.toLowerCase()}
              width={16}
              height={16}
            />
          </span>
        </div>

        <div className="flex justify-between p-2 rounded-xl border border-[#8686864D]">
          <div className="space-y-2">
            <h2 className="font-bold text-sm text-white/50">Risk score</h2>
            <p className="text-[19px] font-bold">
              <span className={getRiskScoreColor(riskScore)}>{riskScore}</span>
              /100
            </p>
          </div>
          <span className="size-7 rounded-lg bg-[#15FF00]/20 flex justify-center items-center">
            <Image
              loading="lazy"
              src={
                riskScore >= 70
                  ? "/risk-score/good.svg"
                  : riskScore >= 50
                  ? "/risk-score/average.svg"
                  : "/risk-score/bad.svg"
              }
              alt={"risk-score"}
              width={12}
              height={12}
            />
          </span>
        </div>

        <div className=" flex items-center gap-2.5 mt-6">
            <Button className="w-full h-[36px] cta-gradient py-2.5 rounded-lg">Refresh Status</Button>
            <Button 
              onClick={() => router.push('/listings')}
              className="w-full h-[36px] cta-gradient py-2.5 rounded-lg"
            >
              Explore Approved Projects
            </Button>
        </div>
      </div>
    </>
  );
}
