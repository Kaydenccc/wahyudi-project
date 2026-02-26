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
  { skill: "Smash", value: 0, fullMark: 10 },
  { skill: "Kelincahan", value: 0, fullMark: 10 },
  { skill: "Stamina", value: 0, fullMark: 10 },
  { skill: "Footwork", value: 0, fullMark: 10 },
  { skill: "Pertahanan", value: 0, fullMark: 10 },
  { skill: "Servis", value: 0, fullMark: 10 },
];

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{
            fill: "var(--color-primary)",
            fontSize: 11,
            fontWeight: 600,
          }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 10]}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Keterampilan"
          dataKey="value"
          stroke="var(--color-primary)"
          fill="var(--color-primary)"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
