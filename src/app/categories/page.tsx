import SearchBar from "@/app/categories/features/SearchBar";
import TrendingSearches from "@/app/categories/features/TrendingSearches";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DISCOVERY_CATEGORIES,
  getDiscoveryCategoryHref,
  getDiscoveryCategoryImageSrc,
} from "@/lib/discoveryCategories";

export default function Categories() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-[834px] mt-22 mb-12">
          <h1 className="text-[70px] font-medium">Explore the Meme</h1>
          <span className="text-[70px] mb-6 block text-transparent bg-clip-text bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] font-[900] !-mt-7">
            Multiverse
          </span>
          <p className="font-normal">
            Dive into memecoins by category. From dogs to dopamine, discover the
            next culcoin before the crowd
          </p>
        </div>
        <SearchBar />

        <div className="flex justify-center mt-10">
          <TrendingSearches />
        </div>
      </div>

      <div className="w-[85.9%] mx-auto">
        <h2 className="text-[23.25px] font-normal mt-8 mb-6">Explore Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6 mb-25">
          {DISCOVERY_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={getDiscoveryCategoryHref(category.slug)}
              className="block bg-gradient-to-r from-[rgba(236,72,153,0.5)] to-[rgba(250,204,21,0.5)] p-[1px] rounded-[8px] transition-opacity hover:opacity-90"
            >
              <div className="flex flex-col rounded-lg w-full h-full bg-[#010101]">
                <Image
                  loading="lazy"
                  src={getDiscoveryCategoryImageSrc(category.slug)}
                  alt={category.name}
                  className="object-contain w-full flex-1 rounded-t-lg"
                  width={392}
                  height={218}
                />

                <div className="py-5 px-[14px]">
                  <h3 className="text-[19.84px] font-normal">{category.name}</h3>
                  <p className="font-normal text-[13.78px] text-[#909090]">
                    {category.info}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
