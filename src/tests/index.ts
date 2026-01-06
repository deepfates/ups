/**
 * Tests module - registry of all available visual tests.
 */

import type { VisualTest } from "../core/types";
import { colorSeason } from "./color-season";

/**
 * Registry of all available tests.
 * Add new tests here to make them available in the app.
 */
export const tests: Record<string, VisualTest> = {
  [colorSeason.id]: colorSeason,
};

/**
 * Get a test by ID.
 */
export function getTest(id: string): VisualTest | undefined {
  return tests[id];
}

/**
 * Get all available tests as an array.
 */
export function getAllTests(): VisualTest[] {
  return Object.values(tests);
}

// Re-export individual tests
export { colorSeason };
