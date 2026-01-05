/**
 * ResultCard component — displays the category, explanation, and scores.
 */

import type { TestResult } from "../core/types";

interface Props {
  result: TestResult;
}

export function ResultCard({ result }: Props) {
  const { category, explanation, scores, meta } = result;

  return (
    <div className="result-card">
      <div className="result-header">
        <h2 className="category-name">{category.name}</h2>
        <p className="category-description">{category.description}</p>
      </div>

      <div className="explanation">
        <p>{explanation}</p>
      </div>

      <details className="scores-details">
        <summary>View scores ({scores.length} dimensions)</summary>
        <div className="scores-grid">
          {scores.map((score) => (
            <div key={score.dimension} className="score-item">
              <div className="score-header">
                <span className="dimension-name">{score.dimension}</span>
                <span className="score-value">{score.score}</span>
              </div>
              <p className="observation">{score.observation}</p>
            </div>
          ))}
        </div>
      </details>

      <div className="meta-info">
        <span>⚡ {meta.totalLatencyMs}ms</span>
        <span>🤖 {meta.model}</span>
        {meta.failedDimensions.length > 0 && (
          <span className="warning">
            ⚠️ {meta.failedDimensions.length} failed
          </span>
        )}
      </div>
    </div>
  );
}
