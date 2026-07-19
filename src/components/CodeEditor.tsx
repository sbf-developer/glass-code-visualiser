import { useEffect, useMemo, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { EditorView, Decoration, type DecorationSet } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightLine?: number;
  readOnly?: boolean;
  isDark?: boolean;
}

const LIGHT = {
  bg: "#ffffff",
  fg: "#1a1a1a",
  gutter: "#6e6e6e",
  comment: "#57606a",
  keyword: "#cf222e",
  string: "#0a3069",
  number: "#0550ae",
  fn: "#6639ba",
  operator: "#1a1a1a",
  highlightBg: "rgba(154, 103, 0, 0.18)",
  highlightBorder: "#9a6700",
};

const DARK = {
  bg: "#0f0f0f",
  fg: "#f0f0f0",
  gutter: "#8b8b8b",
  comment: "#9aa0a6",
  keyword: "#ff7b72",
  string: "#a5d6ff",
  number: "#79c0ff",
  fn: "#d2a8ff",
  operator: "#e0e0e0",
  highlightBg: "rgba(227, 179, 65, 0.22)",
  highlightBorder: "#e3b341",
};

const setHighlightLine = StateEffect.define<number | undefined>();

const highlightLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setHighlightLine)) {
        const lineNum = effect.value;
        if (!lineNum || lineNum < 1) return Decoration.none;
        const line = tr.state.doc.line(Math.min(lineNum, tr.state.doc.lines));
        deco = Decoration.set([
          Decoration.line({ class: "cm-trace-highlight" }).range(line.from),
        ]);
      }
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

function createEditorTheme(colors: typeof LIGHT) {
  return EditorView.theme(
    {
      "&": { backgroundColor: colors.bg, color: colors.fg },
      ".cm-scroller": { backgroundColor: colors.bg },
      ".cm-content": { caretColor: colors.fg },
      ".cm-cursor, &.cm-focused .cm-cursor": { borderLeftColor: colors.fg },
      "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: `${colors.highlightBg} !important`,
      },
      ".cm-gutters": {
        backgroundColor: colors.bg,
        color: colors.gutter,
        border: "none",
      },
      ".cm-activeLineGutter": { backgroundColor: "transparent" },
      ".cm-lineNumbers .cm-gutterElement": { color: colors.gutter },
      ".cm-trace-highlight": {
        backgroundColor: `${colors.highlightBg} !important`,
        borderLeft: `2px solid ${colors.highlightBorder} !important`,
      },
    },
    { dark: colors === DARK }
  );
}

function createHighlightStyle(colors: typeof LIGHT) {
  return HighlightStyle.define([
    { tag: tags.comment, color: colors.comment },
    { tag: tags.keyword, color: colors.keyword, fontWeight: "600" },
    { tag: tags.string, color: colors.string },
    { tag: tags.number, color: colors.number },
    { tag: tags.function(tags.variableName), color: colors.fn },
    { tag: tags.definition(tags.variableName), color: colors.fg },
    { tag: tags.variableName, color: colors.fg },
    { tag: tags.operator, color: colors.operator },
    { tag: tags.punctuation, color: colors.operator },
    { tag: tags.bracket, color: colors.operator },
  ]);
}

export function CodeEditor({
  value,
  onChange,
  highlightLine,
  readOnly = false,
  isDark = true,
}: CodeEditorProps) {
  const viewRef = useRef<EditorView | null>(null);
  const colors = isDark ? DARK : LIGHT;

  const extensions = useMemo(
    () => [
      python(),
      createEditorTheme(colors),
      syntaxHighlighting(createHighlightStyle(colors)),
      highlightLineField,
      EditorView.lineWrapping,
      ...(readOnly ? [EditorView.editable.of(false)] : []),
    ],
    [readOnly, colors]
  );

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    if (highlightLine && highlightLine > 0) {
      view.dispatch({ effects: setHighlightLine.of(highlightLine) });
      const line = view.state.doc.line(
        Math.min(highlightLine, view.state.doc.lines)
      );
      view.dispatch({
        effects: EditorView.scrollIntoView(line.from, { y: "center" }),
      });
    } else {
      view.dispatch({ effects: setHighlightLine.of(undefined) });
    }
  }, [highlightLine, value]);

  return (
    <CodeMirror
      key={isDark ? "dark" : "light"}
      value={value}
      height="100%"
      theme="none"
      extensions={extensions}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: false,
        foldGutter: true,
        autocompletion: false,
      }}
      editable={!readOnly}
      className="code-editor h-full text-[13px] font-mono [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto [&_.cm-editor]:outline-none"
      onCreateEditor={(view) => {
        viewRef.current = view;
      }}
    />
  );
}
