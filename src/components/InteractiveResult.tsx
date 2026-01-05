/**
 * InteractiveResult component — displays result with radar chart and data table.
 * Styled like a scientific paper figure with proper captions.
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
    <article className="space-y-10">
      {/* Section: Classification Result */}
      <section>
        <h2 className="text-lg font-semibold mb-3 border-b border-[var(--color-ink)] pb-1">
          2. Classification Result
        </h2>
        
        {/* Result Box - Theorem Style */}
        <div className="p-5 bg-[var(--color-figure-bg)] border border-[var(--color-border)] border-l-4 border-l-[var(--color-ink)]">
          <p className="text-sm text-[var(--color-ink-muted)] mb-2">
            <strong>Classification:</strong>
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.content.emoji}</span>
            <div>
              <h3 className="text-xl font-semibold m-0">{category.name}</h3>
              <p className="text-[var(--color-ink-muted)] italic text-sm m-0">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Score Visualization */}
      <section>
        <h2 className="text-lg font-semibold mb-3 border-b border-[var(--color-ink)] pb-1">
          3. Dimensional Analysis
        </h2>

        {/* Radar Chart Figure */}
        <figure className="border border-[var(--color-border)] bg-white p-4 mb-4">
          <ScoreRadarChart scores={currentScores} />
          <figcaption className="text-center text-[0.85rem] text-[var(--color-ink-muted)] italic mt-2">
            <strong>Figure 2:</strong> Radar plot of extracted dimensional scores (n=3).
            {isAdjusted && " User-adjusted values shown."}
          </figcaption>
        </figure>

        {/* Data Table */}
        <div className="border border-[var(--color-border)] bg-white p-4">
          <ScoreTable 
            scores={currentScores} 
            title="Dimensional feature extraction results" 
          />
        </div>
      </section>

      {/* Section: Interpretation */}
      <section>
        <h2 className="text-lg font-semibold mb-3 border-b border-[var(--color-ink)] pb-1">
          4. Interpretation
        </h2>

        <div className="prose prose-sm max-w-none">
          <p className="text-justify hyphens-auto leading-relaxed mb-4">
            {category.content.body}
          </p>

          {/* Keywords */}
          <p className="text-sm text-[var(--color-ink-muted)] mb-3">
            <strong>Keywords:</strong>{" "}
            {category.content.traits.map((trait, i) => (
              <span key={trait}>
                <em>{trait.toLowerCase()}</em>
                {i < category.content.traits.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>

          {/* Remark Box */}
          {category.content.advice && (
            <div className="bg-amber-50 border border-amber-200 border-l-[3px] border-l-amber-500 p-3 text-[0.9rem] not-italic">
              <strong>Remark 1.</strong> {category.content.advice}
            </div>
          )}
        </div>
      </section>

      {/* Parameters - Collapsible */}
      <Collapsible.Root open={parametersOpen} onOpenChange={setParametersOpen}>
        <section className="border border-[var(--color-border)]">
          <Collapsible.Trigger asChild>
            <button className="w-full flex justify-between items-center p-3 bg-[var(--color-figure-bg)] hover:bg-[var(--color-paper-dark)] transition-colors border-b border-[var(--color-border)]">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-ink-light)] m-0">
                Appendix: Parameter Adjustment
              </h2>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-[var(--color-ink-muted)] transition-transform",
                  parametersOpen && "rotate-180"
                )}
              />
            </button>
          </Collapsible.Trigger>

          <Collapsible.Content>
            <div className="p-4 bg-white">
              <p className="text-sm text-[var(--color-ink-muted)] italic mb-4">
                Adjust parameters to explore alternative classifications. 
                The radar chart and table update in real-time.
              </p>

              {isAdjusted && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-[var(--color-accent)] text-[0.8rem] font-mono mb-4 hover:underline"
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
              <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">
                  Classification Outcomes:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {test.categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={cn(
                        "py-2 px-2 text-[0.8rem] border transition-all text-center",
                        cat.id === categoryId
                          ? "bg-[var(--color-ink)] border-[var(--color-ink)] text-white"
                          : "bg-[var(--color-figure-bg)] border-[var(--color-border)] text-[var(--color-ink-light)] hover:bg-[var(--color-paper-dark)]"
                      )}
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
