"use client";

import React from 'react';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface CustomPieChartProps {
  data: PieChartData[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
}

export default function CustomPieChart({
  data,
  height = 200,
  innerRadius = 15,
  outerRadius = 35,
  paddingAngle = 2,
}: CustomPieChartProps) {
  const centerX = 100;
  const centerY = height / 2;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const totalPaddingAngle = paddingAngle * data.length;

  // Calculate angles for each segment with padding
  let currentAngle = -90; // Start from top
  const segments = data.map((item, index) => {
    const percentage = item.value / total;
    // Subtract total padding from 360, then calculate angle
    const availableAngle = 360 - totalPaddingAngle;
    const angle = percentage * availableAngle;
    
    // Add padding before this segment (except for the first one)
    if (index > 0) {
      currentAngle += paddingAngle;
    }
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Convert to radians
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    // Calculate points for the outer arc
    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);

    // Calculate points for the inner arc
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);

    // Calculate large arc flag
    const largeArcFlag = angle > 180 ? 1 : 0;

    // Create the path: outer arc -> line to inner -> inner arc (reversed) -> close
    const outerArc = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    const lineToInner = `L ${x3} ${y3}`;
    const innerArc = `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;

    const pathData = `${outerArc} ${lineToInner} ${innerArc}`;

    return {
      ...item,
      pathData,
      index,
    };
  });

  return (
    <div className="flex items-center justify-start gap-3">
      <svg width={200} height={height} viewBox={`0 0 200 ${height}`}>
        {segments.map((segment) => (
          <path
            key={segment.index}
            d={segment.pathData}
            fill={segment.color}
            stroke="none"
          />
        ))}
      </svg>
      
      <div className="flex flex-col gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-white text-sm">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

