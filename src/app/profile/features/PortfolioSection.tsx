"use client";

import React from 'react';
import CustomPieChart from '@/components/CustomPieChart';
import { useQuery } from '@tanstack/react-query';
import { getTotalPaidOut } from '@/services/walletSummaryService';
import { useFormatFiat } from '@/hooks/useFormatFiat';
import { useTranslation } from 'react-i18next';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PortfolioSectionProps {
  achievementData: PieChartData[];
}

export default function PortfolioSection({
  achievementData,
}: PortfolioSectionProps) {
  const { t } = useTranslation();
  const formatFiat = useFormatFiat();
  const paidOutQuery = useQuery({
    queryKey: ['wallet-summary', 'total-paid-out'],
    queryFn: ({ signal }) => getTotalPaidOut(signal),
    staleTime: 60_000,
  });

  const totalPaidOut = paidOutQuery.isLoading
    ? '...'
    : formatFiat(paidOutQuery.data?.totalPaidOutUsd ?? 0, { compact: false });

  return (
    <div className="rounded-lg border-[0.5px] border-white/20 py-3 px-5 mt-5 flex-1 flex flex-col justify-between">
      <h3 className='font-bold leading-6'>{t("profile.portfolio")}</h3>
      <div className="flex items-center justify-start flex-shrink-0">
        <CustomPieChart
          data={achievementData}
          height={100}
          innerRadius={15}
          outerRadius={35}
          paddingAngle={2}
        />
      </div>
      
      {/* Stats Section */}
      <div className='flex items-center flex-shrink-0 mt-4'>
        <div className="flex-1">
          <div className="text-xs font-medium mb-2">{t("profile.totalPaidOut")}</div>
          <div className="text-xl font-medium">{totalPaidOut}</div>
        </div>
        <div className="w-px h-12 bg-white/20 mx-4"></div>
        <div className="flex-1">
          <div className="text-xs font-medium mb-2">{t("profile.positionValue")}</div>
          <div className="text-xl font-medium">{formatFiat(1000, { compact: false })}</div>
        </div>
        <div className="w-px h-12 bg-white/20 mx-4"></div>
        <div className="flex-1">
          <div className="text-xs font-medium mb-2">{t("profile.pnl")}</div>
          <div className="text-[#16C784] text-xl font-medium">+{formatFiat(13000, { compact: false })}</div>
        </div>
      </div>
    </div>
  );
}

