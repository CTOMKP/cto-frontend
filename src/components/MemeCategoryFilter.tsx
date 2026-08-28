'use client'

import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export type MemeCategory = "all" | "meme" | "emoji";

export default function MemeCategoryFilter({
  selected,
  onChange,
}: {
  selected: MemeCategory;
  onChange: (category: MemeCategory) => void;
}) {
  const { t } = useTranslation();
  const categories: MemeCategory[] = ["all", "meme", "emoji"];

  const labels: Record<MemeCategory, string> = {
    all: t("filters.all"),
    meme: t("filters.meme"),
    emoji: t("filters.emoji"),
  };

  return (
    <div className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF20] rounded-lg items-center px-1">
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

