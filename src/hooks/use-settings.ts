"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useClubSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/settings",
    fetcher
  );

  return {
    settings: data || null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
