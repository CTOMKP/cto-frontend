"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ApiCoinItem } from "@/types/api";
import { Info } from "./features/ProjectProfileInfoTabs";
import LoadingSkeleton from "./features/LoadingSkeleton";
import ProjectHeader from "./features/ProjectHeader";
import ProjectInfoSection from "./features/ProjectInfoSection";
import Chart from "./features/Chart";
import CommunityVote from "./features/CommunityVote";
import SwapWidget from "./features/SwapWidget";
import ActivitiesSection from "./features/ActivitiesSection";

export default function ProjectProfilePage() {
  const [info, setInfo] = useState<Info>("about");
  const { id } = useParams();
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

  // Fetch project data from API
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      const base = process.env.NEXT_PUBLIC_BACKEND_URL;
      const url = `${base}/api/listing/${id}`;
      
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Failed to fetch project data');
          setIsLoading(false);
          return;
        }
        
        const data: ApiCoinItem = await res.json();
        setProjectData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

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
        formatRelativeAge={formatRelativeAge}
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
