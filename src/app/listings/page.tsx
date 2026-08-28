"use client";

import { useQuery } from "@tanstack/react-query";
import Highlights from "@/app/listings/features/Highlights";
import Listing from "@/app/listings/features/Listing";
import { ApiCoinItem } from "@/types/api";
import { listingKeys } from "@/lib/queryKeys";
import { fetchListingHighlights } from "@/services/listingPublicService";
import { useTranslation } from "react-i18next";

export default function Listings() {
  const { t } = useTranslation();
  const backendConfigured = !!process.env.NEXT_PUBLIC_BACKEND_URL;

  const highlightsQuery = useQuery({
    queryKey: listingKeys.highlights(),
    queryFn: ({ signal }) => fetchListingHighlights(signal),
    enabled: backendConfigured,
    staleTime: 60_000,
  });

  const apiData: ApiCoinItem[] = highlightsQuery.data ?? [];
  const isLoading = backendConfigured && highlightsQuery.isPending;

  return (
    <div>
      {highlightsQuery.isError && (
        <div
          className="mx-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200/90"
          role="alert"
        >
          <span>{t("listings.highlightsError")}</span>
          <button
            type="button"
            className="shrink-0 rounded-md border border-amber-400/40 px-2 py-1 text-xs font-medium text-amber-100 hover:bg-amber-500/20"
            onClick={() => highlightsQuery.refetch()}
          >
            {t("common.retry")}
          </button>
        </div>
      )}
      <Highlights apiData={apiData} isLoading={isLoading} />
      <Listing />
    </div>
  );
}
