import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  // Keep localStorage synced
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // On first load, verify token (optional but modern)
  useEffect(() => {
    const boot = async () => {
      try {
        if (!token) return;
        const res = await axiosInstance.get("/users/me");
        // res returns { message, user } in backend (your /me route)
        // We'll just keep existing stored user; or update if you later return full user data.
      } catch {
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    boot();
    if (!token) setLoading(false);
  }, []);

  const login = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role || "GUEST",
      isAuthed: !!token && !!user,
      login,
      logout,
      loading,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}