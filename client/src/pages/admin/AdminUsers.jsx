import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Eye,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  X,
  UserCheck,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("all");
  const [accountStatus, setAccountStatus] = useState("");
  const [verified, setVerified] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [aggregates, setAggregates] = useState({
    totalUsers: 0,
    totalExhibitors: 0,
    totalOrganizers: 0,
    dualRoleUsers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const [{ data }] = await Promise.all([
        api.get("/admin/users", {
          params: {
            page,
            limit: 10,
            ...(searchTerm ? { search: searchTerm } : {}),
            ...(role && role !== "all" ? { role } : {}),
            ...(accountStatus ? { accountStatus } : {}),
            ...(verified ? { verified } : {}),
          },
        }),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);

      setUsers(data.users || []);
      setPagination(
        data.pagination || {
          page,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      );
      setAggregates(
        data.aggregates || {
          totalUsers: 0,
          totalExhibitors: 0,
          totalOrganizers: 0,
          dualRoleUsers: 0,
        },
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load users.",
      );
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [role, accountStatus, verified]);

  useEffect(() => {
    loadUsers();
  }, [page, searchTerm, role, accountStatus, verified]);

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (page >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const firstItem =
    pagination.total === 0 ? 0 : (page - 1) * pagination.limit + 1;
  const lastItem = Math.min(page * pagination.limit, pagination.total);

  const hasActiveFilters =
    searchInput.trim() ||
    (role && role !== "all") ||
    accountStatus ||
    verified;

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setRole("all");
    setAccountStatus("");
    setVerified("");
    setPage(1);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-orange-500">Platform Management</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Users Directory
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Monitor and manage all exhibitors, organizers, and dual-role accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            size={16}
            className={`text-slate-500 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Users size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {initialLoading ? "..." : aggregates.totalUsers}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Registered platform users</p>
        </div>

        {/* Exhibitors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Exhibitors
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <UserCheck size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-blue-600">
            {initialLoading ? "..." : aggregates.totalExhibitors}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Book stalls & exhibit</p>
        </div>

        {/* Organizers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Organizers
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-orange-600">
            {initialLoading ? "..." : aggregates.totalOrganizers}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Host & publish events</p>
        </div>

        {/* Dual Role */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dual-Role
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-purple-600">
            {initialLoading ? "..." : aggregates.dualRoleUsers}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Both roles active</p>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
        {[
          { id: "all", label: "All Users" },
          { id: "exhibitor", label: "Exhibitors" },
          { id: "organizer", label: "Organizers" },
          { id: "both", label: "Dual Role (Both)" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setRole(tab.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              role === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Account Status Filter */}
          <select
            value={accountStatus}
            onChange={(e) => setAccountStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={verified}
            onChange={(e) => setVerified(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="">All Verifications</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-500">Filters applied</span>
            <button
              type="button"
              onClick={clearFilters}
              className="font-bold text-orange-600 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadUsers}
            className="font-bold underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Users Table / Skeleton */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-slate-200" />
                  <div className="h-3 w-32 rounded bg-slate-100" />
                </div>
                <div className="h-6 w-24 rounded bg-slate-100 hidden sm:block" />
                <div className="h-8 w-20 rounded-lg bg-slate-100 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Users size={24} />
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-800">No users found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {hasActiveFilters
              ? "Try adjusting your search criteria or filters."
              : "No registered users in this role yet."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Assigned Roles</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">Registered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isExhibitor = u.roles?.includes("exhibitor");
                  const isOrganizer = u.roles?.includes("organizer");

                  return (
                    <tr
                      key={u._id}
                      className="transition hover:bg-slate-50/60"
                    >
                      {/* User Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-600 uppercase shadow-2xs">
                            {u.name?.[0] || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {u.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate font-mono">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4 text-xs text-slate-700 font-mono">
                        {u.phone || "—"}
                      </td>

                      {/* Roles */}
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isExhibitor && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                              Exhibitor
                            </span>
                          )}
                          {isOrganizer && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 border border-orange-200/80 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                              Organizer
                            </span>
                          )}
                          {isExhibitor && isOrganizer && (
                            <span className="inline-flex items-center rounded-md bg-purple-50 border border-purple-200/80 px-1.5 py-0.5 text-[10px] font-extrabold text-purple-700">
                              Dual
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                              u.accountStatus === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.accountStatus === "active"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {u.accountStatus || "active"}
                          </span>

                          {u.isVerified && (
                            <span
                              className="text-blue-500"
                              title="Verified Account"
                            >
                              <CheckCircle2 size={15} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="px-4 py-4 text-xs text-slate-500 hidden md:table-cell">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/users/${u._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 text-xs">
              <span className="text-slate-500">
                Showing <strong className="text-slate-700">{firstItem}</strong> to{" "}
                <strong className="text-slate-700">{lastItem}</strong> of{" "}
                <strong className="text-slate-700">{pagination.total}</strong> users
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  Previous
                </button>

                {getPageNumbers().map((pNum, idx) =>
                  pNum === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setPage(pNum)}
                      className={`h-8 w-8 rounded-lg font-bold transition ${
                        page === pNum
                          ? "bg-orange-500 text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                  disabled={page === pagination.totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
