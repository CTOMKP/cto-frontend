"use client";

import React from "react";
import dynamic from "next/dynamic";

const MarketplaceMessages = dynamic(
  () => import("@/components/Messages/MarketplaceMessages"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        Loading messages...
      </div>
    ),
  },
);

export default function MessagesPage() {
  return <MarketplaceMessages />;
}
