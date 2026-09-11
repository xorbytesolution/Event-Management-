import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Store,
  LogOut,
  Menu,
  X,
  UserCheck,
  ChevronRight,
  Home,
  ArrowUpRight,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();
  const { admin: user, logout, successMessage } = useAdminAuth();

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "Event Submissions",
      path: "/admin/event-submissions",
      icon: ClipboardList,
    },
    {
      name: "Events",
      path: "/admin/events",
      icon: CalendarDays,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Admin Profile",
      path: "/admin/profile",
      icon: UserCheck,
    },
  ];

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Admin logout failed:", error);

      // Even if the server logout fails, clear the frontend session
      // and return the admin to the login page.
      navigate("/admin/login", { replace: true });
    } finally {
      setLoggingOut(false);
      setSidebarOpen(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "AD";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="ml-3">
            <p className="text-sm font-extrabold text-slate-900">Admin Portal</p>
          </div>
        </div>

        <Link
          to="/admin/profile"
          className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-100"
          title="Admin Profile"
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user?.name || "Admin"}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-orange-200"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-extrabold text-orange-600 ring-2 ring-orange-200">
              {getInitials(user?.name)}
            </div>
          )}
        </Link>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              Admin Portal
            </p>

            <p className="mt-0.5 text-xs text-slate-500">Event Management</p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Admin Info - Clickable navigating to /admin/profile */}
        <div className="border-b border-slate-200 p-3">
          <Link
            to="/admin/profile"
            onClick={() => setSidebarOpen(false)}
            className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-orange-50/80 hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
            title="Manage Admin Profile"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user?.name || "Admin"}
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-orange-200 transition group-hover:ring-orange-400"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-extrabold text-orange-600 ring-2 ring-orange-200 transition group-hover:ring-orange-400 ${
                user?.profileImage ? "hidden" : ""
              }`}
            >
              {getInitials(user?.name)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-bold text-slate-900 transition group-hover:text-orange-600">
                  {user?.name || "Administrator"}
                </p>
                <ChevronRight
                  size={15}
                  className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500"
                />
              </div>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"></span>
                <p className="truncate text-xs font-medium text-slate-500 capitalize">
                  {user?.roles?.includes("admin") || user?.role === "admin"
                    ? "System Admin"
                    : user?.roles?.[0] || user?.role || "Admin"}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Management
          </p>

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-orange-50 text-orange-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={2} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer Actions: Visit Website + Logout */}
        <div className="border-t border-slate-200 p-3 space-y-1">
          <Link
            to="/"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
          >
            <Home size={19} />
            <span>Visit Website</span>
            <ArrowUpRight size={15} className="ml-auto text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={19} />

            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen p-6 sm:p-8 lg:pl-72">
        {successMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 shadow-xs animate-in fade-in slide-in-from-top-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[11px]">
              ✓
            </span>
            <span>{successMessage}</span>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
