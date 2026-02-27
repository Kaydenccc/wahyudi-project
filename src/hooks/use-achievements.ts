"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface UseAchievementsParams {
  athleteId?: string;
  category?: string;
  level?: string;
  page?: number;
  limit?: number;
}

export function useAchievements(params: UseAchievementsParams = {}) {
  const { athleteId = "", category = "", level = "", page = 1, limit = 20 } = params;

  const query = new URLSearchParams();
  if (athleteId) query.set("athleteId", athleteId);
  if (category) query.set("category", category);
  if (level) query.set("level", level);
  query.set("page", page.toString());
  query.set("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/achievements?${query.toString()}`,
    fetcher
  );

  return {
    achievements: data?.achievements || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading,
    isError: !!error,
    mutate,
  };
}
