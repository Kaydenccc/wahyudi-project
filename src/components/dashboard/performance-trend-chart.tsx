"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useDashboardStats } from "@/hooks/use-dashboard";

export function PerformanceTrendChart() {
  const { stats, isLoading } = useDashboardStats();
  const data = stats?.performanceTrend || [];

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
        Belum ada data performa.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
        <XAxis
          dataKey="month"
          stroke="var(--color-muted-foreground)"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--color-border)" }}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--color-border)" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
          }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#22c55e"
          strokeWidth={3}
          fill="url(#colorScore)"
          dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: "#4ade80" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
