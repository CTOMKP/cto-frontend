"use client";

import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { AllUserListings, ApiCoinItem } from "@/types/api";
import { Info } from "./features/ProjectProfileInfoTabs";
import LoadingSkeleton from "./features/LoadingSkeleton";
import ProjectHeader from "./features/ProjectHeader";
import ProjectInfoSection from "./features/ProjectInfoSection";
import Chart from "./features/Chart";
import CommunityVote from "./features/CommunityVote";
import SwapWidget from "./features/SwapWidget";
import ActivitiesSection from "./features/ActivitiesSection";
import { formatAgeYMD } from "@/app/listings/features/utils/listingUtils";
import { usePublicListingCoinQuery } from "@/hooks/usePublicListingCoinQuery";
import { usePublicUserListingQuery } from "@/hooks/usePublicUserListingQuery";
import { mapUserListingToApiCoinItem } from "@/lib/mapUserListingToApiCoinItem";

export default function ProjectProfilePage() {
  const [info, setInfo] = useState<Info>("about");
  const { id } = useParams();
  const searchParams = useSearchParams();
  const addressFromQuery = searchParams.get("address");
  const userListingId = searchParams.get("userListingId")?.trim() ?? "";

  const fetchKey = useMemo(() => {
    const idParam = Array.isArray(id) ? id[0] : id;
    const raw = addressFromQuery || idParam || "";
    return typeof raw === "string" ? raw.trim() : "";
  }, [id, addressFromQuery]);

  const publicListingQuery = usePublicListingCoinQuery(
    userListingId ? undefined : fetchKey || undefined,
  );
  const userListingQuery = usePublicUserListingQuery(
    userListingId || undefined,
  );

  const listingQuery = userListingId ? userListingQuery : publicListingQuery;
  const projectData: ApiCoinItem | null = userListingId
    ? userListingQuery.data
      ? mapUserListingToApiCoinItem(userListingQuery.data as AllUserListings)
      : null
    : ((publicListingQuery.data as ApiCoinItem | undefined) ?? null);

  function formatRelativeAge(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}hr`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    return `${months}mo`;
  }

  function formatJoinedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
  }

  function formatAge(ageString: string | null): string {
    if (!ageString) return "0d";
    const formatted = formatAgeYMD(ageString);
    return formatted || "0d";
  }

  if (!fetchKey && !userListingId) {
    return (
      <main className="min-h-[40vh] flex items-center justify-center text-white/70">
        <p>Missing project address or id.</p>
      </main>
    );
  }

  if (listingQuery.isPending) {
    return <LoadingSkeleton />;
  }

  if (listingQuery.isError) {
    return (
      <main className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-white px-4">
        <p className="text-white/70 text-center">Could not load this project.</p>
        <button
          type="button"
          className="rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
          onClick={() => listingQuery.refetch()}
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main>
      <ProjectHeader projectData={projectData} formatJoinedDate={formatJoinedDate} />

      <ProjectInfoSection
        info={info}
        setInfo={setInfo}
        projectData={projectData}
        formatAge={formatAge}
      />

      <div className="px-[100px] mt-4 flex gap-2 max-h-[812px]">
        <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] w-full p-[1px] rounded-xl inline-block">
          <div className="bg-[#010101] rounded-xl p-2 flex h-full">
            <Chart
              address={projectData?.contractAddress}
              chain={projectData?.chain}
            />
          </div>
        </div>

        <div className="min-w-[420px] block space-y-2">
          <CommunityVote />
          <SwapWidget />
        </div>
      </div>

      <div className="border-t-[0.5px] border-white/20 mt-4.5"></div>

      <ActivitiesSection projectData={projectData} />
    </main>
  );
}
