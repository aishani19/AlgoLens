import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useDebouncedTopicSave } from "../../hooks/useDebouncedTopicSave.js";

const TOPIC = "stack";

export default function StackTopic() {
  const { user, bootstrapping, getTopicProgress } = useAuth();
  const initKey = useRef("");

  const [items, setItems] = useState([4, 1, 7]);

  useLayoutEffect(() => {
    if (bootstrapping) return;
    const key = `${user?.id ?? "anon"}`;
    if (initKey.current === key) return;
    initKey.current = key;
    const s = getTopicProgress(TOPIC);
    if (Array.isArray(s?.items)) setItems(s.items.map(Number));
  }, [bootstrapping, user, getTopicProgress]);

  const snapshot = useMemo(() => ({ items }), [items]);
  useDebouncedTopicSave(TOPIC, snapshot);

  function push() {
    const v = Math.floor(Math.random() * 30);
    setItems((s) => [...s, v]);
  }

  function pop() {
    setItems((s) => s.slice(0, -1));
  }

  return (
    <div>
      <p style={{ marginTop: 0 }}>
        <Link to="/">← All topics</Link>
      </p>
      <h1 style={{ marginBottom: "0.35rem" }}>Stack</h1>
      <p style={{ color: "var(--muted)", maxWidth: "760px", marginTop: 0 }}>
        A stack is last-in, first-out (LIFO). Think function calls, undo buffers, or matching parentheses. Push adds on top; pop removes from the top only.
      </p>

      <div className="viz-toolbar" style={{ marginTop: "1rem" }}>
        <button type="button" className="btn btn-primary" onClick={push}>
          Push random
        </button>
        <button type="button" className="btn" onClick={pop} disabled={!items.length}>
          Pop
        </button>
      </div>

      <div className="card viz-panel">
        <div className="stack-viz">
          <div>
            <div style={{ color: "var(--muted)", marginBottom: "0.5rem", fontSize: "0.95rem" }}>Top → bottom</div>
            <div className="stack-col" aria-label="Stack">
              {items.length === 0 ? <span style={{ color: "var(--muted)", alignSelf: "center" }}>empty</span> : null}
              {[...items].reverse().map((v, idx) => (
                <div key={`${items.length - 1 - idx}-${v}`} className="stack-item" style={idx === 0 ? { borderColor: "var(--accent-2)" } : undefined}>
                  {v}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 2, minWidth: "240px" }}>
            <p style={{ color: "var(--muted)" }}>
              Internally this can be an array where you only mutate the end — that is why push/pop are typically O(1) amortized.
            </p>
            <p className="mono" style={{ color: "var(--muted)", marginBottom: 0 }}>
              Underlying array view: [{items.join(", ")}]
            </p>
          </div>
        </div>
      </div>

      {!user ? (
        <p style={{ color: "var(--muted)", marginTop: "1rem" }}>
          <Link to="/register">Register</Link> to keep your practice stack between sessions.
        </p>
      ) : null}
    </div>
  );
}
