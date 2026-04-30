"use client";

import { isApiError } from "@/lib/apiError";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (isApiError(error)) {
    if (error.status === 401 || error.status === 403 || error.status === 404) return false;
    if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
      return false;
    }
  }
  return true;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (process.env.NODE_ENV === "development") {
              console.error("[TanStack Query]", error);
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (process.env.NODE_ENV === "development") {
              console.error("[TanStack Mutation]", error);
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: shouldRetryQuery,
            refetchOnWindowFocus: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
