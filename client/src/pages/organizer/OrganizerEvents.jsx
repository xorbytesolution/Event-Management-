import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  CalendarDays,
  MapPin,
  Eye,
  Clock3,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const [{ data }] = await Promise.all([
          api.get("/organizer/events"),
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]);
        const mapped = (data.events || []).map((e) => {
          const startDateStr = e.startDate
            ? new Date(e.startDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Date TBA";

          return {
            id: e.publicId || e._id,
            name: e.title,
            date: startDateStr,
            location: e.city || "India",
            category:
              Array.isArray(e.categories) && e.categories.length > 0
                ? e.categories[0]
                : "General",
            status: (() => {
              const s = (e.approvalStatus || "").toLowerCase();
              if (s === "pending" || s === "under_review") return "Pending";
              if (s === "rejected") return "Rejected";
              return "Approved";
            })(),
          };
        });
        setEvents(mapped);
      } catch (err) {
        console.error("Failed to load organizer events:", err);
        setError(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const search = searchTerm.trim().toLowerCase();
      const name = (event.name || "").toLowerCase();
      const location = (event.location || "").toLowerCase();
      const category = (event.category || "").toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        location.includes(search) ||
        category.includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        (event.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  const getStatusClasses = (status) => {
    if (status === "Approved") {
      return "bg-green-50 text-green-700 border-green-100";
    }

    if (status === "Pending") {
      return "bg-orange-50 text-orange-700 border-orange-100";
    }

    return "bg-red-50 text-red-700 border-red-100";
  };

  const getStatusIcon = (status) => {
    if (status === "Approved") {
      return <CheckCircle2 size={14} />;
    }

    if (status === "Pending") {
      return <Clock3 size={14} />;
    }

    return <XCircle size={14} />;
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-7">
        <p className="text-sm font-bold text-orange-500">Event Management</p>

        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          My Events
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage and monitor all the events submitted under your organization.
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter("All")}
          className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${
            statusFilter === "All"
              ? "border-orange-300 ring-2 ring-orange-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            All Events
          </p>

          {loading ? (
            <div className="mt-2 h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {events.length}
            </p>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("Approved")}
          className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${
            statusFilter === "Approved"
              ? "border-green-300 ring-2 ring-green-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Approved
          </p>

          {loading ? (
            <div className="mt-2 h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {events.filter((event) => event.status === "Approved").length}
            </p>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("Pending")}
          className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${
            statusFilter === "Pending"
              ? "border-orange-300 ring-2 ring-orange-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Pending
          </p>

          {loading ? (
            <div className="mt-2 h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {events.filter((event) => event.status === "Pending").length}
            </p>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("Rejected")}
          className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${
            statusFilter === "Rejected"
              ? "border-red-300 ring-2 ring-red-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Rejected
          </p>

          {loading ? (
            <div className="mt-2 h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {events.filter((event) => event.status === "Rejected").length}
            </p>
          )}
        </button>
      </div>

      {/* Events Section */}
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search / Filter Header */}
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search events, cities or categories..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={17} className="text-slate-400" />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-orange-500"
              >
                <option value="All">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <OrganizerEventsTableSkeleton />
        ) : error ? (
          <div className="p-10 text-center">
            <AlertCircle size={32} className="mx-auto text-red-500" />
            <p className="mt-3 text-sm font-bold text-slate-900">{error}</p>
            <p className="mt-1 text-xs text-slate-500">
              Please check your connection or try again later.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Event
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Date
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Location
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                            <CalendarDays size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {event.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {event.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {event.date}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin size={15} />
                          {event.location}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClasses(
                            event.status,
                          )}`}
                        >
                          {getStatusIcon(event.status)}
                          {event.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/organizer/events/${event.id}`}
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
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                        <CalendarDays size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {event.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {event.category}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold ${getStatusClasses(
                        event.status,
                      )}`}
                    >
                      {getStatusIcon(event.status)}
                      {event.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {event.date}
                      </p>

                      <p className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {event.location}
                      </p>
                    </div>

                    <Link
                      to={`/organizer/events/${event.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Eye size={15} />
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredEvents.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <CalendarDays size={22} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  No events found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or status filter.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function OrganizerEventsTableSkeleton() {
  return (
    <>
      {/* Desktop Table Skeleton */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px]">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Event
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Location
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { titleW: "w-52", catW: "w-28", locW: "w-24" },
              { titleW: "w-64", catW: "w-36", locW: "w-20" },
              { titleW: "w-44", catW: "w-24", locW: "w-28" },
              { titleW: "w-56", catW: "w-32", locW: "w-24" },
              { titleW: "w-48", catW: "w-28", locW: "w-20" },
            ].map((row, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50/80">
                      <CalendarDays size={19} className="text-orange-200" />
                    </div>
                    <div className="space-y-1.5">
                      <div
                        className={`h-4 rounded-md bg-slate-200 ${row.titleW}`}
                      />
                      <div
                        className={`h-3 rounded bg-slate-100 ${row.catW}`}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="h-3.5 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-300" />
                    <div className={`h-3.5 rounded bg-slate-200 ${row.locW}`} />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="h-6 w-20 rounded-full border border-emerald-100/60 bg-emerald-50" />
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="ml-auto h-8 w-16 rounded-lg border border-slate-200 bg-slate-50" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="divide-y divide-slate-100 md:hidden">
        {[1, 2, 3].map((item) => (
          <div key={item} className="p-4 animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50/80">
                  <CalendarDays size={19} className="text-orange-200" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 w-44 rounded-md bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
              </div>
              <div className="h-5 w-16 rounded-full border border-emerald-100/60 bg-emerald-50" />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-slate-100" />
                <div className="h-3 w-20 rounded bg-slate-100" />
              </div>
              <div className="h-8 w-16 rounded-lg border border-slate-200 bg-slate-50" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default OrganizerEvents;
