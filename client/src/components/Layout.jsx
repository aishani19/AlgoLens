import Navbar from "./Navbar.jsx";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "28px 0 48px" }}>
        {children}
      </main>
      <footer className="container" style={{ paddingBottom: "32px", color: "var(--muted)", fontSize: "0.9rem" }}>
        Built for learning: step through visuals, save progress when signed in.
      </footer>
    </>
  );
}
