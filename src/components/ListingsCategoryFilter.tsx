'use client'

import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export type Category = "gainers" | "losers" | "new";

export default function ListingsCategoryFilter({
  selected,
  onChange,
}: {
  selected: Category;
  onChange: (category: Category) => void;
}) {
  const { t } = useTranslation();
  const categories: Category[] = ["new", "gainers", "losers"];

  const labels: Record<Category, string> = {
    gainers: t("filters.gainers"),
    losers: t("filters.losers"),
    new: t("filters.newListings"),
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
