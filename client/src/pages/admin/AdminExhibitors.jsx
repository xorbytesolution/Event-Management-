import { useEffect, useState } from "react";
import {
  Search,
  Store,
  Eye,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Tag,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function AdminExhibitors() {
  const [exhibitors, setExhibitors] = useState([]);

  // What the user is currently typing
  const [searchInput, setSearchInput] = useState("");

  // Debounced search value sent to the backend
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
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
    totalExhibitors: 0,
    activeExhibitors: 0,
    verifiedExhibitors: 0,
  });

  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExhibitors = async () => {
    try {
      setLoading(true);
      setError("");

      const [{ data }] = await Promise.all([
        api.get("/admin/exhibitors", {
          params: {
            page,
            limit: 10,
            ...(searchTerm ? { search: searchTerm } : {}),
            ...(category ? { category } : {}),
            ...(accountStatus ? { accountStatus } : {}),
            ...(verified ? { verified } : {}),
          },
        }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      setExhibitors(data.exhibitors);

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
          totalExhibitors: 0,
          activeExhibitors: 0,
          verifiedExhibitors: 0,
        },
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load exhibitors.",
      );
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  /*
   * Debounce search.
   *
   * The API is called only after the user
   * stops typing for 400ms.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [category, accountStatus, verified]);

  /*
   * Load exhibitors whenever:
   * - page changes
   * - debounced search changes
   */
  useEffect(() => {
    loadExhibitors();
  }, [page, searchTerm, category, accountStatus, verified]);

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
    searchInput.trim() || category || accountStatus || verified;

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setCategory("");
    setAccountStatus("");
    setVerified("");
    setPage(1);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-orange-500">User Management</p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Exhibitors
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View registered exhibitors and their business categories.
          </p>
        </div>

        <button
          type="button"
          onClick={loadExhibitors}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Store}
          title="Total Exhibitors"
          value={aggregates.totalExhibitors}
          description={
            searchTerm || category || accountStatus || verified
              ? "Exhibitors matching your filters"
              : "Registered exhibitors"
          }
          loading={initialLoading}
        />

        <SummaryCard
          icon={CheckCircle2}
          title="Active Accounts"
          value={aggregates.activeExhibitors}
          description="Active exhibitors"
          loading={initialLoading}
        />

        <SummaryCard
          icon={
            aggregates.verifiedExhibitors === aggregates.totalExhibitors &&
            aggregates.totalExhibitors > 0
              ? CheckCircle2
              : XCircle
          }
          title="Verified"
          value={aggregates.verifiedExhibitors}
          description="Verified exhibitors"
          loading={initialLoading}
        />
      </div>

      {/* Exhibitor List */}
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search */}
        {/* Search + Filters */}
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative w-full lg:flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search exhibitors, email, phone or category..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
              />
            </div>

            {/* Category */}
            <div className="relative w-full lg:w-56">
              <Tag
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
              >
                <option value="">All Categories</option>
                <option value="Mens Wear">Mens Wear</option>
                <option value="Kids Wear">Kids Wear</option>
                <option value="Home Decor">Home Decor</option>
                <option value="Handicrafts">Handicrafts</option>
                <option value="Organic Products">Organic Products</option>
                <option value="Promotional Stalls">Promotional Stalls</option>
                <option value="Food Stalls">Food Stalls</option>
                <option value="Jewellery">Jewellery</option>
                <option value="Bridal & Ethnic Wear">
                  Bridal & Ethnic Wear
                </option>
                <option value="Automobiles">Automobiles</option>
                <option value="Sports Wear">Sports Wear</option>
                <option value="Fashion Accessories">Fashion Accessories</option>
                <option value="Devotional Products">Devotional Products</option>
                <option value="Footwear">Footwear</option>
                <option value="Stationary & Books">Stationary & Books</option>
                <option value="Event Organizer">Event Organizer</option>
                <option value="Health & Medical">Health & Medical</option>
                <option value="Electronic Gadgets">Electronic Gadgets</option>
                <option value="Kitchenware">Kitchenware</option>
                <option value="Women Wear">Women Wear</option>
                <option value="Handmade Products">Handmade Products</option>
                <option value="Cosmetics & Beauty">Cosmetics & Beauty</option>
                <option value="Startups">Startups</option>
                <option value="Home Furnishing">Home Furnishing</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Fitness Equipments">Fitness Equipments</option>
                <option value="Nutrition & Wellness">
                  Nutrition & Wellness
                </option>
                <option value="Home Appliances">Home Appliances</option>
                <option value="Toys">Toys</option>
                <option value="NGO's">NGO's</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Account Status */}
            <div className="relative w-full lg:w-44">
              <select
                value={accountStatus}
                onChange={(event) => setAccountStatus(event.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Verification */}
            <div className="relative w-full lg:w-44">
              <ShieldCheck
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={verified}
                onChange={(event) => setVerified(event.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
              >
                <option value="">All Verification</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={15} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-4 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadExhibitors}
              className="shrink-0 font-bold text-red-700 underline underline-offset-2 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <ExhibitorsTableSkeleton />
        ) : exhibitors.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Store size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No exhibitors found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {hasActiveFilters
                ? "Try changing or clearing your filters."
                : "No exhibitors are registered yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Exhibitor
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Contact
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Categories
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Registered
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {exhibitors.map((exhibitor) => {
                    const user = exhibitor.userId;

                    return (
                      <tr
                        key={exhibitor._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-orange-500">
                              {user?.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={user.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Store size={19} />
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {user?.name || "Unknown"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Phone size={14} />
                              {user?.phone || "—"}
                            </p>

                            <p className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail size={13} />
                              {user?.email || "—"}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex max-w-[260px] flex-wrap gap-1.5">
                            {exhibitor.categories
                              ?.slice(0, 3)
                              .map((category) => (
                                <span
                                  key={category}
                                  className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700"
                                >
                                  {category}
                                </span>
                              ))}

                            {exhibitor.categories?.length > 3 && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                +{exhibitor.categories.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              user?.accountStatus === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {user?.accountStatus || "Unknown"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(user?.createdAt)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/admin/exhibitors/${user?._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                          >
                            <Eye size={15} />
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {exhibitors.map((exhibitor) => {
                const user = exhibitor.userId;

                return (
                  <div key={exhibitor._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-orange-500">
                          {user?.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Store size={19} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {user?.name || "Unknown"}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {user?.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${
                          user?.accountStatus === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user?.accountStatus || "Unknown"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <Phone size={14} />
                        {user?.phone || "—"}
                      </p>

                      <p>Registered: {formatDate(user?.createdAt)}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {exhibitor.categories?.map((category) => (
                        <span
                          key={category}
                          className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700"
                        >
                          {category}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Link
                        to={`/admin/exhibitors/${user?._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Eye size={15} />
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {firstItem}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold text-slate-700">
                    {lastItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {pagination.total}
                  </span>
                </p>

                <div className="flex items-center gap-1">
                  {/* Previous */}
                  <button
                    type="button"
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page === 1 || loading}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((pageNumber, index) =>
                    pageNumber === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-sm text-slate-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        disabled={loading}
                        className={`hidden h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition sm:block ${
                          pageNumber === page
                            ? "bg-orange-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page === pagination.totalPages || loading}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, value, description, loading }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          {loading ? (
            <div className="mt-2 h-9 w-20 animate-pulse rounded-lg bg-slate-200" />
          ) : (
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
          )}
        </div>

        <div className="rounded-lg bg-orange-50 p-2.5 text-orange-500">
          <Icon size={21} />
        </div>
      </div>

      {loading ? (
        <div className="mt-3 h-3.5 w-32 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-3 text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}

const EXHIBITOR_SKELETON_ROWS = [
  { nameW: "w-32", subW: "w-24", emailW: "w-36", phoneW: "w-24", catW: "w-20", statusW: "w-16", dateW: "w-24" },
  { nameW: "w-28", subW: "w-28", emailW: "w-40", phoneW: "w-20", catW: "w-24", statusW: "w-16", dateW: "w-24" },
  { nameW: "w-36", subW: "w-20", emailW: "w-32", phoneW: "w-28", catW: "w-28", statusW: "w-16", dateW: "w-24" },
  { nameW: "w-40", subW: "w-28", emailW: "w-44", phoneW: "w-24", catW: "w-20", statusW: "w-16", dateW: "w-24" },
  { nameW: "w-32", subW: "w-24", emailW: "w-36", phoneW: "w-20", catW: "w-32", statusW: "w-16", dateW: "w-24" },
  { nameW: "w-28", subW: "w-32", emailW: "w-40", phoneW: "w-24", catW: "w-24", statusW: "w-16", dateW: "w-24" },
  { nameW: "w-36", subW: "w-24", emailW: "w-36", phoneW: "w-24", catW: "w-20", statusW: "w-16", dateW: "w-24" },
  { nameW: "w-44", subW: "w-28", emailW: "w-44", phoneW: "w-20", catW: "w-28", statusW: "w-16", dateW: "w-24" },
  { nameW: "w-32", subW: "w-20", emailW: "w-32", phoneW: "w-24", catW: "w-24", statusW: "w-16", dateW: "w-24" },
  { nameW: "w-36", subW: "w-28", emailW: "w-40", phoneW: "w-20", catW: "w-20", statusW: "w-16", dateW: "w-24" },
];

function ExhibitorsTableSkeleton() {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Exhibitor
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Contact
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Categories
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Registered
              </th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {EXHIBITOR_SKELETON_ROWS.map((row, index) => (
              <tr key={index} className="animate-pulse">
                {/* Exhibitor */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-orange-50/80 border border-orange-100/50" />
                    <div className="space-y-1.5 min-w-0">
                      <div className={`h-4 rounded-md bg-slate-200 ${row.nameW}`} />
                      <div className={`h-3 rounded bg-slate-100 ${row.subW}`} />
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-5 py-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className={`h-4 rounded bg-slate-200 ${row.emailW}`} />
                    <div className={`h-3 rounded bg-slate-100 ${row.phoneW}`} />
                  </div>
                </td>

                {/* Categories */}
                <td className="px-5 py-4">
                  <div className={`h-6 rounded-md bg-slate-100 ${row.catW}`} />
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <div className={`h-6 rounded-full bg-slate-100 ${row.statusW}`} />
                </td>

                {/* Registered */}
                <td className="px-5 py-4">
                  <div className={`h-4 rounded bg-slate-200 ${row.dateW}`} />
                </td>

                {/* Action */}
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
                    <Eye size={15} className="text-slate-300" />
                    <span className="h-3 w-7 rounded bg-slate-200" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="divide-y divide-slate-100 md:hidden animate-pulse">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-orange-50 border border-orange-100" />
                <div className="min-w-0 space-y-1.5">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
              </div>
              <div className="h-5 w-16 rounded-full bg-slate-100" />
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="h-3.5 w-40 rounded bg-slate-100" />
              <div className="h-3.5 w-28 rounded bg-slate-100" />
              <div className="h-5 w-24 rounded-md bg-slate-100" />
            </div>

            <div className="mt-4 flex justify-end">
              <div className="inline-flex h-8 w-24 items-center justify-center rounded-lg border border-slate-200 bg-slate-50" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-200" />

        <div className="flex items-center gap-1">
          <div className="h-9 w-20 rounded-lg border border-slate-200 bg-slate-50" />
          <div className="hidden h-9 w-9 rounded-lg bg-orange-500/70 sm:block" />
          <div className="hidden h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 sm:block" />
          <div className="hidden h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 sm:block" />
          <div className="h-9 w-16 rounded-lg border border-slate-200 bg-slate-50" />
        </div>
      </div>
    </>
  );
}

export default AdminExhibitors;
