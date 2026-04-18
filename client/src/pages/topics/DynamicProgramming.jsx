import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StepToolbar from "../../components/StepToolbar.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useDebouncedTopicSave } from "../../hooks/useDebouncedTopicSave.js";

const TOPIC = "dynamic-programming";

function buildFibDpSteps(n) {
  const steps = [];
  if (n <= 0) {
    steps.push({ caption: "fib(0) = 0", cells: [{ i: 0, val: 0 }], current: 0 });
    return steps;
  }
  const dp = Array(n + 1).fill(null);
  dp[0] = 0;
  steps.push({
    caption: "DP idea: build fib bottom-up. Start with fib(0) = 0.",
    cells: [{ i: 0, val: 0 }],
    current: 0,
  });
  if (n >= 1) {
    dp[1] = 1;
    steps.push({
      caption: "fib(1) = 1 — seed two base values.",
      cells: [
        { i: 0, val: 0 },
        { i: 1, val: 1 },
      ],
      current: 1,
    });
  }
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    const cells = [];
    for (let j = 0; j <= i; j++) {
      cells.push({ i: j, val: dp[j] });
    }
    steps.push({
      caption: `Compute fib(${i}) = fib(${i - 1}) + fib(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`,
      cells,
      current: i,
    });
  }
  steps.push({
    caption: `Answer is dp[${n}] = ${dp[n]} — computed in O(n) time and O(n) space (can be optimized to O(1) space).`,
    cells: Array.from({ length: n + 1 }, (_, j) => ({ i: j, val: dp[j] })),
    current: null,
    done: true,
  });
  return steps;
}

export default function DynamicProgramming() {
  const { user, bootstrapping, getTopicProgress } = useAuth();
  const initKey = useRef("");

  const [n, setN] = useState(10);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(600);

  const capped = Math.min(Math.max(n, 0), 18);
  const steps = useMemo(() => buildFibDpSteps(capped), [capped]);

  useLayoutEffect(() => {
    if (bootstrapping) return;
    const key = `${user?.id ?? "anon"}`;
    if (initKey.current === key) return;
    initKey.current = key;
    const s = getTopicProgress(TOPIC);
    if (typeof s?.n === "number") setN(Math.min(Math.max(s.n, 0), 18));
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
      <h1 style={{ marginBottom: "0.35rem" }}>Dynamic Programming</h1>
      <p style={{ color: "var(--muted)", maxWidth: "760px", marginTop: 0 }}>
        Dynamic programming reuses overlapping subproblems. Instead of recomputing fib(n-1) many times, store answers in a table (memo) and fill iteratively. This demo shows the classic Fibonacci table — the same problem as the recursion page, but without exponential blow-up.
      </p>

      <div className="viz-toolbar" style={{ marginTop: "1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--muted)" }}>
          Target n (0–18)
          <input
            className="input"
            type="number"
            min={0}
            max={18}
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
        <div className="viz-caption">{frame.caption}</div>

        <div
          className="dp-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))",
            maxWidth: "720px",
          }}
        >
          {frame.cells.map((c) => (
            <div
              key={c.i}
              className={`dp-cell ${c.val !== null && c.val !== undefined ? "filled" : ""} ${frame.current === c.i ? "current" : ""}`}
              title={`index ${c.i}`}
            >
              <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>i={c.i}</div>
              <div>{c.val}</div>
            </div>
          ))}
        </div>
      </div>

      {!user ? (
        <p style={{ color: "var(--muted)", marginTop: "1rem" }}>
          <Link to="/login">Log in</Link> to store your last n and animation step.
        </p>
      ) : null}
    </div>
  );
}
