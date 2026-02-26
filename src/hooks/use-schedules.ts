"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface UseSchedulesParams {
  status?: string;
  date?: string;
}

export function useSchedules(params: UseSchedulesParams = {}) {
  const { status = "", date = "" } = params;

  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (date) query.set("date", date);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/schedules?${query.toString()}`,
    fetcher
  );

  return {
    schedules: data?.schedules || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
