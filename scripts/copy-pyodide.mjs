import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pyodide");
const dest = join(root, "public", "pyodide");

const files = [
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];

if (!existsSync(src)) {
  console.warn("[copy-pyodide] pyodide not installed yet — run npm install first");
  process.exit(0);
}

mkdirSync(dest, { recursive: true });

for (const file of files) {
  cpSync(join(src, file), join(dest, file));
}

console.log(`[copy-pyodide] Copied ${files.length} files to public/pyodide/`);
