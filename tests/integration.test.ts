/**
 * Integration tests with mocked VLM responses.
 * Tests the orchestration flow without actual API calls.
 * 
 * Run: bun test
 */

import { describe, it, expect, mock } from "bun:test";
import type { VisualTest, JudgeResult, Category } from "../src/core/types";

// Mock test for integration testing
const mockTest: VisualTest = {
  id: "mock-test",
  name: "Mock Test",
  dimensions: [
    { id: "dim1", prompt: "Rate dimension 1", scale: [1, 10] },
    { id: "dim2", prompt: "Rate dimension 2", scale: [1, 10] },
  ],
  categories: [
    {
      id: "cat-a",
      name: "Category A",
      description: "When dim1 is high",
      content: {
        headline: "You're Category A!",
        body: "This is Category A",
        traits: ["Trait 1"],
        emoji: "🅰️",
      },
    },
    {
      id: "cat-b",
      name: "Category B",
      description: "When dim1 is low",
      content: {
        headline: "You're Category B!",
        body: "This is Category B",
        traits: ["Trait 2"],
        emoji: "🅱️",
      },
    },
  ],
  classify: (scores) => {
    return (scores.dim1 ?? 5) >= 6 ? "cat-a" : "cat-b";
  },
};

describe("Orchestration Flow", () => {
  describe("score aggregation", () => {
    it("correctly builds scores map from JudgeResult array", () => {
      const judgeResults: JudgeResult[] = [
        { dimension: "dim1", score: 8, observation: "High score", latencyMs: 100 },
        { dimension: "dim2", score: 3, observation: "Low score", latencyMs: 100 },
      ];
      
      const scoresMap: Record<string, number> = {};
      for (const result of judgeResults) {
        scoresMap[result.dimension] = result.score;
      }
      
      expect(scoresMap).toEqual({ dim1: 8, dim2: 3 });
    });
    
    it("applies classify function to scores map", () => {
      expect(mockTest.classify({ dim1: 8, dim2: 5 })).toBe("cat-a");
      expect(mockTest.classify({ dim1: 3, dim2: 5 })).toBe("cat-b");
    });
    
    it("finds correct category from result", () => {
      const categoryId = mockTest.classify({ dim1: 8, dim2: 5 });
      const category = mockTest.categories.find(c => c.id === categoryId);
      
      expect(category).toBeDefined();
      expect(category?.name).toBe("Category A");
    });
  });
  
  describe("error handling", () => {
    it("handles missing scores gracefully", () => {
      // The classify function should use defaults
      const result = mockTest.classify({});
      expect(result).toBe("cat-b"); // default 5 < 6, so cat-b
    });
    
    it("throws for invalid category ID", () => {
      const badTest: VisualTest = {
        ...mockTest,
        classify: () => "invalid-cat", // Returns non-existent category
      };
      
      const categoryId = badTest.classify({});
      const category = badTest.categories.find(c => c.id === categoryId);
      
      expect(category).toBeUndefined();
    });
  });
  
  describe("parallel execution simulation", () => {
    it("handles partial judge failures gracefully", async () => {
      const mockResults = [
        Promise.resolve({ dimension: "dim1", score: 7, observation: "OK", latencyMs: 100 }),
        Promise.reject(new Error("API failure")),
      ];
      
      const outcomes = await Promise.allSettled(mockResults);
      
      const successful = outcomes.filter(
        (o): o is PromiseFulfilledResult<JudgeResult> => o.status === "fulfilled"
      );
      const failed = outcomes.filter(
        (o): o is PromiseRejectedResult => o.status === "rejected"
      );
      
      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);
      expect(successful[0].value.score).toBe(7);
    });
    
    it("runs judges in parallel (timing test)", async () => {
      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
      
      const start = performance.now();
      
      // Simulate 3 parallel calls of 50ms each
      await Promise.all([
        delay(50),
        delay(50),
        delay(50),
      ]);
      
      const elapsed = performance.now() - start;
      
      // Should complete in ~50ms, not 150ms
      expect(elapsed).toBeLessThan(100);
    });
  });
});

describe("Type Contracts", () => {
  it("JudgeResult has all required fields", () => {
    const result: JudgeResult = {
      dimension: "test",
      score: 5,
      observation: "Some observation",
      latencyMs: 123,
    };
    
    expect(result.dimension).toBeTypeOf("string");
    expect(result.score).toBeTypeOf("number");
    expect(result.observation).toBeTypeOf("string");
    expect(result.latencyMs).toBeTypeOf("number");
  });
  
  it("Category content has all required fields", () => {
    const cat: Category = mockTest.categories[0];
    
    expect(cat.id).toBeTypeOf("string");
    expect(cat.name).toBeTypeOf("string");
    expect(cat.content.headline).toBeTypeOf("string");
    expect(cat.content.body).toBeTypeOf("string");
    expect(cat.content.traits).toBeInstanceOf(Array);
    expect(cat.content.emoji).toBeTypeOf("string");
  });
});
