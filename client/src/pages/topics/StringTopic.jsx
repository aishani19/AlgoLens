import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StepToolbar from "../../components/StepToolbar.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useDebouncedTopicSave } from "../../hooks/useDebouncedTopicSave.js";

const TOPIC = "string";

function buildPalindromeSteps(s) {
  const steps = [];
  const chars = [...s];
  let l = 0;
  let r = chars.length - 1;
  steps.push({
    caption: "Palindrome check: compare characters moving inward with two pointers.",
    l: null,
    r: null,
    ok: true,
  });
  while (l <= r) {
    steps.push({
      caption: `Compare left index ${l} ('${chars[l]}') with right index ${r} ('${chars[r]}').`,
      l,
      r,
      ok: chars[l] === chars[r],
    });
    if (chars[l] !== chars[r]) {
      steps.push({
        caption: `Mismatch — not a palindrome.`,
        l,
        r,
        ok: false,
        done: true,
      });
      return steps;
    }
    steps.push({
      caption: `Match. Move inward: left++, right--.`,
      l,
      r,
      ok: true,
      advance: true,
    });
    l += 1;
    r -= 1;
  }
  steps.push({
    caption: "All mirrored pairs matched — string is a palindrome.",
    l: null,
    r: null,
    ok: true,
    done: true,
  });
  return steps;
}

export default function StringTopic() {
  const { user, bootstrapping, getTopicProgress } = useAuth();
  const initKey = useRef("");

  const [text, setText] = useState("racecar");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(750);

  const steps = useMemo(() => buildPalindromeSteps(text.replace(/\s+/g, "").toLowerCase() || "a"), [text]);

  useLayoutEffect(() => {
    if (bootstrapping) return;
    const key = `${user?.id ?? "anon"}`;
    if (initKey.current === key) return;
    initKey.current = key;
    const s = getTopicProgress(TOPIC);
    if (typeof s?.text === "string" && s.text.length) {
      const norm = s.text.replace(/\s+/g, "").toLowerCase() || "a";
      const built = buildPalindromeSteps(norm);
      setText(s.text);
      if (typeof s?.stepIndex === "number") {
        setStepIndex(Math.max(0, Math.min(s.stepIndex, Math.max(built.length - 1, 0))));
      }
    } else if (typeof s?.stepIndex === "number") {
      setStepIndex(Math.max(0, Math.min(s.stepIndex, Math.max(steps.length - 1, 0))));
    }
  }, [bootstrapping, user, getTopicProgress, steps.length]);

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

  const snapshot = useMemo(() => ({ text, stepIndex }), [text, stepIndex]);
  useDebouncedTopicSave(TOPIC, snapshot);

  const frame = steps[Math.min(stepIndex, steps.length - 1)];
  const normalized = text.replace(/\s+/g, "").toLowerCase() || "a";

  return (
    <div>
      <p style={{ marginTop: 0 }}>
        <Link to="/">← All topics</Link>
      </p>
      <h1 style={{ marginBottom: "0.35rem" }}>Strings</h1>
      <p style={{ color: "var(--muted)", maxWidth: "760px", marginTop: 0 }}>
        Strings behave like read-only character arrays in many languages. Two pointers from both ends is a classic palindrome pattern — watch how comparisons shrink the unknown region.
      </p>

      <div className="card viz-panel" style={{ marginTop: "1rem" }}>
        <label style={{ display: "grid", gap: "0.35rem", maxWidth: "420px" }}>
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Try your own (letters only for this demo)</span>
          <input
            className="input mono"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setStepIndex(0);
              setPlaying(false);
            }}
          />
        </label>

        <div style={{ marginTop: "1rem" }}>
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
        </div>

        <div className="viz-caption">{frame.caption}</div>

        <div
          className="mono"
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            padding: "1rem",
            background: "#0e1522",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            fontSize: "1.35rem",
            letterSpacing: "0.08em",
          }}
        >
          {[...normalized].map((ch, idx) => {
            let style = {
              padding: "0.35rem 0.45rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              minWidth: "2rem",
              textAlign: "center",
            };
            if (frame.l === idx || frame.r === idx) {
              style = {
                ...style,
                borderColor: "var(--accent)",
                boxShadow: "0 0 0 2px rgba(110,231,255,0.25)",
                color: "var(--accent)",
              };
            }
            if (frame.ok === false && (frame.l === idx || frame.r === idx)) {
              style = { ...style, borderColor: "var(--danger)", color: "var(--danger)" };
            }
            return (
              <span key={`${idx}-${ch}`} style={style}>
                {ch}
              </span>
            );
          })}
        </div>
      </div>

      {!user ? (
        <p style={{ color: "var(--muted)", marginTop: "1rem" }}>
          <Link to="/register">Sign in</Link> to save the string you practiced with.
        </p>
      ) : null}
    </div>
  );
}
