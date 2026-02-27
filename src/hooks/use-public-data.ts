"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function usePublicClub() {
  const { data, error, isLoading } = useSWR(
    "/api/public/club",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    club: data?.club || null,
    stats: data?.stats || { totalAthletes: 0, totalPrograms: 0, totalAchievements: 0 },
    featuredAthletes: data?.featuredAthletes || [],
    recentAchievements: data?.recentAchievements || [],
    isLoading,
    isError: !!error,
  };
}

interface UsePublicAthletesParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export function usePublicAthletes(params: UsePublicAthletesParams = {}) {
  const { search = "", category = "", page = 1, limit = 12 } = params;

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (category) query.set("category", category);
  query.set("page", page.toString());
  query.set("limit", limit.toString());

  const { data, error, isLoading } = useSWR(
    `/api/public/athletes?${query.toString()}`,
    fetcher
  );

  return {
    athletes: data?.athletes || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 },
    isLoading,
    isError: !!error,
  };
}

export function usePublicAthlete(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/public/athletes/${id}` : null,
    fetcher
  );

  return {
    athlete: data?.athlete || null,
    achievements: data?.achievements || [],
    performance: data?.performance || { avgScore: 0, attendance: 0, totalSessions: 0, recent: [] },
    isLoading,
    isError: !!error,
  };
}
