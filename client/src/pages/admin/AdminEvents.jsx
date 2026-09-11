import { useEffect, useState } from "react";
import {
  Search,
  CalendarDays,
  MapPin,
  Eye,
  Store,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatDateTime } from "../../utils/dateUtils.js";

const CITIES = [
  "Hyderabad",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Pune",
  "Noida",
  "Jaipur",
  "Lucknow",
  "Kolkata",
  "Gurgaon",
  "Ahmedabad",
  "Chandigarh",
  "Rajasthan",
  "Akola",
  "Ghaziabad",
  "Ranchi",
  "Ludhiana",
  "Kochi",
  "Indore",
  "Surat",
  "Bhopal",
  "Coimbatore",
  "Visakhapatnam",
];

function AdminEvents() {
  const [events, setEvents] = useState([]);

  // What the user is currently typing
  const [searchInput, setSearchInput] = useState("");

  // Search value actually sent to the backend
  const [searchTerm, setSearchTerm] = useState("");

  // City filter
  const [city, setCity] = useState("");

  // Event timing filter
  const [dateFilter, setDateFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [aggregates, setAggregates] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    availableStalls: 0,
  });

  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const [{ data }] = await Promise.all([
        api.get("/admin/events", {
          params: {
            page,
            limit: 10,
            ...(searchTerm ? { search: searchTerm } : {}),
            ...(city.trim() ? { city: city.trim() } : {}),
            ...(dateFilter !== "all" ? { date: dateFilter } : {}),
          },
        }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      setEvents(data.events);

      setAggregates(
        data.aggregates || {
          totalEvents: 0,
          upcomingEvents: 0,
          availableStalls: 0,
        },
      );

      setPagination(
        data.pagination || {
          page,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load events.",
      );
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  /*
   * Debounce search.
   *
   * The API is not called on every keystroke.
   * We wait 400ms after the user stops typing.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /*
   * Reset pagination whenever a filter changes.
   *
   * This prevents situations like:
   * User is on page 3 -> applies a filter -> page 3 has no results.
   */
  useEffect(() => {
    setPage(1);
  }, [city, dateFilter]);

  /*
   * Load events whenever:
   * - page changes
   * - debounced search changes
   * - city changes
   * - date filter changes
   */
  useEffect(() => {
    loadEvents();
  }, [page, searchTerm, city, dateFilter]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /*
   * These two values are based on the events currently
   * loaded on the page.
   *
   * Total Events comes from the backend pagination total.
   */

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

  const clearFilters = () => {
    setCity("");
    setDateFilter("all");
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  const hasActiveFilters =
    searchInput.trim() || city.trim() || dateFilter !== "all";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-orange-500">Event Management</p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Events
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and manage all published events on the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEvents}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          icon={CalendarDays}
          title="Total Events"
          value={aggregates.totalEvents}
          description={
            searchTerm || city || dateFilter !== "all"
              ? "Events matching your filters"
              : "Published events"
          }
          loading={initialLoading}
        />

        <SummaryCard
          icon={CheckCircle2}
          title="Upcoming Events"
          value={aggregates.upcomingEvents}
          description="Upcoming events"
          loading={initialLoading}
        />

        <SummaryCard
          icon={Store}
          title="Available Stalls"
          value={aggregates.availableStalls}
          description="Across published events"
          loading={initialLoading}
        />
      </div>

      {/* Events Section */}
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search + Filters */}
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search events, cities, organizers..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
              />
            </div>

            {/* City Filter */}
            <div className="relative w-full lg:w-52">
              <MapPin
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-8 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
              >
                <option value="">City</option>
                {CITIES.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Timing Filter */}
            <div className="relative w-full lg:w-48">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-8 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="past">Past</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex w-fit items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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
              onClick={loadEvents}
              className="shrink-0 font-bold text-red-700 underline underline-offset-2 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <EventsTableSkeleton />
        ) : events.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <CalendarDays size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No events found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {hasActiveFilters
                ? "Try changing or clearing your filters."
                : "No published events are available yet."}
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
                      Event
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Organizer
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Date
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Location
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Stalls
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => (
                    <tr
                      key={event._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                            <CalendarDays size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {event.title}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {event.categories?.slice(0, 2).join(", ")}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {event.organizerName}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDateTime(event.startDate)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin size={15} />
                          {event.city}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {event.availableStalls} / {event.totalStalls}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/events/${event._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Eye size={15} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {events.map((event) => (
                <div key={event._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                        <CalendarDays size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {event.title}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {event.organizerName}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[11px] font-bold text-green-700">
                      Published
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {formatDateTime(event.startDate)}
                    </p>

                    <p className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {event.city}
                    </p>

                    <p className="flex items-center gap-1.5">
                      <Store size={14} />
                      {event.availableStalls} of {event.totalStalls} stalls
                      available
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/admin/events/${event._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Eye size={15} />
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
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

const SKELETON_ROWS = [
  { titleWidth: "w-36", catWidth: "w-28", orgWidth: "w-20", locWidth: "w-16", stallsWidth: "w-12" },
  { titleWidth: "w-24", catWidth: "w-40", orgWidth: "w-14", locWidth: "w-14", stallsWidth: "w-12" },
  { titleWidth: "w-44", catWidth: "w-24", orgWidth: "w-16", locWidth: "w-20", stallsWidth: "w-12" },
  { titleWidth: "w-56", catWidth: "w-44", orgWidth: "w-24", locWidth: "w-16", stallsWidth: "w-12" },
  { titleWidth: "w-48", catWidth: "w-48", orgWidth: "w-20", locWidth: "w-20", stallsWidth: "w-12" },
  { titleWidth: "w-52", catWidth: "w-32", orgWidth: "w-20", locWidth: "w-14", stallsWidth: "w-10" },
  { titleWidth: "w-44", catWidth: "w-36", orgWidth: "w-20", locWidth: "w-16", stallsWidth: "w-12" },
  { titleWidth: "w-60", catWidth: "w-44", orgWidth: "w-24", locWidth: "w-16", stallsWidth: "w-12" },
  { titleWidth: "w-56", catWidth: "w-32", orgWidth: "w-20", locWidth: "w-16", stallsWidth: "w-10" },
  { titleWidth: "w-48", catWidth: "w-36", orgWidth: "w-20", locWidth: "w-18", stallsWidth: "w-10" },
];

function EventsTableSkeleton() {
  return (
    <>
      {/* Desktop Table Skeleton */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Event
              </th>

              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Organizer
              </th>

              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Date
              </th>

              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Location
              </th>

              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Stalls
              </th>

              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {SKELETON_ROWS.map((row, index) => (
              <tr key={index} className="animate-pulse">
                {/* Event */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50/80 text-orange-300">
                      <CalendarDays size={19} className="opacity-40" />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className={`h-4 rounded-md bg-slate-200 ${row.titleWidth}`} />
                      <div className={`h-3 rounded bg-slate-100 ${row.catWidth}`} />
                    </div>
                  </div>
                </td>

                {/* Organizer */}
                <td className="px-5 py-4">
                  <div className={`h-4 rounded bg-slate-200 ${row.orgWidth}`} />
                </td>

                {/* Date */}
                <td className="px-5 py-4">
                  <div className="h-4 w-36 rounded bg-slate-200" />
                </td>

                {/* Location */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin size={15} />
                    <div className={`h-4 rounded bg-slate-200 ${row.locWidth}`} />
                  </div>
                </td>

                {/* Stalls */}
                <td className="px-5 py-4">
                  <div className={`h-4 rounded bg-slate-200 ${row.stallsWidth}`} />
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-300">
                  <CalendarDays size={19} className="opacity-40" />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <div className="h-4 w-36 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
              </div>

              <div className="h-5 w-16 rounded-full bg-slate-100" />
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CalendarDays size={14} />
                <div className="h-3.5 w-32 rounded bg-slate-100" />
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin size={14} />
                <div className="h-3.5 w-20 rounded bg-slate-100" />
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <Store size={14} />
                <div className="h-3.5 w-36 rounded bg-slate-100" />
              </div>
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

export default AdminEvents;
