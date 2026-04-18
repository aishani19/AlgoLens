import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useDebouncedTopicSave } from "../../hooks/useDebouncedTopicSave.js";

const TOPIC = "queue";
const CAP = 8;

export default function QueueTopic() {
  const { user, bootstrapping, getTopicProgress } = useAuth();
  const initKey = useRef("");

  const [items, setItems] = useState([1, 4, 6]);

  useLayoutEffect(() => {
    if (bootstrapping) return;
    const key = `${user?.id ?? "anon"}`;
    if (initKey.current === key) return;
    initKey.current = key;
    const s = getTopicProgress(TOPIC);
    if (Array.isArray(s?.items)) setItems(s.items.map(Number).slice(0, CAP));
  }, [bootstrapping, user, getTopicProgress]);

  const snapshot = useMemo(() => ({ items }), [items]);
  useDebouncedTopicSave(TOPIC, snapshot);

  function enqueue() {
    if (items.length >= CAP) return;
    const v = Math.floor(Math.random() * 30);
    setItems((q) => [...q, v]);
  }

  function dequeue() {
    setItems((q) => q.slice(1));
  }

  const slots = Array.from({ length: CAP }, (_, i) => items[i] ?? null);

  return (
    <div>
      <p style={{ marginTop: 0 }}>
        <Link to="/">← All topics</Link>
      </p>
      <h1 style={{ marginBottom: "0.35rem" }}>Queue</h1>
      <p style={{ color: "var(--muted)", maxWidth: "760px", marginTop: 0 }}>
        A queue is first-in, first-out (FIFO). New arrivals join the rear; service happens at the front — like a line at a counter. This panel caps length at {CAP} for clarity.
      </p>

      <div className="viz-toolbar" style={{ marginTop: "1rem" }}>
        <button type="button" className="btn btn-primary" onClick={enqueue} disabled={items.length >= CAP}>
          Enqueue
        </button>
        <button type="button" className="btn" onClick={dequeue} disabled={!items.length}>
          Dequeue
        </button>
      </div>

      <div className="card viz-panel">
        <div style={{ color: "var(--muted)", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
          Front <span style={{ opacity: 0.45 }}>←</span> · · · <span style={{ opacity: 0.45 }}>→</span> Rear
        </div>
        <div className="queue-row" aria-label="Queue">
          {slots.map((v, idx) => (
            <div key={idx} className={`queue-slot ${v !== null ? "filled" : ""}`}>
              {v === null ? "" : v}
            </div>
          ))}
        </div>
        <p className="mono" style={{ color: "var(--muted)", marginTop: "1rem", marginBottom: 0 }}>
          Active values: [{items.join(", ")}]
        </p>
      </div>

      {!user ? (
        <p style={{ color: "var(--muted)", marginTop: "1rem" }}>
          <Link to="/login">Log in</Link> to persist your queue state for demos.
        </p>
      ) : null}
    </div>
  );
}
