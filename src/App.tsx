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
    <>
      {/* Title */}
      <header className="author">
        <h1>{colorSeason.name}</h1>
        <p>A Visual Classification System for Color Palette Analysis</p>
      </header>

      {/* Abstract - only show before upload */}
      {state.phase === "capture" && !imageBase64 && (
        <div className="abstract">
          <h2>Abstract</h2>
          <p>
            This system implements a three-phase visual classification pipeline:
            (1) parallel VLM-based dimensional feature extraction,
            (2) deterministic category mapping,
            (3) pre-computed result interpretation.
          </p>
        </div>
      )}

      {/* Input Section */}
      <section>
        <h2>1. Input</h2>

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
          <>
            <figure className="input-figure">
              <img src={state.imagePreview} alt="Input" />
              <figcaption>Input image under analysis</figcaption>
            </figure>
            <p className="text-center">
              <em>
                <Loader2 className="inline w-4 h-4 animate-spin" style={{ marginRight: "0.5rem" }} />
                Extracting {colorSeason.dimensions.length} dimensional features...
              </em>
            </p>
          </>
        )}

        {state.phase === "error" && (
          <>
            {state.imagePreview && (
              <figure className="input-figure">
                <img src={state.imagePreview} alt="Error" style={{ opacity: 0.5 }} />
              </figure>
            )}
            <p><strong>Error.</strong> {state.error}</p>
            <button className="reset-button-main" onClick={handleReset}>
              Try Again
            </button>
          </>
        )}

        {state.phase === "result" && (
          <figure className="input-figure">
            <img src={state.imagePreview} alt="Input" />
            <figcaption>Input image (n = 1)</figcaption>
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
          <p className="text-center" style={{ fontSize: "0.75rem", fontFamily: "monospace", marginTop: "2rem" }}>
            t<sub>total</sub> = {state.result.meta.totalLatencyMs}ms | model = {state.result.meta.model}
          </p>

          <button className="reset-button-main" onClick={handleReset}>
            New Analysis
          </button>
        </>
      )}
    </>
  );
}

export default App;
