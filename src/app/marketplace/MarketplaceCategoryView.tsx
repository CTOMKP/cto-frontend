"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Clock, EllipsisVertical, ListFilter, MoreHorizontal, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MARKETPLACE_CATEGORY_DISPLAY_NAMES, type MarketplaceCategorySlug } from "@/lib/constants/slugs";
import MarketplaceTrendingFilter, { type Category } from "./features/MarketplaceTrendingFilter";

const tags = [
  "Designer", "Developer", "Raider", "Core Shillers", "Btc", "Meme reviver",
  "Shit poster", "Backend", "Meme Design", "Community manager", "Icons",
];

const MOCK_ADS = [
  { id: "1", title: "Liquidity Partner Needed", duration: "10d: 28m: 34s", age: "3d", by: "@YourHandle", payment: "Revenue share", price: "-", tags: ["Liquidity", "Partner", "RevenueShare", "Launch"] },
  { id: "2", title: "Liquidity Partner Needed", duration: "10d: 28m: 34s", age: "3d", by: "@YourHandle", payment: "Revenue share", price: "-", tags: ["Liquidity", "Partner", "RevenueShare", "Launch"] },
  { id: "3", title: "Liquidity Partner Needed", duration: "10d: 28m: 34s", age: "3d", by: "@YourHandle", payment: "Revenue share", price: "-", tags: ["Liquidity", "Partner", "RevenueShare", "Launch"] },
  { id: "4", title: "Liquidity Partner Needed", duration: "10d: 28m: 34s", age: "3d", by: "@YourHandle", payment: "Revenue share", price: "-", tags: ["Liquidity", "Partner", "RevenueShare", "Launch"] },
];

export default function MarketplaceCategoryView({
  category,
}: {
  category: MarketplaceCategorySlug;
}) {
  const [trending, setTrending] = useState<Category>("for-you");
  const title = MARKETPLACE_CATEGORY_DISPLAY_NAMES[category];

  return (
    <div>
      <section className="relative bg-[url('/orbital.png')] bg-[#000000BD] h-[225px] bg-cover bg-center bg-no-repeat overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none bg-gradient-to-t from-black to-transparent" aria-hidden />
        <Image src="/Group 1597882505.png" alt="group" width={100} height={100} className="sm:hidden absolute w-full h-[400px] bottom-0 left-0" />
        <div className="relative z-10 my-10 flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-[40px] text-left sm:text-center text-wrap max-w-[506px] leading-[120%]">
            {title}
          </h1>
          <p className="text-lg text-left sm:text-center text-[#FFFFFFCC] text-wrap max-w-[606px] mx-auto">
            Find and connect with talent in this category
          </p>
          <Button className="cta-gradient" asChild>
            <Link href="/marketplace/post-ad"><Plus /> Post an ad</Link>
          </Button>
        </div>
      </section>

      <section className="md:mx-25 mx-5">
        <div className="flex items-center justify-between mt-4 mb-8">
          <MarketplaceTrendingFilter selected={trending} onChange={(c: Category) => setTrending(c)} />
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Input className="border-[0.2px] bg-white/3 pl-7 max-w-50 placeholder:font-medium border-[#FFFFFF20] text-white placeholder:text-[#FFFFFF80] focus:!border-[0.2px] focus:!border-white focus-visible:ring-0" placeholder="search for an Ad" />
              <Search size={16} color="#FFFFFF50" className="absolute left-2" />
            </div>
            <div className="p-2 bg-white/3 text-sm text-[#FFFFFF80] border-[0.5px] border-[#FFFFFF20] flex items-center gap-1 rounded-lg">
              <ListFilter size={15} color="#FFFFFF80" /> <span>Filter</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto mb-8">
          {tags.map((tag) => (
            <span key={tag} className="rounded-[20px] border min-w-fit border-white/20 bg-white/8 p-2 text-white">{tag}</span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center sm:justify-items-stretch">
          {MOCK_ADS.map((ad) => (
            <Link
              key={ad.id}
              href={`/marketplace/${ad.id}`}
              className="w-full max-w-sm rounded-lg border border-white/10 overflow-hidden shrink-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <div className="relative aspect-[4/3]">
                <div className="absolute top-0 left-0 flex border-[0.5px] border-white/20 rounded-br-lg rounded-tl-lg items-center gap-1 bg-[#FFCB450A] px-2 py-1 text-xs text-[#FFCB45B2]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{ad.duration}</span>
                </div>
                <div className="absolute top-0 right-0 h-5.5 w-10 rounded-bl-lg bg-[#892BFF]/20 flex items-center justify-center">
                  <BadgeCheck color="#892BFF" className="h-4 w-4 text-white" />
                </div>
                <div className="absolute top-10 w-full h-full px-2.5 rounded-[6px]">
                  <Image className="w-full h-full object-cover rounded-[6px]" src="/space-thumbnail.png" alt="Ad Image" width={600} height={600} />
                </div>
              </div>
              <div className="p-2.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white truncate flex-1">{ad.title}</h3>
                  <button type="button" className="text-white/60 hover:text-white p-1" aria-label="More options" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg text-white">{ad.title} <sup className="text-xs text-white/50">{ad.age}</sup></p>
                  <button type="button" className="text-white hover:text-white p-1" onClick={(e) => e.stopPropagation()}>
                    <EllipsisVertical className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-white/60">by <span className="text-white hover:underline break-all text-sm">{ad.by}</span></p>
                <p className="text-sm text-white/50"><span className="text-white">Skill needed:</span> None</p>
                <div className="pt-5 bg-[#060708] px-5 py-4 flex items-center justify-between">
                  <div className="text-center w-1/2 border-r border-white/10">
                    <p className="text-xs text-white/60 mb-2">Payment</p>
                    <p className="text-xs text-white/80">{ad.payment}</p>
                  </div>
                  <div className="text-center w-1/2">
                    <p className="text-xs text-white/60 mb-2">Price</p>
                    <p className="text-xs text-white/80">{ad.price}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-4">
                  {ad.tags.map((tag) => (
                    <span key={tag} className="rounded-[4px] bg-white/10 p-2 text-[10px] text-white">#{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
