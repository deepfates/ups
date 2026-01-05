/**
 * Content Generator — uses Ax to precompute Barnum-style statements.
 * 
 * Run at build time to generate structured content for all categories,
 * dimension combinations, and score buckets. Outputs to a JSON file
 * that can be imported at runtime (pure static, no VLM calls needed).
 * 
 * Usage: bun run scripts/generate-content.ts
 */

import { AxAI, ax, f } from "@ax-llm/ax";
import { colorSeason } from "../src/tests/color-season";
import type { VisualTest, Category, Dimension } from "../src/core/types";
import { writeFileSync } from "fs";

// Types for generated content
interface GeneratedInsight {
  dimensionId: string;
  bucket: "low" | "mid" | "high";
  statement: string;
}

interface GeneratedCategoryContent {
  categoryId: string;
  headlines: string[];      // Multiple variations
  bodies: string[];         // Multiple variations
  barnumStatements: string[]; // Generic-but-personal statements
}

interface GeneratedContent {
  testId: string;
  generatedAt: string;
  categories: GeneratedCategoryContent[];
  dimensionInsights: GeneratedInsight[];
}

// Ax signature for category content
const categoryContentGenerator = ax(`
  categoryName:string,
  categoryDescription:string,
  traits:string
  -> 
    headline:string "engaging result headline, 5-10 words",
    body:string "2-3 sentences explaining what this means for the person",
    barnum1:string "Barnum statement: feels personal but universally relatable, about self-perception",
    barnum2:string "Barnum statement: about hidden potential or desire",
    barnum3:string "Barnum statement: about relationships or social dynamics"
`);

// Ax signature for dimension insights
const dimensionInsightGenerator = ax(`
  dimensionName:string,
  bucket:string "low, mid, or high",
  testContext:string
  ->
    insight:string "Barnum-style observation about what this score reveals, 1 sentence"
`);

async function generateCategoryContent(
  ai: AxAI,
  category: Category
): Promise<GeneratedCategoryContent> {
  // Generate multiple variations
  const variations = await Promise.all([
    categoryContentGenerator.forward(ai, {
      categoryName: category.name,
      categoryDescription: category.description,
      traits: category.content.traits.join(", "),
    }),
    categoryContentGenerator.forward(ai, {
      categoryName: category.name,
      categoryDescription: category.description,
      traits: category.content.traits.join(", "),
    }),
  ]);
  
  return {
    categoryId: category.id,
    headlines: variations.map(v => v.headline),
    bodies: variations.map(v => v.body),
    barnumStatements: variations.flatMap(v => [v.barnum1, v.barnum2, v.barnum3]),
  };
}

async function generateDimensionInsights(
  ai: AxAI,
  dimension: Dimension,
  testName: string
): Promise<GeneratedInsight[]> {
  const buckets: Array<"low" | "mid" | "high"> = ["low", "mid", "high"];
  
  const insights = await Promise.all(
    buckets.map(async (bucket) => {
      const result = await dimensionInsightGenerator.forward(ai, {
        dimensionName: dimension.id,
        bucket,
        testContext: testName,
      });
      return {
        dimensionId: dimension.id,
        bucket,
        statement: result.insight,
      };
    })
  );
  
  return insights;
}

async function generateAllContent(
  ai: AxAI,
  test: VisualTest
): Promise<GeneratedContent> {
  console.log(`Generating content for test: ${test.name}`);
  
  // Generate category content in parallel
  console.log(`  Generating ${test.categories.length} category variations...`);
  const categories = await Promise.all(
    test.categories.map(cat => generateCategoryContent(ai, cat))
  );
  
  // Generate dimension insights in parallel
  console.log(`  Generating insights for ${test.dimensions.length} dimensions...`);
  const dimensionInsightsNested = await Promise.all(
    test.dimensions.map(dim => generateDimensionInsights(ai, dim, test.name))
  );
  const dimensionInsights = dimensionInsightsNested.flat();
  
  return {
    testId: test.id,
    generatedAt: new Date().toISOString(),
    categories,
    dimensionInsights,
  };
}

// Main execution
async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENROUTER_API_KEY");
    process.exit(1);
  }
  
  const ai = new AxAI({
    name: "openrouter",
    apiKey,
    config: { model: "google/gemini-2.0-flash-001" },
  });
  
  const content = await generateAllContent(ai, colorSeason);
  
  const outputPath = "./src/generated/content.json";
  writeFileSync(outputPath, JSON.stringify(content, null, 2));
  console.log(`✅ Generated content written to ${outputPath}`);
  
  // Summary
  console.log("\nSummary:");
  console.log(`  Categories: ${content.categories.length}`);
  console.log(`  Barnum statements: ${content.categories.reduce((a, c) => a + c.barnumStatements.length, 0)}`);
  console.log(`  Dimension insights: ${content.dimensionInsights.length}`);
}

main().catch(console.error);
