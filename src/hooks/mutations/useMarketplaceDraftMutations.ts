"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import marketplaceService from "@/services/marketplaceService";
import { invalidateListingAndMarketplaceQueries } from "@/lib/queryInvalidation";

/** Caller surfaces validation/network errors (e.g. post-ad `ensureDraftSaved`). */

export function useUpdateMarketplaceDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => marketplaceService.updateDraft(id, payload),
    onSuccess: async () => {
      await invalidateListingAndMarketplaceQueries(queryClient);
    },
  });
}

export function useCreateMarketplaceDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      marketplaceService.createDraft(payload),
    onSuccess: async () => {
      await invalidateListingAndMarketplaceQueries(queryClient);
    },
  });
}
