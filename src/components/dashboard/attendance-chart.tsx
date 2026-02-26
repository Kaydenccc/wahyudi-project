"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardStats } from "@/hooks/use-dashboard";

export function AttendanceChart() {
  const { stats, isLoading } = useDashboardStats();
  const data = stats?.weeklyAttendance || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
        Memuat...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
        Belum ada data kehadiran.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="week"
          stroke="#4a7a5a"
          tick={{ fill: "#6a9a7a", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          stroke="#4a7a5a"
          tick={{ fill: "#6a9a7a", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(10, 26, 15, 0.95)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "12px",
            color: "#e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
          formatter={(value) => [`${value}%`, "Kehadiran"]}
        />
        <Bar
          dataKey="percentage"
          fill="#22c55e"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
