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
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
        <XAxis
          dataKey="week"
          stroke="var(--color-muted-foreground)"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--color-border)" }}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--color-border)" }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
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
