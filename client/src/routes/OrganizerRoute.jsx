import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OrganizerRoute() {
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

  // If not logged in, redirect to login page with return location
  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  // Check if user has the organizer role
  const hasOrganizerRole =
    user.roles?.includes("organizer") || user.role === "organizer";

  if (!hasOrganizerRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default OrganizerRoute;
