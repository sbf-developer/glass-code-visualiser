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

const editorChrome = EditorView.theme({
  "&": {
    backgroundColor: "var(--editor-bg)",
    color: "var(--editor-fg)",
  },
  ".cm-content": { caretColor: "var(--editor-fg)" },
  ".cm-cursor, &.cm-focused .cm-cursor": {
    borderLeftColor: "var(--editor-fg)",
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "var(--highlight-bg) !important",
  },
  ".cm-gutters": {
    backgroundColor: "var(--editor-bg)",
    color: "var(--editor-gutter)",
    border: "none",
  },
  ".cm-activeLineGutter": { backgroundColor: "transparent" },
  ".cm-trace-highlight": {
    backgroundColor: "var(--highlight-bg) !important",
    borderLeft: "2px solid var(--highlight) !important",
  },
});

function buildHighlightStyle(isDark: boolean) {
  return HighlightStyle.define([
    { tag: tags.comment, color: "var(--editor-comment)" },
    { tag: tags.keyword, color: "var(--editor-keyword)" },
    { tag: tags.string, color: "var(--editor-string)" },
    { tag: tags.number, color: "var(--editor-number)" },
    { tag: tags.function(tags.variableName), color: "var(--editor-fn)" },
    { tag: tags.definition(tags.variableName), color: "var(--editor-fg)" },
    { tag: tags.variableName, color: "var(--editor-fg)" },
    { tag: tags.operator, color: isDark ? "#c8c8c8" : "#3d3d3d" },
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

  const extensions = useMemo(
    () => [
      python(),
      editorChrome,
      syntaxHighlighting(buildHighlightStyle(isDark)),
      highlightLineField,
      EditorView.lineWrapping,
      ...(readOnly ? [EditorView.editable.of(false)] : []),
    ],
    [readOnly, isDark]
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
      value={value}
      height="100%"
      extensions={extensions}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: false,
        foldGutter: true,
        autocompletion: false,
      }}
      editable={!readOnly}
      className="h-full text-[13px] font-mono [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto [&_.cm-editor]:outline-none"
      onCreateEditor={(view) => {
        viewRef.current = view;
      }}
    />
  );
}
