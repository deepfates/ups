/**
 * Unit tests for the Color Season classification logic.
 * These test the DETERMINISTIC parts — no VLM needed.
 * 
 * Run: bun test
 */

import { describe, it, expect } from "bun:test";
import { colorSeason } from "../src/tests/color-season";

describe("Color Season Classification", () => {
  describe("classify function", () => {
    it("returns spring for warm + bright", () => {
      expect(colorSeason.classify({ warmth: 8, saturation: 8, value: 5 })).toBe("spring");
      expect(colorSeason.classify({ warmth: 6, saturation: 6, value: 3 })).toBe("spring");
      expect(colorSeason.classify({ warmth: 10, saturation: 10, value: 10 })).toBe("spring");
    });
    
    it("returns summer for cool + muted", () => {
      expect(colorSeason.classify({ warmth: 3, saturation: 3, value: 3 })).toBe("summer");
      expect(colorSeason.classify({ warmth: 5, saturation: 5, value: 5 })).toBe("summer");
      expect(colorSeason.classify({ warmth: 1, saturation: 1, value: 1 })).toBe("summer");
    });
    
    it("returns autumn for warm + muted", () => {
      expect(colorSeason.classify({ warmth: 8, saturation: 4, value: 7 })).toBe("autumn");
      expect(colorSeason.classify({ warmth: 7, saturation: 3, value: 5 })).toBe("autumn");
      expect(colorSeason.classify({ warmth: 6, saturation: 5, value: 8 })).toBe("autumn");
    });
    
    it("returns winter for cool + bright", () => {
      expect(colorSeason.classify({ warmth: 3, saturation: 8, value: 8 })).toBe("winter");
      expect(colorSeason.classify({ warmth: 5, saturation: 7, value: 5 })).toBe("winter");
      expect(colorSeason.classify({ warmth: 1, saturation: 10, value: 10 })).toBe("winter");
    });
    
    it("handles missing values with defaults", () => {
      // Should default to 5, which is cool + muted = summer
      expect(colorSeason.classify({})).toBe("summer");
      expect(colorSeason.classify({ warmth: 8 })).toBe("autumn"); // warm + default muted
      expect(colorSeason.classify({ saturation: 8 })).toBe("winter"); // default cool + bright
    });
    
    it("handles boundary values correctly", () => {
      // At exactly 6 = warm/bright threshold
      expect(colorSeason.classify({ warmth: 6, saturation: 6, value: 5 })).toBe("spring");
      expect(colorSeason.classify({ warmth: 5, saturation: 5, value: 5 })).toBe("summer");
      expect(colorSeason.classify({ warmth: 6, saturation: 5, value: 5 })).toBe("autumn");
      expect(colorSeason.classify({ warmth: 5, saturation: 6, value: 5 })).toBe("winter");
    });
  });
  
  describe("test configuration", () => {
    it("has correct structure", () => {
      expect(colorSeason.id).toBe("color-season");
      expect(colorSeason.name).toBe("What Color Season Are You?");
      expect(colorSeason.dimensions).toHaveLength(3);
      expect(colorSeason.categories).toHaveLength(4);
    });
    
    it("has all required dimension fields", () => {
      for (const dim of colorSeason.dimensions) {
        expect(dim.id).toBeDefined();
        expect(dim.prompt).toBeDefined();
        expect(dim.scale).toHaveLength(2);
        expect(dim.scale[0]).toBeLessThan(dim.scale[1]);
      }
    });
    
    it("has all required category fields", () => {
      for (const cat of colorSeason.categories) {
        expect(cat.id).toBeDefined();
        expect(cat.name).toBeDefined();
        expect(cat.description).toBeDefined();
        expect(cat.content).toBeDefined();
        expect(cat.content.headline).toBeDefined();
        expect(cat.content.body).toBeDefined();
        expect(cat.content.traits).toBeInstanceOf(Array);
        expect(cat.content.emoji).toBeDefined();
      }
    });
    
    it("classify returns only valid category IDs", () => {
      const validIds = colorSeason.categories.map(c => c.id);
      
      // Test many random combinations
      for (let w = 1; w <= 10; w += 3) {
        for (let s = 1; s <= 10; s += 3) {
          for (let v = 1; v <= 10; v += 3) {
            const result = colorSeason.classify({ warmth: w, saturation: s, value: v });
            expect(validIds).toContain(result);
          }
        }
      }
    });
  });
});

describe("Category Content", () => {
  it("each category has unique content", () => {
    const headlines = colorSeason.categories.map(c => c.content.headline);
    const uniqueHeadlines = new Set(headlines);
    expect(uniqueHeadlines.size).toBe(headlines.length);
  });
  
  it("traits are non-empty for all categories", () => {
    for (const cat of colorSeason.categories) {
      expect(cat.content.traits.length).toBeGreaterThan(0);
    }
  });
});
