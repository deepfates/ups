/**
 * DataTable component for displaying scores in scientific paper format.
 * Shows dimension, score, and observation with proper table styling.
 */

import type { JudgeResult } from "../core/types";

interface Props {
  scores: JudgeResult[];
  title?: string;
}

export function ScoreTable({ scores, title = "Experimental Results" }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[0.9rem]">
        <caption className="text-left text-[0.85rem] text-[var(--color-ink-muted)] italic mb-2">
          <strong>Table 2:</strong> {title}
        </caption>
        <thead>
          <tr className="border-t-2 border-b border-[var(--color-ink)]">
            <th className="text-left py-2 px-3 font-semibold">Dimension</th>
            <th className="text-center py-2 px-3 font-semibold">Score</th>
            <th className="text-left py-2 px-3 font-semibold">Observation</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, i) => (
            <tr
              key={score.dimension}
              className={i === scores.length - 1 ? "border-b-2 border-[var(--color-ink)]" : "border-b border-[var(--color-border)]"}
            >
              <td className="py-2 px-3 capitalize font-medium">
                {score.dimension}
              </td>
              <td className="py-2 px-3 text-center font-mono">
                {score.score.toFixed(1)}
              </td>
              <td className="py-2 px-3 text-[var(--color-ink-light)] italic">
                {score.observation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
