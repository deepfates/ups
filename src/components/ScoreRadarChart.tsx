/**
 * RadarChart component for visualizing multi-dimensional scores.
 * Styled to match scientific paper figures.
 */

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { JudgeResult } from "../core/types";

interface Props {
  scores: JudgeResult[];
  maxValue?: number;
}

export function ScoreRadarChart({ scores, maxValue = 10 }: Props) {
  const data = scores.map((s) => ({
    dimension: s.dimension.charAt(0).toUpperCase() + s.dimension.slice(1),
    value: s.score,
    fullMark: maxValue,
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "var(--color-ink-light)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, maxValue]}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="var(--color-ink)"
            fill="var(--color-ink)"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
