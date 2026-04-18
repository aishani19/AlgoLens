import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
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
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Could not log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "420px" }}>
      <h1 style={{ marginTop: 0 }}>Log in</h1>
      <p style={{ color: "var(--muted)" }}>
        No account? <Link to="/register">Register</Link>
      </p>
      <form className="card" style={{ padding: "1.25rem", display: "grid", gap: "0.85rem" }} onSubmit={onSubmit}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Email</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? (
          <div style={{ color: "var(--danger)", fontSize: "0.95rem" }} role="alert">
            {error}
          </div>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
