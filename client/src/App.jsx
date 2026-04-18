import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Arrays from "./pages/topics/Arrays.jsx";
import LinkedList from "./pages/topics/LinkedList.jsx";
import StringTopic from "./pages/topics/StringTopic.jsx";
import StackTopic from "./pages/topics/StackTopic.jsx";
import QueueTopic from "./pages/topics/QueueTopic.jsx";
import RecursionTopic from "./pages/topics/RecursionTopic.jsx";
import DynamicProgramming from "./pages/topics/DynamicProgramming.jsx";

function Protected({ children }) {
  const { user, bootstrapping } = useAuth();
  if (bootstrapping) {
    return (
      <div className="container" style={{ padding: "48px 0", color: "var(--muted)" }}>
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { bootstrapping, token } = useAuth();

  return (
    <Layout>
      {bootstrapping && token ? (
        <div style={{ color: "var(--muted)", marginBottom: "1rem" }}>Syncing your saved progress…</div>
      ) : null}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/topics/arrays" element={<Arrays />} />
        <Route path="/topics/linked-list" element={<LinkedList />} />
        <Route path="/topics/string" element={<StringTopic />} />
        <Route path="/topics/stack" element={<StackTopic />} />
        <Route path="/topics/queue" element={<QueueTopic />} />
        <Route path="/topics/recursion" element={<RecursionTopic />} />
        <Route path="/topics/dynamic-programming" element={<DynamicProgramming />} />
        <Route
          path="/account"
          element={
            <Protected>
              <AccountPlaceholder />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function AccountPlaceholder() {
  const { user } = useAuth();
  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <h2 style={{ marginTop: 0 }}>Signed in</h2>
      <p style={{ color: "var(--muted)", marginBottom: 0 }}>
        You are learning as <strong>{user?.username}</strong>. Topic progress syncs automatically on each visualizer page.
      </p>
    </div>
  );
}
