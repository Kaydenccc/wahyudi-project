"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface UseAttendanceParams {
  search?: string;
  status?: string;
  scheduleId?: string;
  page?: number;
  limit?: number;
}

export function useAttendance(params: UseAttendanceParams = {}) {
  const { search = "", status = "", scheduleId = "", page = 1, limit = 20 } = params;

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (status) query.set("status", status);
  if (scheduleId) query.set("scheduleId", scheduleId);
  query.set("page", page.toString());
  query.set("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/attendance?${query.toString()}`,
    fetcher
  );

  return {
    records: data?.records || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading,
    isError: !!error,
    mutate,
  };
}
