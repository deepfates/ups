# Universal Persona System (UPS)

A visual personality test framework. Upload a photo, VLM judges extract features, deterministic logic maps to a category, pre-written content displays instantly.

**Demo**: Color Season Analysis — determines your seasonal color palette from a selfie.

## Quick Start

```bash
# Install
bun install

# Set your API key
cp .env.example .env
# Edit .env with your OPENROUTER_API_KEY

# Start server + frontend
bun run server    # Terminal 1
bun run dev       # Terminal 2

# Open http://localhost:5173
```

## How It Works

```
Image → [VLM Judges] → scores → [classify()] → category → [pre-written content]
         (parallel)      ↓         (pure fn)       ↓           (instant)
                      warmth: 7                 "Winter"     "Your palette is
                      saturation: 8                           bold and striking..."
                      value: 6
```

**Key design**: VLMs do minimal work (extract numeric scores). Classification is **deterministic code**. Content is **pre-written** — no generation latency.

## Features

- 📊 **Radar chart** visualization of dimensional scores
- 🎛️ **Interactive sliders** to explore alternative classifications  
- 📄 **LaTeX-style** typography (via latex.css)
- ⚡ **Fast** — parallel VLM calls, ~1-2s total latency
- 🎯 **Deterministic** — temperature 0, reproducible results

## Tech Stack

| Layer | Tech |
|-------|------|
| VLM | Gemini 3 Flash via OpenRouter |
| Framework | [Ax](https://github.com/ax-llm/ax) (DSPy-like signatures) |
| Frontend | React + Vite + Tailwind v4 |
| Server | Bun |
| Typography | [latex.css](https://latex.now.sh) |
| Charts | Recharts |

## Creating New Tests

```typescript
// src/tests/my-test.ts
export const myTest: VisualTest = {
  id: "my-test",
  name: "What _____ are you?",
  
  dimensions: [
    { id: "factor1", prompt: "Rate factor 1...", scale: [1, 10] },
    { id: "factor2", prompt: "Rate factor 2...", scale: [1, 10] },
  ],
  
  categories: [
    { 
      id: "result-a", 
      name: "Result A",
      description: "Short tagline",
      content: {
        emoji: "✨",
        headline: "You're Result A!",
        body: "Pre-written explanation...",
        traits: ["Trait 1", "Trait 2"],
        advice: "Optional tip",
      }
    },
  ],
  
  classify: (scores) => {
    // Pure function — deterministic logic
    return scores.factor1 > 5 ? "result-a" : "result-b";
  },
};
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Frontend dev server |
| `bun run server` | API server |
| `bun test` | Run tests |
| `bun run build` | Production build |

## License

MIT
