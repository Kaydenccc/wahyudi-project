"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface UsePerformanceParams {
  search?: string;
  status?: string;
}

export function usePerformance(params: UsePerformanceParams = {}) {
  const { search = "", status = "" } = params;

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (status) query.set("status", status);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/performance?${query.toString()}`,
    fetcher
  );

  return {
    athletes: data?.athletes || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useAthletePerformance(athleteId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    athleteId ? `/api/performance/${athleteId}` : null,
    fetcher
  );

  return {
    data: data || null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
