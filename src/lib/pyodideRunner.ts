import { loadPyodide, type PyodideInterface } from "pyodide";
import { TRACER_SCRIPT } from "./tracer";
import type { TraceResult } from "../types";

const PYODIDE_INDEX_URL = `${import.meta.env.BASE_URL}pyodide/`;

let pyodidePromise: Promise<PyodideInterface> | null = null;

async function initPyodide(): Promise<PyodideInterface> {
  const pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });
  await pyodide.runPythonAsync(TRACER_SCRIPT);
  return pyodide;
}

export async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = initPyodide().catch((err) => {
      pyodidePromise = null;
      throw err;
    });
  }
  return pyodidePromise;
}

export function resetPyodide(): void {
  pyodidePromise = null;
}

export async function tracePythonCode(sourceCode: string): Promise<TraceResult> {
  const pyodide = await getPyodide();
  pyodide.globals.set("user_source_code", sourceCode);

  const jsonStr = await pyodide.runPythonAsync(
    "run_traced_code(user_source_code)"
  );

  return JSON.parse(jsonStr as string) as TraceResult;
}
