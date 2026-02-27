"use client";

import {
  AreaChart,
  Area,
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
  const colorLight = isSmash ? "#60a5fa" : "#4ade80";
  const gradientId = isSmash ? "gradientSmash" : "gradientSkor";

  const yDomain: [number, number] = isSmash ? [0, 400] : [0, 100];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          opacity={0.4}
          vertical={false}
        />
        <XAxis
          dataKey="week"
          stroke="var(--color-muted-foreground)"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={yDomain}
          width={35}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            color: "var(--color-foreground)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          }}
          formatter={(value) => [
            isSmash ? `${value} km/h` : `${value}/100`,
            label,
          ]}
        />
        <Area
          type="monotone"
          dataKey={mode}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={{ fill: color, strokeWidth: 2, r: 4, stroke: "var(--color-card)" }}
          activeDot={{ r: 6, fill: colorLight, stroke: color, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
