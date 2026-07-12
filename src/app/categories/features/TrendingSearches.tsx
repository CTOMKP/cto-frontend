"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import {
  DISCOVERY_CATEGORIES,
  getDiscoveryCategoryHref,
} from "@/lib/discoveryCategories";

export default function TrendingSearches() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-y-2">
      <span className="text-[#FFFFFFB2] mr-2">Trending searches :</span>
      <Button
        asChild
        className="p-0 h-fit !w-fit px-2 py-1 text-xs font-bold rounded-lg cta-gradient mx-2"
      >
        <Link href="/categories">All</Link>
      </Button>
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
        {DISCOVERY_CATEGORIES.map((category) => (
          <Button
            key={category.slug}
            asChild
            className="text-xs font-bold w-fit p-0 h-fit px-2 py-1 rounded-lg bg-[#17171C] hover:bg-[#232328]"
          >
            <Link href={getDiscoveryCategoryHref(category.slug)}>
              {category.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
