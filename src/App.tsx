import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ImageCapture, InteractiveResult } from "./components";
import { colorSeason } from "./tests";
import type { TestResult, AnalyzeResponse } from "./core/types";
import "./App.css";

const API_BASE = "http://localhost:3001";

type AppState =
  | { phase: "capture" }
  | { phase: "loading"; imagePreview: string }
  | { phase: "result"; result: TestResult; imagePreview: string }
  | { phase: "error"; error: string; imagePreview?: string };

function App() {
  const [state, setState] = useState<AppState>({ phase: "capture" });
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleImageCapture = (base64: string) => {
    setImageBase64(base64);
    setState({ phase: "capture" });
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;

    const imagePreview = `data:image/jpeg;base64,${imageBase64}`;
    setState({ phase: "loading", imagePreview });

    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: colorSeason.id,
          image: imageBase64,
        }),
      });

      const data: AnalyzeResponse = await response.json();

      if (data.success) {
        setState({ phase: "result", result: data.result, imagePreview });
      } else {
        setState({ phase: "error", error: data.error, imagePreview });
      }
    } catch (err) {
      setState({
        phase: "error",
        error: `Network error: ${String(err)}`,
        imagePreview,
      });
    }
  };

  const handleReset = () => {
    setImageBase64(null);
    setState({ phase: "capture" });
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Title Block */}
      <header className="text-center pb-4 border-b-2 border-[var(--color-ink)]">
        <h1 className="text-xl font-semibold tracking-tight mb-1">
          {colorSeason.name}
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)] italic">
          A Visual Classification System for Color Palette Analysis
        </p>
      </header>

      <main className="flex flex-col gap-8">
        {/* Abstract - only show before upload */}
        {state.phase === "capture" && !imageBase64 && (
          <section>
            <h2 className="section-heading">Abstract</h2>
            <p className="text-justify hyphens-auto leading-relaxed text-[0.9rem]">
              This system implements a three-phase visual classification pipeline:
              (1) parallel VLM-based dimensional feature extraction,
              (2) deterministic category mapping,
              (3) pre-computed result interpretation.
            </p>
          </section>
        )}

        {/* Input Section */}
        <section>
          <h2 className="section-heading">1. Input</h2>

          {state.phase === "capture" && (
            <>
              <ImageCapture onImageCapture={handleImageCapture} disabled={false} />
              {imageBase64 && (
                <button className="analyze-button" onClick={handleAnalyze}>
                  Run Classification →
                </button>
              )}
            </>
          )}

          {state.phase === "loading" && (
            <div className="space-y-3">
              {/* Small figure for loading */}
              <figure className="input-figure">
                <img src={state.imagePreview} alt="Input" />
                <figcaption>
                  <strong>Fig. 1:</strong> Input image under analysis
                </figcaption>
              </figure>
              <div className="flex items-center justify-center gap-2 py-3 text-[var(--color-ink-muted)] italic text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting {colorSeason.dimensions.length} dimensional features...
              </div>
            </div>
          )}

          {state.phase === "error" && (
            <div className="space-y-3">
              {state.imagePreview && (
                <figure className="input-figure">
                  <img src={state.imagePreview} alt="Error" className="opacity-50" />
                </figure>
              )}
              <div className="bg-red-50 border border-red-200 p-3 text-red-800 text-sm">
                <strong>Error.</strong> {state.error}
              </div>
              <button className="reset-button-main" onClick={handleReset}>
                Try Again
              </button>
            </div>
          )}

          {state.phase === "result" && (
            <figure className="input-figure">
              <img src={state.imagePreview} alt="Input" />
              <figcaption>
                <strong>Fig. 1:</strong> Input image (n = 1)
              </figcaption>
            </figure>
          )}
        </section>

        {/* Results */}
        {state.phase === "result" && (
          <>
            <InteractiveResult
              test={colorSeason}
              initialScores={state.result.scores}
            />

            {/* Metadata */}
            <div className="text-center text-xs font-mono text-[var(--color-ink-muted)] pt-3 border-t border-[var(--color-border)]">
              t<sub>total</sub> = {state.result.meta.totalLatencyMs}ms | model = {state.result.meta.model}
            </div>

            <button className="reset-button-main" onClick={handleReset}>
              New Analysis
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
