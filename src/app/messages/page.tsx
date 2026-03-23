"use client";

import React from "react";
import MarketplaceMessages from "@/components/Messages/MarketplaceMessages";

export default function MessagesHomePage() {
  // MarketplaceMessages will pick the first available thread.
  return <MarketplaceMessages initialThreadId={null} />;
}

