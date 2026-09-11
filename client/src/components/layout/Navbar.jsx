import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
function Navbar() {
  const navigate = useNavigate();

  const { user, loading, logout, successMessage } = useAuth();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();

    setMobileOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {successMessage && (
        <div className="fixed right-5 top-20 z-[60] rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-lg">
          ✓ {successMessage}
        </div>
      )}
      {/* ==================== TOP BAR ==================== */}
      <div className="bg-[#0F172A]">
        <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-slate-300">For Featured Exhibitions</span>

            <a
              href="#featured"
              className="font-semibold text-orange-400 transition-colors hover:text-orange-300"
            >
              Click here
            </a>

            <span className="h-3.5 w-px bg-slate-600" />

            <span className="hidden text-slate-300 sm:inline">WhatsApp:</span>

            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              9999999999
            </a>
          </div>
        </div>
      </div>

      {/* ==================== MAIN NAVBAR ==================== */}
      <div className="border-b border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex h-[72px] w-full max-w-[1540px] items-center px-6 sm:px-8 lg:px-10">
          {/* Logo */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="text-[15px] font-extrabold tracking-tight text-white">
                bms
              </span>
            </div>

            <span className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
              Book my stall
              <span className="text-orange-500">.in</span>
            </span>
          </Link>

          {/* ==================== DESKTOP NAV ==================== */}
          <nav className="ml-auto hidden items-center gap-2 md:flex">
            {/* Home */}
            <Link
              to="/"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600"
            >
              Home
            </Link>

            {/* Services */}
            <div className="relative">
              <button
                onClick={() => {
                  setServicesOpen(!servicesOpen);
                  setCitiesOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  servicesOpen
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                Services
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    servicesOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {servicesOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                  <a
                    href="#stall-booking"
                    className="block rounded-lg px-3.5 py-2.5 text-sm text-slate-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                  >
                    Promote Event
                  </a>
                </div>
              )}
            </div>

            {/* Favorites */}
            <Link
              to="/favorites"
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                />
              </svg>
              My Favorites
            </Link>

            {/* Cities */}
            <div className="relative">
              <button
                onClick={() => {
                  setCitiesOpen(!citiesOpen);
                  setServicesOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  citiesOpen
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                Cities
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    citiesOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 1.04l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {citiesOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                  {[
                    "Hyderabad",
                    "Bangalore",
                    "Mumbai",
                    "Delhi",
                    "Pune",
                    "Chennai",
                    "Kolkata",
                    "Jaipur",
                  ].map((city) => (
                    <Link
                      key={city}
                      to={`/events/${city.toLowerCase()}`}
                      onClick={() => setCitiesOpen(false)}
                      className="block rounded-lg px-3.5 py-2.5 text-sm text-slate-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {!loading && !user && (
              <Link
                to="/login"
                className="ml-1 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </Link>
            )}

            {!loading && user && (
              <div className="flex items-center gap-1 ml-1">
                {(user.roles?.includes("organizer") || user.role === "organizer") && (
                  <Link
                    to="/organizer"
                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Organizer Portal
                  </Link>
                )}

                {(user.roles?.includes("admin") || user.role === "admin") && (
                  <Link
                    to="/admin"
                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Admin Portal
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Create Event */}
            <Link
              to="/create-event"
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md active:translate-y-0"
            >
              <span className="text-base leading-none">+</span>
              Create Event
            </Link>
          </nav>

          {/* ==================== MOBILE BUTTON ==================== */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* ==================== MOBILE MENU ==================== */}
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
              >
                Home
              </Link>

              <Link
                to="/favorites"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
              >
                ♡ My Favorites
              </Link>

              {user ? (
                <>
                  {(user.roles?.includes("organizer") || user.role === "organizer") && (
                    <Link
                      to="/organizer"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                    >
                      Organizer Portal
                    </Link>
                  )}

                  {(user.roles?.includes("admin") || user.role === "admin") && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                    >
                      Admin Portal
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                >
                  Login
                </Link>
              )}

              <Link
                to="/create-event"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-lg bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                + Create Event
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
