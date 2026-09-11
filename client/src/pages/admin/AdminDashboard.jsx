import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  Store,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatDateTime } from "../../utils/dateUtils";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [{ data }] = await Promise.all([
          api.get("/admin/dashboard"),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);

        setDashboard(data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-bold text-red-700">
            Unable to load dashboard
          </p>

          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Events",
      value: dashboard.stats.totalEvents,
      icon: CalendarDays,
      description: "All events in the system",
    },
    {
      title: "Published Events",
      value: dashboard.stats.publishedEvents,
      icon: CheckCircle2,
      description: "Currently live on platform",
    },
    {
      title: "Pending Reviews",
      value: dashboard.stats.pendingReviews,
      icon: Clock3,
      description: "Awaiting admin review",
    },
    {
      title: "Total Exhibitors",
      value: dashboard.stats.totalExhibitors,
      icon: Store,
      description: "Active exhibitor accounts",
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-bold text-orange-500">Admin Dashboard</p>

        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, Administrator
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's an overview of events, submissions, and exhibitors.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {stat.value}
                  </p>
                </div>

                <div className="rounded-lg bg-orange-50 p-2.5 text-orange-500">
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Recent Submissions */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Recent Submissions</h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Latest events submitted for review
              </p>
            </div>

            <Link
              to="/admin/event-submissions"
              className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {dashboard.recentSubmissions.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No event submissions yet.
              </div>
            ) : (
              dashboard.recentSubmissions.map((submission) => (
                <div
                  key={submission._id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {submission.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {submission.organizerName} · {submission.city}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      submission.status === "under_review"
                        ? "bg-blue-50 text-blue-700"
                        : submission.status === "approved"
                          ? "bg-green-50 text-green-700"
                          : submission.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {submission.status.replace("_", " ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Published Events */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Published Events
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Latest events available on the platform
              </p>
            </div>

            <Link
              to="/admin/events"
              className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {dashboard.recentEvents.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No published events yet.
              </div>
            ) : (
              dashboard.recentEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {event.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {event.startDate
                        ? formatDateTime(event.startDate)
                        : "Date unavailable"}{" "}
                      · {event.city}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                    Published
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  const statPlaceholders = [
    { title: "Total Events", icon: CalendarDays },
    { title: "Published Events", icon: CheckCircle2 },
    { title: "Pending Reviews", icon: Clock3 },
    { title: "Total Exhibitors", icon: Store },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-bold text-orange-500">Admin Dashboard</p>

        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, Administrator
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's an overview of events, submissions, and exhibitors.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statPlaceholders.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {stat.title}
                  </p>

                  <div className="mt-2 h-9 w-16 animate-pulse rounded-lg bg-slate-200" />
                </div>

                <div className="rounded-lg bg-orange-50 p-2.5 text-orange-500">
                  <Icon size={21} />
                </div>
              </div>

              <div className="mt-3 h-3.5 w-32 animate-pulse rounded bg-slate-100" />
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Recent Submissions Skeleton */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Recent Submissions</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Latest events submitted for review
              </p>
            </div>

            <span className="flex items-center gap-1 text-xs font-bold text-orange-600">
              View all
              <ArrowRight size={14} />
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              { titleW: "w-56", subW: "w-36" },
              { titleW: "w-64", subW: "w-28" },
              { titleW: "w-52", subW: "w-40" },
            ].map((row, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 px-5 py-4 animate-pulse"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className={`h-4 rounded-md bg-slate-200 ${row.titleW}`} />
                  <div className={`h-3 rounded bg-slate-100 ${row.subW}`} />
                </div>

                <div className="h-6 w-16 shrink-0 rounded-full bg-orange-50 border border-orange-100/60" />
              </div>
            ))}
          </div>
        </section>

        {/* Recent Published Events Skeleton */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Published Events
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Latest events available on the platform
              </p>
            </div>

            <span className="flex items-center gap-1 text-xs font-bold text-orange-600">
              View all
              <ArrowRight size={14} />
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              { titleW: "w-64", subW: "w-44" },
              { titleW: "w-48", subW: "w-40" },
              { titleW: "w-56", subW: "w-36" },
            ].map((row, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 px-5 py-4 animate-pulse"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className={`h-4 rounded-md bg-slate-200 ${row.titleW}`} />
                  <div className={`h-3 rounded bg-slate-100 ${row.subW}`} />
                </div>

                <div className="h-6 w-18 shrink-0 rounded-full bg-emerald-50 border border-emerald-100/60" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
