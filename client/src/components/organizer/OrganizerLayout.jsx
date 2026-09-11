import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  UserCircle,
  LogOut,
  Menu,
  X,
  Home,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function OrganizerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/organizer",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "My Events",
      path: "/organizer/events",
      icon: CalendarDays,
    },
    {
      name: "Inquiries",
      path: "/organizer/inquiries",
      icon: MessageSquare,
    },
    {
      name: "Profile",
      path: "/organizer/profile",
      icon: UserCircle,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login");
    }
  };

  const getInitials = (name) => {
    if (!name) return "OR";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
            <p className="text-sm font-extrabold text-slate-900">
              Organizer Portal
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
        >
          <Home size={14} />
          <span>Visit Website</span>
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
          <Link
            to="/"
            className="group flex items-center gap-2.5 transition"
            title="Go to Book My Stall Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white font-extrabold text-xs shadow-xs transition group-hover:scale-105">
              bms
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-slate-900 group-hover:text-orange-600 transition">
                Organizer Portal
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                Book my stall.in
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Organizer Info */}
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-sm font-extrabold text-orange-600">
              {getInitials(user?.name)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {user?.name || "Organizer"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || "Event Organizer"}
              </p>
            </div>
          </div>
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
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:pl-64">
        <Outlet />
      </main>
    </div>
  );
}

export default OrganizerLayout;
