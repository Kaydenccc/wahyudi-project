"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface UseProgramsParams {
  search?: string;
  type?: string;
}

export function usePrograms(params: UseProgramsParams = {}) {
  const { search = "", type = "" } = params;

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (type) query.set("type", type);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/programs?${query.toString()}`,
    fetcher
  );

  return {
    programs: data?.programs || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useProgram(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/programs/${id}` : null,
    fetcher
  );

  return {
    program: data || null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
