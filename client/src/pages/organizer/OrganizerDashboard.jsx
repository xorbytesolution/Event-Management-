import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const [{ data }] = await Promise.all([
          api.get("/organizer/events"),
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]);
        setEvents(data.events || []);
      } catch (err) {
        console.error("Failed to load organizer dashboard events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <OrganizerDashboardSkeleton user={user} />;
  }

  const totalCount = events.length;
  const approvedCount = events.filter(
    (e) => (e.approvalStatus || "").toLowerCase() === "approved",
  ).length;
  const pendingCount = events.filter(
    (e) => (e.approvalStatus || "").toLowerCase() === "pending",
  ).length;

  const stats = [
    {
      title: "Total Events",
      value: loading ? "..." : String(totalCount),
      icon: CalendarDays,
      description: "All submitted events",
    },
    {
      title: "Approved Events",
      value: loading ? "..." : String(approvedCount),
      icon: CheckCircle2,
      description: "Currently published",
    },
    {
      title: "Pending Events",
      value: loading ? "..." : String(pendingCount),
      icon: Clock3,
      description: "Awaiting verification",
    },
    {
      title: "New Inquiries",
      value: "0",
      icon: MessageSquare,
      description: "From exhibitors",
    },
  ];

  const recentEvents = events.slice(0, 5).map((e) => ({
    id: e.publicId || e._id,
    name: e.title,
    date: e.startDate
      ? new Date(e.startDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Date TBA",
    location: e.city || "India",
    status: e.approvalStatus
      ? e.approvalStatus.charAt(0).toUpperCase() + e.approvalStatus.slice(1)
      : "Approved",
  }));

  const recentInquiries = [
    {
      name: "Rahul Sharma",
      event: "Fashion Expo 2026",
      message: "Interested in a Gold stall.",
      date: "Today",
    },
    {
      name: "ABC Traders",
      event: "Fashion Expo 2026",
      message: "Please share stall availability.",
      date: "Yesterday",
    },
    {
      name: "XYZ Decor",
      event: "Home & Decor Expo",
      message: "Interested in participating.",
      date: "2 days ago",
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-bold text-orange-500">Organizer Dashboard</p>

        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {user?.name || "Organizer"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's an overview of your events and exhibitor inquiries.
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
        {/* Recent Events */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Recent Events</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Your latest event activity
              </p>
            </div>

            <Link
              to="/organizer/events"
              className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentEvents.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-slate-400">
                No events found under your account.
              </div>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id || event.name}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {event.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {event.date} · {event.location}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      event.status === "Approved"
                        ? "bg-green-50 text-green-700"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Inquiries */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Recent Inquiries</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Latest exhibitor messages
              </p>
            </div>

            <Link
              to="/organizer/inquiries"
              className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentInquiries.map((inquiry) => (
              <div key={inquiry.name} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {inquiry.name}
                    </p>

                    <p className="mt-0.5 text-xs font-semibold text-orange-600">
                      {inquiry.event}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-slate-400">
                    {inquiry.date}
                  </span>
                </div>

                <p className="mt-2 truncate text-xs text-slate-500">
                  {inquiry.message}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function OrganizerDashboardSkeleton({ user }) {
  const statPlaceholders = [
    { title: "Total Events", icon: CalendarDays },
    { title: "Approved Events", icon: CheckCircle2 },
    { title: "Pending Events", icon: Clock3 },
    { title: "New Inquiries", icon: MessageSquare },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-bold text-orange-500">Organizer Dashboard</p>

        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {user?.name || "Organizer"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's an overview of your events and exhibitor inquiries.
        </p>
      </div>

      {/* Stats Skeleton */}
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

      {/* Main Grid Skeleton */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Recent Events Skeleton */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Recent Events</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Your latest event activity
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
              { titleW: "w-48", subW: "w-40" },
              { titleW: "w-60", subW: "w-32" },
            ].map((row, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 px-5 py-4 animate-pulse"
              >
                <div className="min-w-0 space-y-1.5">
                  <div
                    className={`h-4 rounded-md bg-slate-200 ${row.titleW}`}
                  />
                  <div className={`h-3 rounded bg-slate-100 ${row.subW}`} />
                </div>

                <div className="h-6 w-20 shrink-0 rounded-full border border-emerald-100/60 bg-emerald-50" />
              </div>
            ))}
          </div>
        </section>

        {/* Recent Inquiries Skeleton */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Recent Inquiries</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Latest exhibitor messages
              </p>
            </div>

            <span className="flex items-center gap-1 text-xs font-bold text-orange-600">
              View all
              <ArrowRight size={14} />
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              { nameW: "w-28", eventW: "w-36", msgW: "w-52" },
              { nameW: "w-32", eventW: "w-40", msgW: "w-48" },
              { nameW: "w-24", eventW: "w-32", msgW: "w-44" },
            ].map((row, index) => (
              <div key={index} className="px-5 py-4 animate-pulse">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <div
                      className={`h-4 rounded-md bg-slate-200 ${row.nameW}`}
                    />
                    <div
                      className={`h-3 rounded bg-orange-100/60 ${row.eventW}`}
                    />
                  </div>

                  <div className="h-3 w-12 rounded bg-slate-100" />
                </div>

                <div
                  className={`mt-2.5 h-3 rounded bg-slate-100 ${row.msgW}`}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
