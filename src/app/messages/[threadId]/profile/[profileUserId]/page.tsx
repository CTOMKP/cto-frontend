"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

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
