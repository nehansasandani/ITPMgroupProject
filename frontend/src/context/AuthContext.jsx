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

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // On first load verify token is still valid
  useEffect(() => {
    const boot = async () => {
      try {
        if (!token) return;
        await axiosInstance.get("/users/me");
        // token is valid — keep existing user from localStorage
      } catch {
        // token expired or invalid — clear everything
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      boot();
    } else {
      setLoading(false);
    }
  }, []); // runs once on mount only

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