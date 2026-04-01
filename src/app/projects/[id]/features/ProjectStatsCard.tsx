import { InfoIcon } from "lucide-react";

interface ProjectStatsCardProps {
  title: string;
  value: string | React.ReactNode;
  showInfoIcon?: boolean;
  subtitle?: string;
}

export default function ProjectStatsCard({ 
  title, 
  value, 
  showInfoIcon = false,
  subtitle 
}: ProjectStatsCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 bg-[#FFFFFF]/5 border border-[#8686864D] w-full rounded-xl h-[113px]">
      <span className="flex items-center gap-1.5">
        <h2 className="font-bold text-[11px] text-[#FFFFFF]/50">
          {title}
        </h2>
        {showInfoIcon && <InfoIcon strokeWidth="3px" size={12} color="#FFFFFF50" />}
      </span>
      <p className="font-bold text-[24px] flex items-center">
        {value}
      </p>
      {subtitle && (
        <span className="font-bold text-[12px] text-white/50">
          {subtitle}
        </span>
      )}
    </div>
  );
}

