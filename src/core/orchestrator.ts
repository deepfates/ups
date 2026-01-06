/**
 * Orchestrator — coordinates judges and classification.
 * This is the main entry point for running a visual test.
 */

import { AxAI } from "@ax-llm/ax";
import type { VisualTest, TestResult } from "./types";
import { runJudges } from "./judge";

/**
 * Run a complete visual test on an image.
 * 
 * Flow:
 * 1. Run all judges in parallel (VLM calls)
 * 2. Apply classify() function (deterministic)
 * 3. Return result with pre-written content (no explainer VLM call needed)
 */
export async function runVisualTest(
  ai: AxAI,
  test: VisualTest,
  image: string
): Promise<TestResult> {
  const totalStart = performance.now();
  
  // Phase 1: Run judges in parallel
  console.log(`  → Starting ${test.dimensions.length} parallel judges...`);
  const judgeStart = performance.now();
  const { results: scores, failed } = await runJudges(ai, test.dimensions, image);
  const judgeLatencyMs = Math.round(performance.now() - judgeStart);
  
  // Log individual scores
  for (const score of scores) {
    console.log(`    ✓ ${score.dimension}: ${score.score} (${score.latencyMs}ms)`);
  }
  if (failed.length > 0) {
    console.log(`    ✗ Failed: ${failed.join(", ")}`);
  }
  
  // Build scores map for classification
  const scoresMap: Record<string, number> = {};
  for (const score of scores) {
    scoresMap[score.dimension] = score.score;
  }
  
  // Phase 2: Deterministic classification (instant!)
  const categoryId = test.classify(scoresMap);
  const category = test.categories.find(c => c.id === categoryId);
  
  if (!category) {
    throw new Error(`Classification returned unknown category: ${categoryId}`);
  }
  
  console.log(`  → Classification: ${category.name}`);
  
  const totalLatencyMs = Math.round(performance.now() - totalStart);
  
  return {
    testId: test.id,
    category,
    explanation: category.content.body, // Use pre-written content
    scores,
    meta: {
      totalLatencyMs,
      judgeLatencyMs,
      explainerLatencyMs: 0, // No explainer call needed
      model: "gemini-3-flash",
      failedDimensions: failed,
    },
  };
}
