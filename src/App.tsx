import { useCallback, useEffect, useRef, useState } from "react";
import { CodeEditor } from "./components/CodeEditor";
import { ThemeToggle } from "./components/ThemeToggle";
import { VisualizationPanel } from "./components/VisualizationPanel";
import { EXAMPLES } from "./examples";
import { useTheme } from "./hooks/useTheme";
import { tracePythonCode, resetPyodide } from "./lib/pyodideRunner";
import type { TraceResult, TraceStep } from "./types";

const DEFAULT_CODE = EXAMPLES[0].code;

export default function App() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [activeExample, setActiveExample] = useState(EXAMPLES[0].id);
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playIntervalRef = useRef<number | null>(null);

  const steps: TraceStep[] = traceResult?.steps ?? [];
  const currentStep = steps[currentStepIndex] ?? null;

  const initPython = useCallback(async () => {
    setLoadStatus("loading");
    setLoadError(null);
    try {
      await tracePythonCode("x = 1");
      setLoadStatus("ready");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setLoadStatus("error");
      setLoadError(msg);
    }
  }, []);

  useEffect(() => {
    initPython();
  }, [initPython]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  const handleRun = useCallback(async () => {
    stopPlayback();
    setIsLoading(true);
    setError(null);
    setTraceResult(null);
    setCurrentStepIndex(0);

    try {
      const result = await tracePythonCode(code);
      setTraceResult(result);
      if (result.error) setError(result.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run code");
    } finally {
      setIsLoading(false);
    }
  }, [code, stopPlayback]);

  const handlePlayPause = useCallback(() => {
    if (steps.length === 0) return;
    if (isPlaying) {
      stopPlayback();
      return;
    }
    setIsPlaying(true);
    playIntervalRef.current = window.setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          stopPlayback();
          return prev;
        }
        return prev + 1;
      });
    }, 600);
  }, [isPlaying, steps.length, stopPlayback]);

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, []);

  const loadExample = (exampleId: string) => {
    const example = EXAMPLES.find((e) => e.id === exampleId);
    if (!example) return;
    stopPlayback();
    setActiveExample(exampleId);
    setCode(example.code);
    setTraceResult(null);
    setCurrentStepIndex(0);
    setError(null);
  };

  return (
    <div className="app-shell flex h-screen flex-col">
      <header className="app-header">
        <h1 className="brand-title">Glass</h1>

        <div className="flex shrink-0 items-center gap-1">
          {loadStatus === "loading" && (
            <span className="hidden px-2 text-xs text-subtle sm:inline">…</span>
          )}
          {loadStatus === "ready" && (
            <span
              className="hidden h-1.5 w-1.5 rounded-full sm:inline-block"
              style={{ backgroundColor: "var(--success)" }}
              title="Ready"
            />
          )}
          {loadStatus === "error" && (
            <button
              type="button"
              onClick={() => {
                resetPyodide();
                initPython();
              }}
              className="btn-ghost text-xs text-danger"
            >
              Retry
            </button>
          )}

          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
      </header>

      <nav className="example-nav">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => loadExample(ex.id)}
            title={ex.description}
            className={`chip ${activeExample === ex.id ? "chip-active" : ""}`}
          >
            {ex.title}
          </button>
        ))}
      </nav>

      {error && (
        <div className="alert-error mx-6 mb-3 shrink-0 rounded-md px-3 py-2 font-mono text-xs">
          {error}
        </div>
      )}

      {loadError && loadStatus === "error" && (
        <div className="alert-error mx-6 mb-3 shrink-0 rounded-md px-3 py-2 font-mono text-xs">
          {loadError}
        </div>
      )}

      <main className="app-main">
        <section className="panel panel--code">
          <div className="panel-header">
            <span className="label">Code</span>
            <span
              className={`panel-header-meta ${currentStep ? "" : "panel-header-meta--idle"}`}
            >
              {currentStep ? `L${currentStep.line}` : "—"}
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor
              value={code}
              onChange={setCode}
              highlightLine={currentStep?.line}
              isDark={isDark}
            />
          </div>
        </section>

        <section className="panel panel--viz">
          <VisualizationPanel
            step={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
            isPlaying={isPlaying}
            isRunning={isLoading}
            canRun={loadStatus === "ready"}
            stdout={traceResult?.stdout ?? ""}
            onRun={handleRun}
            onStepChange={(i) => {
              stopPlayback();
              setCurrentStepIndex(i);
            }}
            onPlayPause={handlePlayPause}
            onFirst={() => {
              stopPlayback();
              setCurrentStepIndex(0);
            }}
            onLast={() => {
              stopPlayback();
              setCurrentStepIndex(Math.max(0, steps.length - 1));
            }}
          />
        </section>
      </main>
    </div>
  );
}
