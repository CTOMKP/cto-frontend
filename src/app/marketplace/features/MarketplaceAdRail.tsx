"use client";

import { useEffect, useState } from "react";
import MarketplaceAdCard from "./MarketplaceAdCard";
import type { MarketplaceAd } from "./marketplaceAd";

export default function MarketplaceAdRail({
  title,
  ads,
}: {
  title: string;
  ads: MarketplaceAd[];
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (ads.length === 0) return null;

  return (
    <section className="w-full min-w-0">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="flex w-full min-w-0 items-stretch gap-2 overflow-x-auto hover-scrollbar pb-2 snap-x snap-mandatory">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="flex w-[min(100%,370px)] min-w-[min(100%,370px)] max-w-[370px] shrink-0 snap-start"
          >
            <MarketplaceAdCard ad={ad} now={now} />
          </div>
        ))}
      </div>
    </section>
  );
}
