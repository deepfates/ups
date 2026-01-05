/**
 * Core types for the visual judgment framework.
 * Domain-agnostic — specific tests plug in via configuration.
 */

/**
 * A dimension to evaluate in an image.
 * Each dimension becomes one parallel VLM judge call.
 */
export interface Dimension {
  id: string;
  prompt: string;           // What to ask the VLM, e.g., "Rate the warmth of colors"
  scale: [number, number];  // e.g., [1, 10]
}

/**
 * A possible result category with rich pre-written content.
 */
export interface Category {
  id: string;
  name: string;
  description: string;      // Short tagline
  content: {
    headline: string;       // Result page headline
    body: string;           // 2-3 sentence explanation
    traits: string[];       // Key characteristics
    advice?: string;        // Optional suggestion/tip
    emoji: string;          // Visual identifier
  };
}

/**
 * A visual test configuration.
 * Defines dimensions to judge, possible categories, and the classification logic.
 */
export interface VisualTest {
  id: string;
  name: string;             // Display name, e.g., "What color season are you?"
  dimensions: Dimension[];
  categories: Category[];
  
  /**
   * Pure function mapping scores to a category ID.
   * This is deterministic and testable.
   */
  classify: (scores: Record<string, number>) => string;
}

/**
 * Result from a single judge (one dimension).
 */
export interface JudgeResult {
  dimension: string;        // Matches Dimension.id
  score: number;
  observation: string;      // Brief visual evidence for the score
  latencyMs: number;
}

/**
 * Final result of running a visual test.
 */
export interface TestResult {
  testId: string;
  category: Category;
  explanation: string;      // VLM-generated personalized text
  scores: JudgeResult[];
  meta: {
    totalLatencyMs: number;
    judgeLatencyMs: number;
    explainerLatencyMs: number;
    model: string;
    failedDimensions: string[];
  };
}

/**
 * Request payload for the analyze API.
 */
export interface AnalyzeRequest {
  testId: string;
  image: string;            // base64 encoded
}

/**
 * Response payload from the analyze API.
 */
export type AnalyzeResponse = 
  | { success: true; result: TestResult }
  | { success: false; error: string };
