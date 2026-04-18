import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StepToolbar from "../../components/StepToolbar.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useDebouncedTopicSave } from "../../hooks/useDebouncedTopicSave.js";

const TOPIC = "recursion";

function buildFibTraceSteps(n) {
  const steps = [];

  function fib(k, depth) {
    const pad = "  ".repeat(depth);
    steps.push({
      caption: `${pad}→ Enter fib(${k})`,
      depth,
      active: k,
      phase: "enter",
    });
    if (k <= 1) {
      steps.push({
        caption: `${pad}  Base case: return ${k}`,
        depth,
        active: k,
        phase: "base",
        result: k,
      });
      return k;
    }
    const left = fib(k - 1, depth + 1);
    const right = fib(k - 2, depth + 1);
    const val = left + right;
    steps.push({
      caption: `${pad}← Combine: fib(${k}) = fib(${k - 1}) + fib(${k - 2}) = ${left} + ${right} = ${val}`,
      depth,
      active: k,
      phase: "combine",
      result: val,
    });
    return val;
  }

  const answer = fib(n, 0);
  steps.push({
    caption: `Finished: fib(${n}) = ${answer}. Compare this exponential work with the DP tab for the same problem.`,
    depth: 0,
    active: null,
    phase: "done",
    result: answer,
  });
  return steps;
}

export default function RecursionTopic() {
  const { user, bootstrapping, getTopicProgress } = useAuth();
  const initKey = useRef("");

  const [n, setN] = useState(5);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(650);

  const capped = Math.min(Math.max(n, 0), 8);
  const steps = useMemo(() => buildFibTraceSteps(capped), [capped]);

  useLayoutEffect(() => {
    if (bootstrapping) return;
    const key = `${user?.id ?? "anon"}`;
    if (initKey.current === key) return;
    initKey.current = key;
    const s = getTopicProgress(TOPIC);
    if (typeof s?.n === "number") setN(Math.min(Math.max(s.n, 0), 8));
    if (typeof s?.stepIndex === "number") setStepIndex(Math.min(s.stepIndex, Math.max(steps.length - 1, 0)));
  }, [bootstrapping, user, getTopicProgress, steps.length]);

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [capped]);

  useEffect(() => {
    setStepIndex((i) => Math.min(i, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStepIndex((s) => {
        if (s >= steps.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [playing, steps.length, speedMs]);

  const snapshot = useMemo(() => ({ n: capped, stepIndex }), [capped, stepIndex]);
  useDebouncedTopicSave(TOPIC, snapshot);

  const frame = steps[Math.min(stepIndex, steps.length - 1)];

  return (
    <div>
      <p style={{ marginTop: 0 }}>
        <Link to="/">← All topics</Link>
      </p>
      <h1 style={{ marginBottom: "0.35rem" }}>Recursion</h1>
      <p style={{ color: "var(--muted)", maxWidth: "760px", marginTop: 0 }}>
        Recursion breaks a problem into smaller self-similar pieces until a base case stops the chain. The Fibonacci definition is a textbook example — notice how the same subproblems appear many times, which motivates memoization and dynamic programming.
      </p>

      <div className="viz-toolbar" style={{ marginTop: "1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--muted)" }}>
          n (0–8)
          <input
            className="input"
            type="number"
            min={0}
            max={8}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            style={{ width: "100px" }}
          />
        </label>
      </div>

      <div className="card viz-panel">
        <StepToolbar
          stepIndex={stepIndex}
          totalSteps={steps.length}
          playing={playing}
          onPrev={() => setStepIndex((s) => Math.max(0, s - 1))}
          onNext={() => setStepIndex((s) => Math.min(steps.length - 1, s + 1))}
          onReset={() => {
            setStepIndex(0);
            setPlaying(false);
          }}
          onPlayPause={() => setPlaying((p) => !p)}
          speedMs={speedMs}
          onSpeedChange={setSpeedMs}
        />
        <div className="viz-caption" style={{ fontFamily: "JetBrains Mono, monospace", whiteSpace: "pre-wrap" }}>
          {frame.caption}
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          <div className="pill mono">depth {frame.depth}</div>
          {frame.active !== null && frame.active !== undefined ? (
            <div className="pill mono">
              active n = {frame.active} ({frame.phase})
            </div>
          ) : null}
          {frame.result !== undefined && frame.result !== null ? (
            <div className="pill mono" style={{ borderColor: "rgba(52,211,153,0.45)", color: "var(--success)" }}>
              last result {frame.result}
            </div>
          ) : null}
        </div>
      </div>

      {!user ? (
        <p style={{ color: "var(--muted)", marginTop: "1rem" }}>
          <Link to="/register">Sign up</Link> to save your preferred n and playback position.
        </p>
      ) : null}
    </div>
  );
}
