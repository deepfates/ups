/**
 * Judge module — creates Ax signatures for each dimension.
 * Runs parallel VLM calls to extract scores and observations from an image.
 */

import { AxAI, ax, type AxFunction } from "@ax-llm/ax";
import type { Dimension, JudgeResult } from "./types";

/**
 * Create an Ax-powered judge for a single dimension.
 */
export function createJudge(dimension: Dimension) {
  const [min, max] = dimension.scale;
  
  // DSPy-style signature: sourceImage + prompt -> score + observation
  const signature = ax(`
    sourceImage:image, judgePrompt:string -> 
      score:number "integer from ${min} to ${max}",
      observation:string "brief visual evidence for this score, 1-2 sentences"
  `);
  
  return {
    dimension,
    signature,
  };
}

/**
 * Run a single judge and return the result.
 */
async function runJudge(
  ai: AxAI,
  judge: ReturnType<typeof createJudge>,
  image: string
): Promise<JudgeResult> {
  const start = performance.now();
  
  const result = await judge.signature.forward(ai, {
    sourceImage: { data: image, mimeType: "image/jpeg" },
    judgePrompt: judge.dimension.prompt,
  });
  
  const latencyMs = Math.round(performance.now() - start);
  
  return {
    dimension: judge.dimension.id,
    score: result.score,
    observation: result.observation,
    latencyMs,
  };
}

/**
 * Run all judges in parallel.
 * Returns results for successful judges and tracks failures.
 */
export async function runJudges(
  ai: AxAI,
  dimensions: Dimension[],
  image: string
): Promise<{ results: JudgeResult[]; failed: string[] }> {
  const judges = dimensions.map(createJudge);
  
  const outcomes = await Promise.allSettled(
    judges.map(judge => runJudge(ai, judge, image))
  );
  
  const results: JudgeResult[] = [];
  const failed: string[] = [];
  
  outcomes.forEach((outcome, i) => {
    if (outcome.status === "fulfilled") {
      results.push(outcome.value);
    } else {
      failed.push(dimensions[i].id);
      console.error(`Judge ${dimensions[i].id} failed:`, outcome.reason);
    }
  });
  
  return { results, failed };
}
