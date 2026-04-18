import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "algolens_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [progress, setProgress] = useState({});
  const [bootstrapping, setBootstrapping] = useState(true);

  const loadProgress = useCallback(async (authToken) => {
    setAuthToken(authToken);
    const { data } = await api.get("/api/user/progress");
    setProgress(data.progress || {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!token) {
        setAuthToken(null);
        setUser(null);
        setProgress({});
        setBootstrapping(false);
        return;
      }
      setAuthToken(token);
      try {
        const { data } = await api.get("/api/auth/me");
        if (cancelled) return;
        setUser(data.user);
        await loadProgress(token);
      } catch {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setProgress({});
        setAuthToken(null);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token, loadProgress]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    const prog = await api.get("/api/user/progress");
    setProgress(prog.data.progress || {});
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/api/auth/register", payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setProgress({});
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setProgress({});
    setAuthToken(null);
  }, []);

  const getTopicProgress = useCallback(
    (topicId) => {
      return progress[topicId] || {};
    },
    [progress]
  );

  const patchTopicProgress = useCallback((topicId, partial) => {
    setProgress((prev) => ({
      ...prev,
      [topicId]: { ...(prev[topicId] || {}), ...partial },
    }));
  }, []);

  const persistTopicProgress = useCallback(
    async (topicId, nextObj) => {
      if (!token) return;
      setAuthToken(token);
      await api.put(`/api/user/progress/${topicId}`, { progress: nextObj });
    },
    [token]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      bootstrapping,
      progress,
      login,
      register,
      logout,
      getTopicProgress,
      patchTopicProgress,
      persistTopicProgress,
    }),
    [
      user,
      token,
      bootstrapping,
      progress,
      login,
      register,
      logout,
      getTopicProgress,
      patchTopicProgress,
      persistTopicProgress,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
