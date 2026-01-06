/**
 * Bun server API for running visual tests.
 * Keeps API keys server-side and handles VLM orchestration.
 */

import { AxAI } from "@ax-llm/ax";
import { runVisualTest } from "../src/core/orchestrator";
import { getTest, tests } from "../src/tests";
import type { AnalyzeRequest, AnalyzeResponse, VisualTest } from "../src/core/types";

// Initialize AI with OpenRouter
const ai = new AxAI({
  name: "openrouter",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  config: {
    model: "google/gemini-3-flash-preview",
    temperature: 0,
  },
});

const server = Bun.serve({
  port: 3001,
  
  async fetch(req: Request) {
    const url = new URL(req.url);
    
    // CORS headers for dev
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    
    // Handle preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Health check
    if (url.pathname === "/health") {
      return Response.json({ status: "ok" }, { headers: corsHeaders });
    }
    
    // Main analyze endpoint
    if (url.pathname === "/api/analyze" && req.method === "POST") {
      try {
        const body = await req.json() as AnalyzeRequest;
        const { testId, image } = body;
        
        if (!testId || !image) {
          const response: AnalyzeResponse = { success: false, error: "Missing testId or image" };
          return Response.json(response, { status: 400, headers: corsHeaders });
        }
        
        const test = getTest(testId);
        if (!test) {
          const response: AnalyzeResponse = { success: false, error: `Unknown test: ${testId}` };
          return Response.json(response, { status: 404, headers: corsHeaders });
        }
        
        console.log(`Running test "${test.name}" with ${test.dimensions.length} dimensions...`);
        
        const result = await runVisualTest(ai, test, image);
        
        console.log(`Test complete in ${result.meta.totalLatencyMs}ms -> ${result.category.name}`);
        
        const response: AnalyzeResponse = { success: true, result };
        return Response.json(response, { headers: corsHeaders });
        
      } catch (error) {
        console.error("Analyze error:", error);
        const response: AnalyzeResponse = { success: false, error: String(error) };
        return Response.json(response, { status: 500, headers: corsHeaders });
      }
    }
    
    // List available tests
    if (url.pathname === "/api/tests" && req.method === "GET") {
      const testList = Object.values(tests).map((t: VisualTest) => ({
        id: t.id,
        name: t.name,
        dimensionCount: t.dimensions.length,
        categoryCount: t.categories.length,
      }));
      return Response.json({ tests: testList }, { headers: corsHeaders });
    }
    
    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);
