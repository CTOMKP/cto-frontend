"use client";

import React from "react";
import { useParams } from "next/navigation";
import MarketplaceMessages from "@/components/Messages/MarketplaceMessages";

export default function MessagesThreadPage() {
  const params = useParams();
  const threadId =
    typeof params?.threadId === "string" ? (params.threadId as string) : null;
  return <MarketplaceMessages initialThreadId={threadId} />;
}

