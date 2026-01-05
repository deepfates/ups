/**
 * DataTable component for displaying scores in scientific paper format.
 * Uses latex.css automatic table counter for caption.
 */

import type { JudgeResult } from "../core/types";

interface Props {
  scores: JudgeResult[];
  title?: string;
}

export function ScoreTable({ scores, title = "Dimensional feature extraction results" }: Props) {
  return (
    <table>
      <caption>{title}</caption>
      <thead>
        <tr>
          <th>Dimension</th>
          <th>Score</th>
          <th>Observation</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((score) => (
          <tr key={score.dimension}>
            <td className="capitalize">{score.dimension}</td>
            <td className="text-center font-mono">{score.score.toFixed(1)}</td>
            <td className="italic">{score.observation}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
