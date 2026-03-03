'use client'

import { Button } from "@/components/ui/button";

export type Category = "for-you" | "trending" | "new";

export default function ListingsCategoryFilter({
  selected,
  onChange,
}: {
  selected: Category;
  onChange: (category: Category) => void;
}) {
  const categories: Category[] = ["for-you", "trending", "new"];

  const labels: Record<Category, string> = {
    "for-you": "For you",
    trending: "Trending",
    new: "New",
  };

  return (
    <div className="flex w-fit gap-1.5 h-9 border-[0.2px] border-[#FFFFFF20] rounded-lg items-center px-1">
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
