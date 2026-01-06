import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ImageCapture, InteractiveResult } from "./components";
import { getTest, getAllTests } from "./tests";
import type { VisualTest, TestResult, AnalyzeResponse } from "./core/types";
import "./App.css";

const API_BASE = "http://localhost:3001";

type AppState =
  | { phase: "capture" }
  | { phase: "loading"; imagePreview: string }
  | { phase: "result"; result: TestResult; imagePreview: string }
  | { phase: "error"; error: string; imagePreview?: string };

/**
 * Parse test ID from URL hash (e.g., #/color-season -> "color-season")
 */
function getTestIdFromHash(): string | null {
  const hash = window.location.hash;
  if (hash.startsWith("#/")) {
    return hash.slice(2);
  }
  return null;
}

/**
 * Test Index Page — shown when no test is selected
 */
function TestIndex({ tests }: { tests: VisualTest[] }) {
  return (
    <>
      <header className="author">
        <h1>Universal Persona System</h1>
        <p>Visual classification tests powered by VLM judges</p>
      </header>

      <section>
        <h2>Available Tests</h2>
        <p>Select a test to begin:</p>
        
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {tests.map((test) => (
            <li key={test.id} style={{ marginBottom: "0.75rem" }}>
              <a 
                href={`#/${test.id}`}
                style={{ 
                  display: "block",
                  padding: "0.75rem 1rem",
                  border: "1px solid var(--body-color, #000)",
                  textDecoration: "none",
                  color: "inherit"
                }}
              >
                <strong>{test.name}</strong>
                <br />
                <small>{test.dimensions.length} dimensions → {test.categories.length} categories</small>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/**
 * Test Page — runs a specific test
 */
function TestPage({ test }: { test: VisualTest }) {
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
          testId: test.id,
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
        <h1>{test.name}</h1>
        <p>
          <a href="#/" style={{ fontSize: "0.9rem" }}>← All Tests</a>
        </p>
      </header>

      {/* Abstract - only show before upload */}
      {state.phase === "capture" && !imageBase64 && (
        <div className="abstract">
          <h2>Abstract</h2>
          <p>
            This test extracts {test.dimensions.length} dimensional features from your image
            and classifies into one of {test.categories.length} categories using deterministic logic.
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
                Extracting {test.dimensions.length} dimensional features...
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
            test={test}
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

/**
 * Main App — routes to test index or specific test based on URL hash
 */
function App() {
  const [testId, setTestId] = useState<string | null>(getTestIdFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setTestId(getTestIdFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const allTests = getAllTests();
  const currentTest = testId ? getTest(testId) : null;

  // If test ID is provided but not found, redirect to index
  if (testId && !currentTest) {
    window.location.hash = "/";
    return null;
  }

  // Show test page or index
  if (currentTest) {
    return <TestPage test={currentTest} key={testId} />;
  }
  
  return <TestIndex tests={allTests} />;
}

export default App;
