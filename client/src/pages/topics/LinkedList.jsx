import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StepToolbar from "../../components/StepToolbar.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useDebouncedTopicSave } from "../../hooks/useDebouncedTopicSave.js";

const TOPIC = "linked-list";
const DEFAULT_LIST = [3, 7, 2, 9];

function buildTraverseSteps(values) {
  const steps = [];
  for (let i = 0; i < values.length; i++) {
    steps.push({
      caption:
        i === 0
          ? "Traversal starts at the head pointer (first node)."
          : `Follow the next pointer from node ${i - 1} to node ${i}.`,
      highlight: i,
    });
  }
  steps.push({
    caption: "Reached null — traversal finished. Time complexity is O(n) with a single pass.",
    highlight: null,
    done: true,
  });
  return steps;
}

export default function LinkedList() {
  const { user, bootstrapping, getTopicProgress } = useAuth();
  const initKey = useRef("");

  const [values, setValues] = useState(DEFAULT_LIST);
  const [mode, setMode] = useState("manual");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs] = useState(750);

  const traverseSteps = useMemo(() => buildTraverseSteps(values), [values]);

  useEffect(() => {
    if (mode !== "traverse" || !playing) return;
    const id = setInterval(() => {
      setStepIndex((s) => {
        if (s >= traverseSteps.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [mode, playing, traverseSteps.length, speedMs]);

  useLayoutEffect(() => {
    if (bootstrapping) return;
    const key = `${user?.id ?? "anon"}`;
    if (initKey.current === key) return;
    initKey.current = key;
    const s = getTopicProgress(TOPIC);
    const nextVals = Array.isArray(s?.values) && s.values.length ? s.values.map(Number) : DEFAULT_LIST;
    setValues(nextVals);
    const nextMode = s?.mode === "traverse" || s?.mode === "manual" ? s.mode : "manual";
    setMode(nextMode);
    const ts = buildTraverseSteps(nextVals);
    if (typeof s?.stepIndex === "number") setStepIndex(Math.max(0, Math.min(s.stepIndex, ts.length - 1)));
  }, [bootstrapping, user, getTopicProgress]);

  const snapshot = useMemo(() => ({ values, mode, stepIndex }), [values, mode, stepIndex]);
  useDebouncedTopicSave(TOPIC, snapshot);

  function pushHead() {
    const n = Math.floor(Math.random() * 20);
    setValues((v) => [n, ...v]);
    setMode("manual");
    setStepIndex(0);
  }

  function pushTail() {
    const n = Math.floor(Math.random() * 20);
    setValues((v) => [...v, n]);
    setMode("manual");
    setStepIndex(0);
  }

  function popHead() {
    setValues((v) => (v.length ? v.slice(1) : v));
    setMode("manual");
    setStepIndex(0);
  }

  const steps = mode === "traverse" ? traverseSteps : [{ caption: "Edit the list with the buttons or run a traversal demo.", highlight: null }];

  const frame = mode === "traverse" ? traverseSteps[Math.min(stepIndex, traverseSteps.length - 1)] : steps[0];

  return (
    <div>
      <p style={{ marginTop: 0 }}>
        <Link to="/">← All topics</Link>
      </p>
      <h1 style={{ marginBottom: "0.35rem" }}>Linked List</h1>
      <p style={{ color: "var(--muted)", maxWidth: "760px", marginTop: 0 }}>
        Unlike arrays, nodes are linked with pointers. Inserting at the head is O(1), but finding an item still requires walking the chain — that is why traversal is a core pattern.
      </p>

      <div className="viz-toolbar" style={{ marginTop: "1rem" }}>
        <button type="button" className="btn" onClick={pushHead}>
          Insert at head
        </button>
        <button type="button" className="btn" onClick={pushTail}>
          Insert at tail
        </button>
        <button type="button" className="btn" onClick={popHead} disabled={!values.length}>
          Remove head
        </button>
        <button
          type="button"
          className={`btn ${mode === "traverse" ? "btn-primary" : ""}`}
          onClick={() => {
            setMode("traverse");
            setStepIndex(0);
            setPlaying(false);
          }}
        >
          Traversal demo
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setMode("manual");
            setStepIndex(0);
            setPlaying(false);
          }}
        >
          Manual view
        </button>
      </div>

      <div className="card viz-panel">
        {mode === "traverse" ? (
          <StepToolbar
            stepIndex={stepIndex}
            totalSteps={traverseSteps.length}
            playing={playing}
            onPrev={() => setStepIndex((s) => Math.max(0, s - 1))}
            onNext={() => setStepIndex((s) => Math.min(traverseSteps.length - 1, s + 1))}
            onReset={() => {
              setStepIndex(0);
              setPlaying(false);
            }}
            onPlayPause={() => setPlaying((p) => !p)}
          />
        ) : null}

        <div className="viz-caption">{frame.caption}</div>

        <div className="ll-row" aria-label="Linked list nodes">
          {values.map((v, idx) => (
            <div key={`${idx}-${v}`} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div className={`ll-node ${mode === "traverse" && frame.highlight === idx ? "hl" : ""}`}>{v}</div>
              {idx < values.length - 1 ? <span className="ll-arrow">→</span> : <span className="ll-arrow">→ ∅</span>}
            </div>
          ))}
          {values.length === 0 ? <span style={{ color: "var(--muted)" }}>Empty list (∅)</span> : null}
        </div>

        <p className="mono" style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 0 }}>
          Values: [{values.join(" → ")}]
        </p>
      </div>

      {!user ? (
        <p style={{ color: "var(--muted)", marginTop: "1rem" }}>
          <Link to="/register">Create an account</Link> to keep your list and demo position.
        </p>
      ) : null}
    </div>
  );
}
