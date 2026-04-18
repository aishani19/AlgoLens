import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StepToolbar from "../../components/StepToolbar.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useDebouncedTopicSave } from "../../hooks/useDebouncedTopicSave.js";

const TOPIC = "arrays";

function buildBubbleSteps(start) {
  const steps = [];
  const arr = [...start];
  const n = arr.length;
  steps.push({
    caption: "Bubble sort repeatedly compares neighbors and swaps them if they are out of order.",
    arr: [...arr],
    compare: null,
    sortedFrom: n,
  });
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({
        caption: `Compare indices ${j} and ${j + 1}.`,
        arr: [...arr],
        compare: [j, j + 1],
        sortedFrom: n - i,
      });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({
          caption: `Swap: ${arr[j]} and ${arr[j + 1]} were out of order at positions ${j} and ${j + 1}.`,
          arr: [...arr],
          compare: [j, j + 1],
          sortedFrom: n - i,
          swapped: true,
        });
      }
    }
    steps.push({
      caption: `Pass ${i + 1} complete: the next largest value has bubbled into the sorted suffix.`,
      arr: [...arr],
      compare: null,
      sortedFrom: n - i - 1,
    });
  }
  steps.push({
    caption: "Done — the array is fully sorted.",
    arr: [...arr],
    compare: null,
    sortedFrom: 0,
    done: true,
  });
  return steps;
}

function buildBinarySteps(sorted, target) {
  const steps = [];
  const arr = [...sorted];
  let l = 0;
  let r = arr.length - 1;
  steps.push({
    caption: `Binary search needs a sorted array. Target = ${target}. Start with left = 0, right = ${r}.`,
    arr,
    l,
    r,
    mid: null,
    phase: "init",
  });
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    steps.push({
      caption: `Mid index = ${mid}, value = ${arr[mid]}.`,
      arr: [...arr],
      l,
      r,
      mid,
      phase: "mid",
    });
    if (arr[mid] === target) {
      steps.push({
        caption: `Found target ${target} at index ${mid}.`,
        arr: [...arr],
        l,
        r,
        mid,
        phase: "found",
      });
      return steps;
    }
    if (arr[mid] < target) {
      steps.push({
        caption: `${arr[mid]} < ${target}, so search the right half: left becomes ${mid + 1}.`,
        arr: [...arr],
        l,
        r,
        mid,
        phase: "move-right",
      });
      l = mid + 1;
    } else {
      steps.push({
        caption: `${arr[mid]} > ${target}, so search the left half: right becomes ${mid - 1}.`,
        arr: [...arr],
        l,
        r,
        mid,
        phase: "move-left",
      });
      r = mid - 1;
    }
  }
  steps.push({
    caption: `Target ${target} is not present (search space empty).`,
    arr: [...arr],
    l,
    r,
    mid: null,
    phase: "missing",
  });
  return steps;
}

export default function Arrays() {
  const { user, bootstrapping, getTopicProgress } = useAuth();
  const initKey = useRef("");

  const startBubble = useMemo(() => [5, 1, 4, 2, 8, 0], []);
  const sorted = useMemo(() => [0, 1, 2, 4, 5, 8], []);
  const target = 5;

  const [mode, setMode] = useState("bubble");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(700);

  const bubbleSteps = useMemo(() => buildBubbleSteps(startBubble), [startBubble]);
  const binarySteps = useMemo(() => buildBinarySteps(sorted, target), [sorted]);

  const steps = mode === "bubble" ? bubbleSteps : binarySteps;

  useLayoutEffect(() => {
    if (bootstrapping) return;
    const key = `${user?.id ?? "anon"}`;
    if (initKey.current === key) return;
    initKey.current = key;
    const s = getTopicProgress(TOPIC);
    const nextMode = s?.mode === "binary" || s?.mode === "bubble" ? s.mode : "bubble";
    setMode(nextMode);
    const max = (nextMode === "binary" ? binarySteps : bubbleSteps).length - 1;
    if (typeof s?.stepIndex === "number") setStepIndex(Math.max(0, Math.min(s.stepIndex, max)));
  }, [bootstrapping, user, getTopicProgress, bubbleSteps, binarySteps]);

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    setStepIndex((i) => Math.min(i, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  useEffect(() => {
    if (!playing) return;
    if (steps.length <= 1) return;
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

  const snapshot = useMemo(() => ({ mode, stepIndex }), [mode, stepIndex]);
  useDebouncedTopicSave(TOPIC, snapshot);

  const frame = steps[Math.min(stepIndex, steps.length - 1)];

  return (
    <div>
      <p style={{ marginTop: 0 }}>
        <Link to="/">← All topics</Link>
      </p>
      <h1 style={{ marginBottom: "0.35rem" }}>Arrays</h1>
      <p style={{ color: "var(--muted)", maxWidth: "760px", marginTop: 0 }}>
        Arrays store elements in contiguous memory. That makes index access fast, but inserting in the middle requires shifting elements. Watch classic algorithms move pointers across the same data.
      </p>

      <div className="viz-toolbar" style={{ marginTop: "1rem" }}>
        <span className="pill">Mode</span>
        <button type="button" className={`btn ${mode === "bubble" ? "btn-primary" : ""}`} onClick={() => setMode("bubble")}>
          Bubble sort
        </button>
        <button type="button" className={`btn ${mode === "binary" ? "btn-primary" : ""}`} onClick={() => setMode("binary")}>
          Binary search
        </button>
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
        <div className="viz-caption">{frame?.caption}</div>

        <div className="bar-row" aria-label="Array visualization">
          {frame?.arr?.map((v, idx) => {
            const max = Math.max(...frame.arr);
            const h = 40 + (v / max) * 110;
            let cls = "bar";
            if (mode === "bubble") {
              if (frame.compare?.includes(idx)) cls += " compare";
              if (typeof frame.sortedFrom === "number" && idx >= frame.sortedFrom) cls += " sorted";
            } else {
              if (idx === frame.mid) cls += " pivot";
              if (idx === frame.l || idx === frame.r) cls += " active";
            }
            return (
              <div key={`${idx}-${v}`} className={cls} style={{ height: `${h}px` }} title={`index ${idx}`}>
                <span className="mono" style={{ color: "inherit" }}>
                  {v}
                </span>
              </div>
            );
          })}
        </div>

        {mode === "binary" ? (
          <p className="mono" style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 0 }}>
            Sorted base: [{sorted.join(", ")}] · target = {target}
          </p>
        ) : (
          <p className="mono" style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 0 }}>
            Start: [{startBubble.join(", ")}]
          </p>
        )}
      </div>

      {!user ? (
        <p style={{ color: "var(--muted)", marginTop: "1rem" }}>
          <Link to="/register">Sign up</Link> to remember your last mode and step for this topic.
        </p>
      ) : null}
    </div>
  );
}
