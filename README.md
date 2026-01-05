# UPS - Visual Judgment Framework

A configurable "visual personality test" framework. Upload a photo, VLM judges extract features, deterministic logic maps to a category, pre-written content displays instantly.

## Quick Start

```bash
# Install dependencies
bun install

# Start API server (requires OPENROUTER_API_KEY in .env)
bun run server

# Start frontend dev server (separate terminal)
bun run dev

# Open http://localhost:5173
```

## Architecture

```
              VLM ZONE                          CODE ZONE
         ┌────────────────┐              ┌─────────────────────┐
         │  Parallel VLM  ├─► {score}───►│  classify() pure fn  │──► category
         │    Judges      │              └──────────┬───────────┘
         └────────────────┘                         ▼
                                         ┌─────────────────────┐
                                         │  Pre-written content │
                                         │  (SSG pattern)       │
                                         └─────────────────────┘
```

**Key insight**: VLM does minimal work (feature extraction). Category selection is **deterministic code**. Content is **pre-written**.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite frontend dev server |
| `bun run server` | Start Bun API server |
| `bun run generate` | Precompute Barnum-style content |
| `bun test` | Run all tests |
| `bun run build` | Build for production |

## Project Structure

```
ups/
├── src/
│   ├── core/           # Framework (domain-agnostic)
│   │   ├── types.ts    # Core interfaces
│   │   ├── judge.ts    # Ax VLM signatures
│   │   ├── explainer.ts
│   │   └── orchestrator.ts
│   ├── tests/          # Test configurations
│   │   └── color-season.ts
│   ├── components/     # React UI
│   └── App.tsx
├── server/
│   └── api.ts          # Bun HTTP server
├── scripts/
│   └── generate-content.ts  # Content precomputation
└── tests/              # Unit & integration tests
```

## Creating New Tests

1. Create a file in `src/tests/`:

```typescript
export const myTest: VisualTest = {
  id: "my-test",
  name: "What _____ are you?",
  dimensions: [
    { id: "factor1", prompt: "Rate factor 1...", scale: [1, 10] },
  ],
  categories: [
    { 
      id: "result-a", 
      name: "Result A",
      description: "Short tagline",
      content: {
        emoji: "✨",
        headline: "You're Result A!",
        body: "Explanation...",
        traits: ["Trait 1", "Trait 2"],
        advice: "Optional tip",
      }
    },
  ],
  classify: (scores) => {
    // Deterministic logic
    return scores.factor1 > 5 ? "result-a" : "result-b";
  },
};
```

2. Export from `src/tests/index.ts`
3. Reference by `testId` in the API

## Environment Variables

```bash
OPENROUTER_API_KEY=your-key-here
```

## License

MIT
