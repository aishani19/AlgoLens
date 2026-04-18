import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const linkStyle = ({ isActive }) => ({
  color: isActive ? "var(--accent)" : "var(--muted)",
  fontWeight: 600,
});

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(11, 15, 23, 0.75)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "14px 0" }}>
        <Link to="/" style={{ fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", textDecoration: "none" }}>
          AlgoLens
        </Link>
        <nav style={{ display: "flex", gap: "1rem", marginLeft: "auto", flexWrap: "wrap", alignItems: "center" }}>
          <NavLink to="/" end style={linkStyle}>
            Topics
          </NavLink>
          {user ? (
            <>
              <Link to="/account" className="pill mono" style={{ color: "var(--text)", borderColor: "var(--border)" }}>
                {user.username}
              </Link>
              <button type="button" className="btn" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={linkStyle}>
                Log in
              </NavLink>
              <NavLink to="/register" style={linkStyle}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
