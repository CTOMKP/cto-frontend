"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ApiCoinItem } from "@/types/api";
import { Info } from "./features/ProjectProfileInfoTabs";
import LoadingSkeleton from "./features/LoadingSkeleton";
import ProjectHeader from "./features/ProjectHeader";
import ProjectInfoSection from "./features/ProjectInfoSection";
import Chart from "./features/Chart";
import CommunityVote from "./features/CommunityVote";
import SwapWidget from "./features/SwapWidget";
import ActivitiesSection from "./features/ActivitiesSection";
import { formatAgeYMD } from "@/app/listings/features/utils/listingUtils";

export default function ProjectProfilePage() {
  const [info, setInfo] = useState<Info>("about");
  const { id } = useParams();
  const searchParams = useSearchParams();
  const addressFromQuery = searchParams.get("address");
  const [projectData, setProjectData] = useState<ApiCoinItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to format relative age
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

  // Helper function to format joined date
  function formatJoinedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  }

  // Helper function to format age from string (e.g., "633 days") to "1y 2mo 3d"
  function formatAge(ageString: string | null): string {
    if (!ageString) return "0d";
    const formatted = formatAgeYMD(ageString);
    return formatted || "0d";
  }

  // Fetch project data from API
  useEffect(() => {
    const fetchProjectData = async () => {
      const idParam = Array.isArray(id) ? id[0] : id;
      const fetchId = addressFromQuery || idParam;
      if (!fetchId) return;
      
      setIsLoading(true);
      const base = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!base) {
        setIsLoading(false);
        return;
      }

      const url = `${base}/api/v1/listing/${fetchId}`;
      
      try {
        const res = await fetch(url);
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        
        const response = await res.json();
        // Handle wrapped response from TransformInterceptor
        const data: ApiCoinItem = response?.data || response;
        
        setProjectData(data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [id, addressFromQuery]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <main>
      <ProjectHeader 
        projectData={projectData} 
        formatJoinedDate={formatJoinedDate}
      />

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