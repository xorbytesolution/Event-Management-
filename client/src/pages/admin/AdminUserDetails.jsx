import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
  CheckCircle2,
  XCircle,
  User,
  ShieldCheck,
  Tag,
  Building2,
  MapPin,
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react";
import api from "../../services/api";
import { formatScheduleRange } from "../../utils/dateUtils";

function AdminUserDetails() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/admin/users/${userId}`);
        setData(res.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load user profile details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatLabel = (value) => {
    if (!value) return "—";
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-12 w-80 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
        <div className="h-48 animate-pulse rounded-2xl bg-white border border-slate-200" />
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Users
        </Link>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-base font-bold text-red-700">Unable to load user</p>
          <p className="mt-1 text-sm text-red-600">{error || "User not found"}</p>
        </div>
      </div>
    );
  }

  const { user, exhibitorProfile, organizerProfile, events = [], submissions = [] } = data;

  const isExhibitor = user.roles?.includes("exhibitor");
  const isOrganizer = user.roles?.includes("organizer");
  const isDualRole = isExhibitor && isOrganizer;
  const isActive = user.accountStatus === "active";

  const getDynamicSubtitle = () => {
    if (isDualRole) return "Exhibitor & Event Organizer (Dual-Role Account)";
    if (isOrganizer) return "Event Organizer Account";
    if (isExhibitor) return "Exhibitor Account";
    return "Platform User";
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Users
        </Link>

        {/* Profile Header */}
        <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-100 font-black text-orange-600 text-xl shadow-xs">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.name?.[0]?.toUpperCase() || "U"
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
                  User Profile
                </span>
                {isDualRole && (
                  <span className="rounded-full bg-purple-100 border border-purple-200/80 px-2 py-0.5 text-[10px] font-extrabold text-purple-700">
                    Dual-Role
                  </span>
                )}
              </div>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {user.name}
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {getDynamicSubtitle()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-red-50 text-red-700 border border-red-200/60"
              }`}
            >
              {isActive ? "Active Account" : formatLabel(user.accountStatus)}
            </span>

            {user.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/80 px-3 py-1.5 text-xs font-bold text-blue-700">
                <CheckCircle2 size={14} />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* SECTION 1: ACCOUNT INFORMATION */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <h2 className="font-bold text-slate-900">Account Information</h2>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem icon={User} label="Full Name" value={user.name} />
            <InfoItem icon={Mail} label="Email Address" value={user.email} />
            <InfoItem icon={Phone} label="Phone Number" value={user.phone} />
            <InfoItem
              icon={User}
              label="Gender"
              value={formatLabel(user.gender)}
            />
            <InfoItem
              icon={CalendarDays}
              label="Registered On"
              value={formatDate(user.createdAt)}
            />

            {/* Roles info with badges */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Active Roles
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {isExhibitor && (
                  <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-bold text-blue-700">
                    Exhibitor
                  </span>
                )}
                {isOrganizer && (
                  <span className="rounded-md bg-orange-50 border border-orange-200 px-2 py-0.5 text-xs font-bold text-orange-700">
                    Organizer
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: EXHIBITOR PROFILE (If Exhibitor role) */}
        {isExhibitor && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-blue-50/40 px-6 py-4">
              <div className="flex items-center gap-2">
                <Tag size={17} className="text-blue-600" />
                <h2 className="font-bold text-slate-900">Exhibitor Profile</h2>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                Stall Exhibitor
              </span>
            </div>

            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Business Categories
              </p>

              {exhibitorProfile?.categories?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {exhibitorProfile.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No business categories registered yet.
                </p>
              )}
            </div>
          </section>
        )}

        {/* SECTION 3: ORGANIZER PROFILE & HOSTED EVENTS (If Organizer role) */}
        {isOrganizer && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-orange-50/40 px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-orange-600" />
                <h2 className="font-bold text-slate-900">
                  Organizer Profile & Hosted Events
                </h2>
              </div>
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-800">
                {events.length} Published {events.length === 1 ? "Event" : "Events"}
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Events Listing */}
              {events.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Published Live Events
                  </p>

                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
                    {events.map((ev) => (
                      <div
                        key={ev._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-50/70 transition"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                              Live
                            </span>
                            <span className="font-mono text-xs text-slate-400">
                              {ev.publicId}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 truncate">
                            {ev.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {ev.city} · {ev.venue} ·{" "}
                            {formatScheduleRange(ev.startDate, ev.endDate)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="text-xs text-slate-500 font-medium">
                            {ev.availableStalls} / {ev.totalStalls} stalls
                          </span>
                          <Link
                            to={`/admin/events/${ev._id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-orange-50 hover:text-orange-600 transition"
                          >
                            <span>Manage Event</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    No published events yet.
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Events will show here once submitted and approved.
                  </p>
                </div>
              )}

              {/* Event Submissions (if any pending/rejected) */}
              {submissions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Submission History
                  </p>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
                    {submissions.map((sub) => (
                      <div
                        key={sub._id}
                        className="flex items-center justify-between gap-4 p-3.5 hover:bg-slate-50/70 transition"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {sub.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {sub.city} · Submitted {formatDate(sub.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                              sub.status === "approved"
                                ? "bg-emerald-50 text-emerald-700"
                                : sub.status === "rejected"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {sub.status}
                          </span>

                          <Link
                            to={`/admin/event-submissions/${sub._id}`}
                            className="text-xs font-bold text-orange-600 hover:underline"
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 border border-slate-100">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-800 truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default AdminUserDetails;
