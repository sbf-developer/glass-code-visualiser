// Python tracer injected into Pyodide — captures execution steps as JSON
export const TRACER_SCRIPT = `
import sys
import json
import ast

def serialize_value(val, prev=None):
    """Convert a Python value into a JSON-safe structure for visualization."""
    try:
        if val is None:
            return {"type": "none", "repr": "None", "value": None}
        if isinstance(val, bool):
            return {"type": "bool", "repr": str(val), "value": val}
        if isinstance(val, int):
            return {"type": "int", "repr": str(val), "value": val}
        if isinstance(val, float):
            return {"type": "float", "repr": repr(val), "value": val}
        if isinstance(val, str):
            s = repr(val)
            if len(s) > 60:
                s = repr(val[:57] + "...")
            return {"type": "str", "repr": s, "value": val}
        if isinstance(val, (list, tuple)):
            items = [serialize_value(v) for v in val]
            changed = prev is not None and list(val) != list(prev) if isinstance(prev, (list, tuple)) else False
            return {
                "type": "list" if isinstance(val, list) else "tuple",
                "repr": repr(val) if len(repr(val)) <= 80 else f"{type(val).__name__}[{len(val)}]",
                "items": items,
                "length": len(val),
                "changed": changed,
            }
        if isinstance(val, dict):
            keys = [serialize_value(k) for k in val.keys()]
            values = [serialize_value(v) for v in val.values()]
            changed = prev is not None and val != prev
            return {
                "type": "dict",
                "repr": repr(val) if len(repr(val)) <= 80 else f"dict({len(val)} keys)",
                "keys": keys,
                "values": values,
                "length": len(val),
                "changed": changed,
            }
        if isinstance(val, set):
            return {
                "type": "set",
                "repr": repr(val) if len(repr(val)) <= 80 else f"set({len(val)})",
                "items": [serialize_value(v) for v in val],
                "length": len(val),
            }
        return {"type": type(val).__name__, "repr": repr(val)[:80]}
    except Exception:
        return {"type": "unknown", "repr": "<?>"}


def run_traced_code(source_code):
    steps = []
    stdout_lines = []
    prev_locals = {}
    step_num = [0]

    class StdoutCapture:
        def write(self, text):
            if text:
                stdout_lines.append(text)
        def flush(self):
            pass

    old_stdout = sys.stdout
    sys.stdout = StdoutCapture()

    user_lines = source_code.splitlines()
    source_lines = user_lines

    def make_step(frame, event, extra=None):
        lineno = frame.f_lineno
        func = frame.f_code.co_name
        locals_dict = {}
        for name, val in frame.f_locals.items():
            if name.startswith("__") and name.endswith("__"):
                continue
            prev = prev_locals.get(name)
            locals_dict[name] = serialize_value(val, prev)

        step_num[0] += 1
        step = {
            "step": step_num[0],
            "line": lineno,
            "event": event,
            "func": func,
            "locals": locals_dict,
            "stdout": "".join(stdout_lines),
        }
        if extra:
            step.update(extra)
        steps.append(step)
        prev_locals.clear()
        for k, v in frame.f_locals.items():
            if not (k.startswith("__") and k.endswith("__")):
                try:
                    prev_locals[k] = v if isinstance(v, (int, float, str, bool, type(None))) else (
                        list(v) if isinstance(v, list) else
                        tuple(v) if isinstance(v, tuple) else
                        dict(v) if isinstance(v, dict) else v
                    )
                except Exception:
                    prev_locals[k] = v

    def trace(frame, event, arg):
        if event == "line":
            make_step(frame, "line")
        elif event == "call":
            make_step(frame, "call")
        elif event == "return":
            make_step(frame, "return", {"returnValue": repr(arg)[:80]})
        elif event == "exception":
            make_step(frame, "exception", {"error": str(arg)})
        return trace

    error = None
    try:
        compiled = compile(source_code, "<user>", "exec")
        globals_dict = {"__name__": "__main__"}
        sys.settrace(trace)
        exec(compiled, globals_dict)
    except Exception as e:
        error = f"{type(e).__name__}: {e}"
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

    return json.dumps({
        "steps": steps,
        "sourceLines": source_lines,
        "error": error,
        "stdout": "".join(stdout_lines),
    })
`;
