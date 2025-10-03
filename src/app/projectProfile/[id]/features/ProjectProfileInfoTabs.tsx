'use client'

import { Button } from "@/components/ui/button";

export type Info = "about" | "roadmap" | "audit";

export default function ProjectProfileInfoTabs({
  selected,
  onChange,
}: {
  selected: Info;
  onChange: (category: Info) => void;
}) {
  const categories: Info[] = ["about", "roadmap", "audit"];

  const labels: Record<Info, string> = {
    about: "About",
    roadmap: "Roadmap",
    audit: "Audit",
  };

  return (
    <div className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF]/20 rounded-lg items-center px-1 w-fit">
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => onChange(category)}
          className={`text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg ${
            selected === category
              ? "bg-[#17171C] text-white"
              : "bg-transparent text-[#A1A1AA]"
          }`}
        >
          {labels[category]}
        </Button>
      ))}
    </div>
  );
}
