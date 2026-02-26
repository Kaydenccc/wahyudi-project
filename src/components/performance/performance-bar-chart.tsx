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
          stroke="var(--color-border)"
          opacity={0.5}
        />
        <XAxis
          dataKey="week"
          stroke="var(--color-muted-foreground)"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          axisLine={{ stroke: "var(--color-border)" }}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          axisLine={{ stroke: "var(--color-border)" }}
          domain={yDomain}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
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
