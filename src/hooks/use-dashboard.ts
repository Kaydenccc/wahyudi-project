"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/dashboard/stats",
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  return {
    stats: data || null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
