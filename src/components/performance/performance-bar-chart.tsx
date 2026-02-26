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

interface BarData {
  week: string;
  smash: number;
  skor: number;
}

interface PerformanceBarChartProps {
  mode: "smash" | "skor";
  data?: BarData[];
}

export function PerformanceBarChart({ mode, data = [] }: PerformanceBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
        Belum ada data performa.
      </div>
    );
  }

  const isSmash = mode === "smash";
  const label = isSmash ? "Kec. Smash (km/h)" : "Skor Performa";
  const color = isSmash ? "#3b82f6" : "#22c55e";

  // Auto domain for smash speed
  const yDomain: [number, number] = isSmash ? [0, 400] : [0, 100];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
        />
        <XAxis
          dataKey="week"
          stroke="#4a7a5a"
          tick={{ fill: "#6a9a7a", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          stroke="#4a7a5a"
          tick={{ fill: "#6a9a7a", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          domain={yDomain}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(10, 26, 15, 0.95)",
            border: `1px solid ${color}50`,
            borderRadius: "12px",
            color: "#e2e8f0",
          }}
          formatter={(value) => [
            isSmash ? `${value} km/h` : `${value}/100`,
            label,
          ]}
        />
        <Bar
          dataKey={mode}
          fill={color}
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
