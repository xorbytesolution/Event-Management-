import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Route guard that requires the user to be logged in with exhibitor, organizer, or admin role
 */
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">
          Checking authentication...
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page with return path
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please log in to access your saved favorite events.",
        }}
      />
    );
  }

  // Ensure user has at least one valid client role
  const hasAllowedRole =
    user.roles?.some((role) =>
      ["exhibitor", "organizer", "admin"].includes(role),
    ) || ["exhibitor", "organizer", "admin"].includes(user.role);

  if (!hasAllowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
