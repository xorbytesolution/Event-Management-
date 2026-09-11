import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  const checkAuth = async () => {
    try {
      const { data } = await api.get("/auth/me");
      const hasClientRole =
        data.user?.roles?.includes("exhibitor") ||
        data.user?.roles?.includes("organizer") ||
        data.user?.role === "exhibitor" ||
        data.user?.role === "organizer";

      if (!hasClientRole) {
        setUser(null);
        return null;
      }

      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  const value = {
    user,
    setUser,
    updateUser,
    loading,
    isAuthenticated: !!user,
    logout,
    checkAuth,
    successMessage,
    showSuccessMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
