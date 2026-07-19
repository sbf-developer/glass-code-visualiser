import type { SerializedValue } from "../types";

function typeClass(type: string): string {
  if (type === "int" || type === "float") return "var-type--int";
  if (type === "str") return "var-type--str";
  if (type === "bool") return "var-type--bool";
  if (type === "list" || type === "tuple") return "var-type--list";
  if (type === "dict" || type === "set") return "var-type--dict";
  return "var-type--none";
}

const TYPE_COLOR: Record<string, string> = {
  int: "var(--type-int)",
  float: "var(--type-int)",
  str: "var(--type-str)",
  bool: "var(--type-bool)",
  none: "var(--subtle)",
  list: "var(--type-list)",
  tuple: "var(--type-list)",
  dict: "var(--type-dict)",
  set: "var(--type-dict)",
};

function ValueInline({ value }: { value: SerializedValue }) {
  return (
    <span
      className="font-mono"
      style={{ color: TYPE_COLOR[value.type] ?? "var(--fg)" }}
    >
      {value.repr}
    </span>
  );
}

function BarChart({ items }: { items: SerializedValue[] }) {
  const numericItems = items.filter(
    (item) => item.type === "int" || item.type === "float"
  );
  if (numericItems.length === 0) return null;

  const values = numericItems.map((item) => Number(item.value));
  const max = Math.max(...values, 1);

  return (
    <div className="mt-3 flex h-14 items-end gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="var-bar w-full transition-all duration-300"
            style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
          />
          <span className="font-mono text-[10px] text-subtle">{v}</span>
        </div>
      ))}
    </div>
  );
}

function ListViz({ value }: { value: SerializedValue }) {
  const items = value.items ?? [];
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={`var-cell ${value.changed ? "var-cell--changed" : ""}`}
          >
            <span className="var-cell-index">{i}</span>
            <ValueInline value={item} />
          </div>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-subtle">empty</span>
        )}
      </div>
      <BarChart items={items} />
    </div>
  );
}

function DictViz({ value }: { value: SerializedValue }) {
  const keys = value.keys ?? [];
  const vals = value.values ?? [];
  return (
    <div className="space-y-1.5">
      {keys.map((k, i) => (
        <div
          key={i}
          className={`var-cell flex items-center gap-2 ${value.changed ? "var-cell--changed" : ""}`}
        >
          <span style={{ color: "var(--type-dict)" }} className="font-mono">
            {k.repr}
          </span>
          <span className="text-subtle">:</span>
          <ValueInline value={vals[i]} />
        </div>
      ))}
      {keys.length === 0 && (
        <span className="text-xs text-subtle">empty</span>
      )}
    </div>
  );
}

function VariableCard({
  name,
  value,
}: {
  name: string;
  value: SerializedValue;
}) {
  const isComplex = ["list", "tuple", "dict", "set"].includes(value.type);

  return (
    <div className={`var-card ${value.changed ? "var-card--changed" : ""}`}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="var-name">{name}</span>
        <span className={`var-type ${typeClass(value.type)}`}>{value.type}</span>
      </div>

      {!isComplex && <ValueInline value={value} />}
      {(value.type === "list" || value.type === "tuple") && (
        <ListViz value={value} />
      )}
      {value.type === "dict" && <DictViz value={value} />}
      {value.type === "set" && value.items && (
        <div className="flex flex-wrap gap-1.5">
          {value.items.map((item, i) => (
            <span key={i} className="var-cell">
              <ValueInline value={item} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface VariablePanelProps {
  locals: Record<string, SerializedValue>;
  funcName: string;
}

export function VariablePanel({ locals, funcName }: VariablePanelProps) {
  const entries = Object.entries(locals);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-3">
        <p className="label">Variables</p>
        <p className="mt-0.5 font-mono text-xs text-muted">{funcName}()</p>
      </div>

      <div className="flex-1 space-y-2.5 overflow-auto px-5 pb-5">
        {entries.length === 0 ? (
          <p className="text-sm text-subtle">No variables yet</p>
        ) : (
          entries.map(([name, value]) => (
            <VariableCard key={name} name={name} value={value} />
          ))
        )}
      </div>
    </div>
  );
}
