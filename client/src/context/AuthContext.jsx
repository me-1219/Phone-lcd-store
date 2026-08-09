import { createContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount, if a token exists but we haven't confirmed it's still valid,
  // re-fetch the profile so a stale/edited user object never lingers.
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (data) => {
    const { token, user } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    persistSession(res);
    return res.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authService.register(payload);
    // Only persist session if backend returned a token (user auto-signed in).
    if (res?.token) persistSession(res);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const userData = await authService.getMe();
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
