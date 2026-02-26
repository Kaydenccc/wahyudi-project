"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/users",
    fetcher
  );

  return {
    users: data?.users || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
