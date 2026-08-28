"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { profileKeys } from "@/lib/queryKeys";
import { isApiError } from "@/lib/apiError";
import type { User } from "@/types/auth.types";

type UpdateUserVariables = { userId: string; updates: Partial<User> };

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }: UpdateUserVariables) =>
      authService.updateUser(userId, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.detail(), updated);
    },
    onError: (error) => {
      const message = isApiError(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : "Could not update profile.";
      toast.error(message);
    },
  });
}
