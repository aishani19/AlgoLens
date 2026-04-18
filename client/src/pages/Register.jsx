import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ email, username, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Could not register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "420px" }}>
      <h1 style={{ marginTop: 0 }}>Create your AlgoLens account</h1>
      <p style={{ color: "var(--muted)" }}>
        Already have one? <Link to="/login">Log in</Link>
      </p>
      <form className="card" style={{ padding: "1.25rem", display: "grid", gap: "0.85rem" }} onSubmit={onSubmit}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Email</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Username</span>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Password (min 6)</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        {error ? (
          <div style={{ color: "var(--danger)", fontSize: "0.95rem" }} role="alert">
            {error}
          </div>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating…" : "Register & start learning"}
        </button>
      </form>
    </div>
  );
}
