"use client";

import React from 'react';
import CustomPieChart from '@/components/CustomPieChart';

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
  return (
    <div className="rounded-lg border-[0.5px] border-white/20 py-3 px-5 mt-5 flex-1 flex flex-col justify-between">
      <h3 className='font-bold leading-6'>Portfolio</h3>
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
          <div className="text-xs font-medium mb-2">Volume traded</div>
          <div className="text-xl font-medium">$124,560,986</div>
        </div>
        <div className="w-px h-12 bg-white/20 mx-4"></div>
        <div className="flex-1">
          <div className="text-xs font-medium mb-2">Position value</div>
          <div className="text-xl font-medium">$1,000</div>
        </div>
        <div className="w-px h-12 bg-white/20 mx-4"></div>
        <div className="flex-1">
          <div className="text-xs font-medium mb-2">Pnl</div>
          <div className="text-[#16C784] text-xl font-medium">+$13,000</div>
        </div>
      </div>
    </div>
  );
}

