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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="month"
          stroke="#4a7a5a"
          tick={{ fill: "#6a9a7a", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          stroke="#4a7a5a"
          tick={{ fill: "#6a9a7a", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(10, 26, 15, 0.95)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "12px",
            color: "#e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
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
