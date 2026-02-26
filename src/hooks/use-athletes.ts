"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface UseAthletesParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useAthletes(params: UseAthletesParams = {}) {
  const { search = "", category = "", status = "", page = 1, limit = 10 } = params;

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (category) query.set("category", category);
  if (status) query.set("status", status);
  query.set("page", page.toString());
  query.set("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/athletes?${query.toString()}`,
    fetcher
  );

  return {
    athletes: data?.athletes || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 },
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useAthlete(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/athletes/${id}` : null,
    fetcher
  );

  return {
    athlete: data || null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
