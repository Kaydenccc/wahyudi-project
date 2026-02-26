"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface SkillData {
  skill: string;
  value: number;
  fullMark: number;
}

interface SkillRadarChartProps {
  data?: SkillData[];
}

const defaultData: SkillData[] = [
  { skill: "SMASH", value: 0, fullMark: 10 },
  { skill: "AGILITY", value: 0, fullMark: 10 },
  { skill: "STAMINA", value: 0, fullMark: 10 },
  { skill: "FOOTWORK", value: 0, fullMark: 10 },
  { skill: "DEFENSE", value: 0, fullMark: 10 },
  { skill: "SERVE", value: 0, fullMark: 10 },
];

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
        <PolarGrid stroke="rgba(34, 197, 94, 0.15)" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{
            fill: "#4ade80",
            fontSize: 11,
            fontWeight: 600,
          }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 10]}
          tick={{ fill: "#6a9a7a", fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Skills"
          dataKey="value"
          stroke="#22c55e"
          fill="#22c55e"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
