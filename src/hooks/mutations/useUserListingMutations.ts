"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userListingsService,
  type CreateUserListingPayload,
} from "@/services/userListingsService";
import { invalidateListingQueries } from "@/lib/queryInvalidation";
import { toastMutationError } from "./mutationToast";

/** Pass `meta.silent` to skip error toast (e.g. list-asset publish after payment). */
export type PublishUserListingVariables = {
  id: string;
  meta?: { silent?: boolean };
};

export function usePublishUserListingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: PublishUserListingVariables) =>
      userListingsService.publish(id),
    onSuccess: async () => {
      await invalidateListingQueries(queryClient);
    },
    onError: (e, variables) => {
      if (variables.meta?.silent) return;
      toastMutationError(e, "Could not publish listing.");
    },
  });
}

export function useCreateUserListingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserListingPayload) => userListingsService.create(payload),
    onSuccess: async () => {
      await invalidateListingQueries(queryClient);
    },
    onError: (e) => toastMutationError(e, "Could not create listing."),
  });
}

export function useUpdateUserListingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateUserListingPayload>;
    }) => userListingsService.update(id, payload),
    onSuccess: async () => {
      await invalidateListingQueries(queryClient);
    },
    onError: (e) => toastMutationError(e, "Could not update listing."),
  });
}
