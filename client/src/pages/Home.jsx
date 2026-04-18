import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const topics = [
  {
    id: "arrays",
    path: "/topics/arrays",
    title: "Arrays",
    blurb: "Sorting, searching, and how indices move across memory.",
  },
  {
    id: "linked-list",
    path: "/topics/linked-list",
    title: "Linked List",
    blurb: "Nodes, pointers, and why inserts differ from arrays.",
  },
  {
    id: "string",
    path: "/topics/string",
    title: "Strings",
    blurb: "Characters as arrays: palindromes and two pointers.",
  },
  {
    id: "stack",
    path: "/topics/stack",
    title: "Stack",
    blurb: "LIFO structure: push, pop, and call stacks.",
  },
  {
    id: "queue",
    path: "/topics/queue",
    title: "Queue",
    blurb: "FIFO flow: enqueue, dequeue, and fairness.",
  },
  {
    id: "recursion",
    path: "/topics/recursion",
    title: "Recursion",
    blurb: "Calls that call themselves: trace the stack mentally.",
  },
  {
    id: "dynamic-programming",
    path: "/topics/dynamic-programming",
    title: "Dynamic Programming",
    blurb: "Overlapping subproblems: build answers from smaller ones.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <div style={{ maxWidth: "720px", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", margin: "0 0 0.75rem", letterSpacing: "-0.03em" }}>
          Learn DSA with motion, not just slides.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.05rem", margin: 0 }}>
          AlgoLens pairs short explanations with step-by-step visuals across core structures.{" "}
          {user ? (
            <>
              Signed in as <span className="mono">{user.username}</span> — your last step and mode per topic stay in sync.
            </>
          ) : (
            <>
              <Link to="/register">Create an account</Link> to save your place on each topic automatically.
            </>
          )}
        </p>
      </div>

      <div className="grid-topics">
        {topics.map((t) => (
          <Link key={t.id} to={t.path} style={{ textDecoration: "none", color: "inherit" }}>
            <article className="topic-card">
              <h3>{t.title}</h3>
              <p>{t.blurb}</p>
              <div style={{ marginTop: "0.85rem" }}>
                <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem" }}>Open visualizer →</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
