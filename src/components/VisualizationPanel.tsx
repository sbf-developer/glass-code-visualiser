import type { ReactNode } from "react";
import type { TraceStep } from "../types";
import { VariablePanel } from "./VariablePanel";

function IconButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-icon"
      title={title}
    >
      {children}
    </button>
  );
}

interface PlaybackControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  isRunning: boolean;
  canRun: boolean;
  onRun: () => void;
  onStepChange: (step: number) => void;
  onPlayPause: () => void;
  onFirst: () => void;
  onLast: () => void;
}

function PlaybackControls({
  currentStep,
  totalSteps,
  isPlaying,
  isRunning,
  canRun,
  onRun,
  onStepChange,
  onPlayPause,
  onFirst,
  onLast,
}: PlaybackControlsProps) {
  const disabled = totalSteps === 0;

  return (
    <div className="control-bar">
      <div className="control-actions">
        <div className="btn-group">
          <button
            type="button"
            onClick={onRun}
            disabled={!canRun || isRunning}
            className="btn-seg btn-seg--primary"
          >
            {isRunning ? "Running" : "Run"}
          </button>
          <button
            type="button"
            onClick={onPlayPause}
            disabled={disabled}
            className={`btn-seg ${isPlaying ? "btn-seg--active" : ""}`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        <div className="control-divider" aria-hidden />

        <div className="transport-group">
          <IconButton onClick={onFirst} disabled={disabled || currentStep <= 0} title="First">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 3h1.5v10H3V3zm2.5 5 6.5 4V4l-6.5 4z" />
            </svg>
          </IconButton>
          <IconButton
            onClick={() => onStepChange(currentStep - 1)}
            disabled={disabled || currentStep <= 0}
            title="Previous"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M10 12 5 8l5-4v8z" />
            </svg>
          </IconButton>
          <IconButton
            onClick={() => onStepChange(currentStep + 1)}
            disabled={disabled || currentStep >= totalSteps - 1}
            title="Next"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 12V4l5 4-5 4z" />
            </svg>
          </IconButton>
          <IconButton
            onClick={onLast}
            disabled={disabled || currentStep >= totalSteps - 1}
            title="Last"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.5 3H13v10h-1.5V3zM3 12l6.5-4L3 4v8z" />
            </svg>
          </IconButton>
        </div>
      </div>

      <div className="control-scrubber">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onStepChange(Number(e.target.value))}
          disabled={disabled}
        />
        <span className="control-count">
          {disabled ? "—" : `${currentStep + 1} / ${totalSteps}`}
        </span>
      </div>
    </div>
  );
}

function StepInfo({
  step,
  hasTrace,
}: {
  step: TraceStep | null;
  hasTrace: boolean;
}) {
  if (!step) {
    return (
      <div className="step-meta step-meta--empty">
        {hasTrace ? "No steps recorded" : "Run to trace execution, then Play to step through"}
      </div>
    );
  }

  return (
    <div className="step-meta">
      <span className="step-line">L{step.line}</span>
      <span className="step-event">{step.event}</span>
      {step.event === "return" && "returnValue" in step && (
        <span className="step-return font-mono">
          {(step as TraceStep & { returnValue?: string }).returnValue}
        </span>
      )}
    </div>
  );
}

interface VisualizationPanelProps {
  step: TraceStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  isRunning: boolean;
  canRun: boolean;
  hasTrace: boolean;
  stdout: string;
  onRun: () => void;
  onStepChange: (step: number) => void;
  onPlayPause: () => void;
  onFirst: () => void;
  onLast: () => void;
}

export function VisualizationPanel({
  step,
  currentStepIndex,
  totalSteps,
  isPlaying,
  isRunning,
  canRun,
  hasTrace,
  stdout,
  onRun,
  onStepChange,
  onPlayPause,
  onFirst,
  onLast,
}: VisualizationPanelProps) {
  const visibleStdout = step
    ? stdout.slice(0, step.stdout.length || stdout.length)
    : stdout;

  return (
    <div className="viz-shell flex h-full flex-col">
      <PlaybackControls
        currentStep={currentStepIndex}
        totalSteps={totalSteps}
        isPlaying={isPlaying}
        isRunning={isRunning}
        canRun={canRun}
        onRun={onRun}
        onStepChange={onStepChange}
        onPlayPause={onPlayPause}
        onFirst={onFirst}
        onLast={onLast}
      />

      <StepInfo step={step} hasTrace={hasTrace} />

      <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto]">
        <VariablePanel
          locals={step?.locals ?? {}}
          funcName={step?.func ?? "module"}
        />

        {stdout && (
          <div className="output-panel px-5 py-3">
            <p className="label mb-1.5">Output</p>
            <pre className="max-h-20 overflow-auto font-mono text-xs leading-relaxed text-success whitespace-pre-wrap">
              {visibleStdout}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
