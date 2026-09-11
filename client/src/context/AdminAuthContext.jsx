import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  const checkAdminAuth = async () => {
    try {
      const { data } = await api.get("/admin/profile");
      const adminData = data.profile || data.admin || data.user || null;
      setAdmin(adminData);
      return adminData;
    } catch {
      setAdmin(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const adminLogout = async () => {
    try {
      await api.post("/admin/logout");
    } catch (err) {
      console.error("Admin logout error:", err);
    } finally {
      setAdmin(null);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const updateAdmin = (updatedFields) => {
    setAdmin((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  const value = {
    admin,
    user: admin,
    setAdmin,
    updateAdmin,
    loading,
    isAuthenticated: !!admin,
    logout: adminLogout,
    checkAdminAuth,
    checkAuth: checkAdminAuth,
    successMessage,
    showSuccessMessage,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
