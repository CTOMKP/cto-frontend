"use client";

import React from "react";
import { useParams } from "next/navigation";
import MarketplaceMessages from "@/components/Messages/MarketplaceMessages";

export default function MessagesProfilePage() {
  const params = useParams();
  const threadId =
    typeof params?.threadId === "string" ? params.threadId : null;
  const profileUserId =
    typeof params?.profileUserId === "string"
      ? params.profileUserId
      : null;
  return (
    <MarketplaceMessages
      initialThreadId={threadId}
      initialProfileUserId={profileUserId}
    />
  );
}
