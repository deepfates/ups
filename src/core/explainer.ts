/**
 * Explainer module — generates personalized prose for the result.
 * Sees the original image + all scores + category for context.
 */

import { AxAI, ax } from "@ax-llm/ax";
import type { Category, JudgeResult } from "./types";

/**
 * Ax signature for generating the explanation.
 */
const explainerSignature = ax(`
  sourceImage:image,
  categoryName:string,
  categoryDescription:string,
  scoresJson:string
  -> explanation:string "2-3 sentences, personalized, reference specific visual details from the image"
`);

/**
 * Generate a personalized explanation for the result.
 */
export async function generateExplanation(
  ai: AxAI,
  image: string,
  category: Category,
  scores: JudgeResult[]
): Promise<{ explanation: string; latencyMs: number }> {
  const start = performance.now();
  
  // Format scores for the VLM to understand
  const scoresJson = JSON.stringify(
    scores.map(s => ({
      dimension: s.dimension,
      score: s.score,
      observation: s.observation,
    })),
    null,
    2
  );
  
  const result = await explainerSignature.forward(ai, {
    sourceImage: { data: image, mimeType: "image/jpeg" },
    categoryName: category.name,
    categoryDescription: category.description,
    scoresJson,
  });
  
  const latencyMs = Math.round(performance.now() - start);
  
  return {
    explanation: result.explanation,
    latencyMs,
  };
}
