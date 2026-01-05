/**
 * InteractiveResult component — displays result with radar chart and data table.
 * Uses latex.css for styling, minimal custom overrides.
 */

import { useState, useMemo } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, RotateCcw } from "lucide-react";
import type { VisualTest, JudgeResult } from "../core/types";
import { DimensionSlider } from "./DimensionSlider";
import { ScoreRadarChart } from "./ScoreRadarChart";
import { ScoreTable } from "./ScoreTable";
import { cn } from "../lib/utils";

interface Props {
  test: VisualTest;
  initialScores: JudgeResult[];
}

export function InteractiveResult({ test, initialScores }: Props) {
  // Convert JudgeResult[] to editable scores map
  const initialScoresMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const score of initialScores) {
      map[score.dimension] = score.score;
    }
    return map;
  }, [initialScores]);

  // Observations for display
  const observations = useMemo(() => {
    const map: Record<string, string> = {};
    for (const score of initialScores) {
      map[score.dimension] = score.observation;
    }
    return map;
  }, [initialScores]);

  const [scores, setScores] = useState(initialScoresMap);
  const [isAdjusted, setIsAdjusted] = useState(false);
  const [parametersOpen, setParametersOpen] = useState(false);

  // Current scores as JudgeResult array for charts
  const currentScores: JudgeResult[] = test.dimensions.map((dim) => ({
    dimension: dim.id,
    score: scores[dim.id] ?? 5,
    observation: observations[dim.id] ?? "",
    latencyMs: 0,
  }));

  // Deterministic category lookup — instant!
  const categoryId = test.classify(scores);
  const category = test.categories.find((c) => c.id === categoryId)!;

  const handleScoreChange = (dimensionId: string, value: number) => {
    setScores((prev) => ({ ...prev, [dimensionId]: value }));
    setIsAdjusted(true);
  };

  const handleReset = () => {
    setScores(initialScoresMap);
    setIsAdjusted(false);
  };

  return (
    <article>
      {/* Section: Classification Result */}
      <section>
        <h2>2. Classification Result</h2>
        
        <p>
          Based on the extracted features, the subject is classified as{" "}
          <strong>{category.name}</strong> ({category.description}).
        </p>
        <p className="text-center" style={{ fontSize: "2.5rem", margin: "1rem 0" }}>
          {category.content.emoji}
        </p>
      </section>

      {/* Section: Score Visualization */}
      <section>
        <h2>3. Dimensional Analysis</h2>

        {/* Radar Chart Figure */}
        <figure>
          <ScoreRadarChart scores={currentScores} />
          <figcaption>
            Radar plot of extracted dimensional scores (n=3).
            {isAdjusted && " User-adjusted values shown."}
          </figcaption>
        </figure>

        {/* Data Table */}
        <ScoreTable scores={currentScores} />
      </section>

      {/* Section: Interpretation */}
      <section>
        <h2>4. Interpretation</h2>

        <p>{category.content.body}</p>

        <p>
          <em>
            <strong>Keywords:</strong>{" "}
            {category.content.traits.map((t) => t.toLowerCase()).join(", ")}.
          </em>
        </p>

        {/* Remark Box */}
        {category.content.advice && (
          <blockquote>
            <strong>Remark.</strong> {category.content.advice}
          </blockquote>
        )}
      </section>

      {/* Parameters - Collapsible Appendix */}
      <Collapsible.Root open={parametersOpen} onOpenChange={setParametersOpen}>
        <section>
          <Collapsible.Trigger asChild>
            <button 
              className="w-full flex justify-between items-center p-3 text-left"
              style={{ 
                background: "var(--body-bg-color)", 
                border: "1px solid var(--table-border-color, #000)",
                cursor: "pointer"
              }}
            >
              <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                Appendix: Parameter Adjustment
              </span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  parametersOpen && "rotate-180"
                )}
              />
            </button>
          </Collapsible.Trigger>

          <Collapsible.Content>
            <div 
              className="p-4" 
              style={{ 
                border: "1px solid var(--table-border-color, #000)",
                borderTop: "none"
              }}
            >
              <p className="no-indent">
                <em>Adjust parameters to explore alternative classifications. 
                The radar chart and table update in real-time.</em>
              </p>

              {isAdjusted && (
                <button
                  onClick={handleReset}
                  style={{ 
                    color: "var(--link-visited, hsl(0, 100%, 33%))",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    marginBottom: "1rem"
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to observed values
                </button>
              )}

              <div className="space-y-4">
                {test.dimensions.map((dim) => (
                  <DimensionSlider
                    key={dim.id}
                    label={dim.id}
                    value={scores[dim.id] ?? 5}
                    min={dim.scale[0]}
                    max={dim.scale[1]}
                    onChange={(v) => handleScoreChange(dim.id, v)}
                  />
                ))}
              </div>

              {/* Category Quick Select */}
              <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #ccc" }}>
                <p className="no-indent" style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  <em>Quick classification presets:</em>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {test.categories.map((cat) => (
                    <button
                      key={cat.id}
                      style={{
                        padding: "0.5rem",
                        fontSize: "0.8rem",
                        border: "1px solid",
                        borderColor: cat.id === categoryId ? "var(--body-color)" : "#ccc",
                        background: cat.id === categoryId ? "var(--body-color)" : "transparent",
                        color: cat.id === categoryId ? "var(--body-bg-color)" : "inherit",
                        cursor: "pointer",
                        borderRadius: 0
                      }}
                      onClick={() => {
                        if (cat.id === "spring")
                          setScores({ warmth: 8, saturation: 8, value: 4 });
                        else if (cat.id === "summer")
                          setScores({ warmth: 3, saturation: 3, value: 4 });
                        else if (cat.id === "autumn")
                          setScores({ warmth: 8, saturation: 4, value: 7 });
                        else if (cat.id === "winter")
                          setScores({ warmth: 3, saturation: 8, value: 8 });
                        setIsAdjusted(true);
                      }}
                    >
                      {cat.content.emoji} {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Collapsible.Content>
        </section>
      </Collapsible.Root>
    </article>
  );
}
