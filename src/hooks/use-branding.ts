"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useBranding() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/settings/branding",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    branding: data || { clubName: "B-Club Badminton", logo: "", favicon: "" },
    isLoading,
    isError: !!error,
    mutate,
  };
}
