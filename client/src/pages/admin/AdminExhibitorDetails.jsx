import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  Store,
  CircleCheck,
  CircleX,
} from "lucide-react";
import api from "../../services/api";

function AdminExhibitorDetails() {
  const { exhibitorId } = useParams();

  const [exhibitor, setExhibitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExhibitor = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(`/admin/exhibitors/${exhibitorId}`);

        setExhibitor(data.exhibitor);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load exhibitor details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadExhibitor();
  }, [exhibitorId]);

  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

        <div className="mt-5 h-9 w-80 animate-pulse rounded bg-slate-200" />

        <div className="mt-6 h-96 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link
          to="/admin/exhibitors"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Exhibitors
        </Link>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-bold text-red-700">
            Unable to load exhibitor
          </p>

          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const user = exhibitor.userId;

  const isActive = user.accountStatus === "active";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/exhibitors"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Exhibitors
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-orange-500">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={25} />
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
                Exhibitor Profile
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {user.name}
              </h1>

              <p className="mt-1 text-sm text-slate-500">Exhibitor account</p>
            </div>
          </div>

          <div
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
              isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {isActive ? "Active Account" : user.accountStatus}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Account Information</h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem icon={User} label="Full Name" value={user.name} />

            <InfoItem icon={Mail} label="Email" value={user.email} />

            <InfoItem icon={Phone} label="Phone" value={user.phone} />

            <InfoItem
              icon={User}
              label="Gender"
              value={formatLabel(user.gender)}
            />

            <InfoItem
              icon={ShieldCheck}
              label={user.roles?.length > 1 ? "Roles" : "Role"}
              value={
                user.roles
                  ? user.roles.map(formatLabel).join(", ")
                  : formatLabel(user.role)
              }
            />

            <InfoItem
              icon={CalendarDays}
              label="Registered"
              value={formatDate(user.createdAt)}
            />
          </div>
        </section>

        {/* Verification & Status */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Account Status</h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            <StatusCard
              icon={user.isVerified ? CircleCheck : CircleX}
              title="Verification"
              value={user.isVerified ? "Verified" : "Not Verified"}
              positive={user.isVerified}
            />

            <StatusCard
              icon={isActive ? CircleCheck : CircleX}
              title="Account"
              value={isActive ? "Active" : formatLabel(user.accountStatus)}
              positive={isActive}
            />
          </div>
        </section>

        {/* Categories */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Business Categories</h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Categories selected by this exhibitor
            </p>
          </div>

          <div className="p-5">
            {exhibitor.categories?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {exhibitor.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700"
                  >
                    <Store size={13} />
                    {category}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No categories provided.</p>
            )}
          </div>
        </section>

        {/* Profile Information */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Profile Information</h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            <InfoItem
              icon={CalendarDays}
              label="Profile Created"
              value={formatDate(exhibitor.createdAt)}
            />

            <InfoItem
              icon={CalendarDays}
              label="Last Updated"
              value={formatDate(exhibitor.updatedAt)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <Icon size={15} />
        {label}
      </div>

      <p className="mt-1.5 text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function StatusCard({ icon: Icon, title, value, positive }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
      </div>

      <Icon
        size={22}
        className={positive ? "text-green-600" : "text-slate-400"}
      />
    </div>
  );
}

function formatLabel(value) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default AdminExhibitorDetails;
