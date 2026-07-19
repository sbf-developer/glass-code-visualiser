export type TraceEvent = "line" | "call" | "return" | "exception";

export interface SerializedValue {
  type: string;
  repr: string;
  value?: unknown;
  items?: SerializedValue[];
  keys?: SerializedValue[];
  values?: SerializedValue[];
  length?: number;
  changed?: boolean;
}

export interface TraceStep {
  step: number;
  line: number;
  event: TraceEvent;
  func: string;
  locals: Record<string, SerializedValue>;
  stdout: string;
  error?: string;
}

export interface TraceResult {
  steps: TraceStep[];
  sourceLines: string[];
  error?: string;
  stdout: string;
}

export interface Example {
  id: string;
  title: string;
  description: string;
  code: string;
}
