import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Tag,
  CheckCircle2,
  Clock3,
  XCircle,
  Users,
  MessageSquare,
  ExternalLink,
  IndianRupee,
  Building2,
  Info,
  Loader2,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";

import { formatScheduleRange } from "../../utils/dateUtils.js";
import api from "../../services/api.js";

function OrganizerEventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusCode, setStatusCode] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");
        setStatusCode(null);
        const { data } = await api.get(`/organizer/events/${eventId}`);
        const e = data.event;
        const startDateObj = e.startDate ? new Date(e.startDate) : null;
        const endDateObj = e.endDate ? new Date(e.endDate) : null;
        const eventDays =
          startDateObj && endDateObj
            ? Math.max(
                1,
                Math.round((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) +
                  1,
              )
            : 1;

        setEvent({
          id: e.publicId || e._id,
          rawId: e._id,
          name: e.title,
          category:
            Array.isArray(e.categories) && e.categories.length > 0
              ? e.categories[0]
              : "General",
          eventType: e.eventType
            ? e.eventType.charAt(0).toUpperCase() + e.eventType.slice(1)
            : "Indoor",
          description: e.description,
          eventDays,
          startDate: e.startDate,
          endDate: e.endDate,
          location: e.address || e.venue || e.city,
          city: e.city,
          address: e.address,
          status: e.approvalStatus
            ? e.approvalStatus.charAt(0).toUpperCase() +
              e.approvalStatus.slice(1)
            : "Approved",
          approvedAt: e.createdAt
            ? new Date(e.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",
          publishedAt: e.createdAt
            ? new Date(e.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",
          facilities: e.facilities || [],
          stallOptions: (e.stallSetup?.options || []).map((opt) => ({
            model: e.stallSetup?.model || "Standard",
            type: opt.stallType,
            priceForEvent: opt.priceForEvent,
            tables: opt.tables,
            chairs: opt.chairs,
          })),
          inquiries: {
            total: 0,
            new: 0,
            contacted: 0,
          },
        });
      } catch (err) {
        console.error("Failed to load organizer event details:", err);
        setStatusCode(err.response?.status || 500);
        setError(
          err.response?.data?.message || "Failed to load event details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const getStatusConfig = (status) => {
    if (status === "Approved") {
      return {
        icon: CheckCircle2,
        label: "Approved",
        classes: "bg-green-50 text-green-700 border-green-200",
      };
    }

    if (status === "Pending") {
      return {
        icon: Clock3,
        label: "Pending Verification",
        classes: "bg-orange-50 text-orange-700 border-orange-200",
      };
    }

    return {
      icon: XCircle,
      label: "Rejected",
      classes: "bg-red-50 text-red-700 border-red-200",
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <Loader2 size={32} className="animate-spin text-orange-500" />
        <p className="mt-3 text-sm font-medium text-slate-500">
          Loading event details...
        </p>
      </div>
    );
  }

  if (error || !event) {
    const isForbidden = statusCode === 403;

    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/organizer/events"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-orange-600"
        >
          <ArrowLeft size={17} />
          Back to My Events
        </Link>

        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              isForbidden ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"
            }`}
          >
            {isForbidden ? <ShieldAlert size={28} /> : <AlertCircle size={28} />}
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            {isForbidden ? "Access Denied" : "Event Not Found"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {isForbidden
              ? "You do not have permission to view this event because it belongs to another organizer."
              : error || "The requested event could not be found."}
          </p>

          <Link
            to="/organizer/events"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
          >
            Return to My Events
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(event.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Back */}
      <Link
        to="/organizer/events"
        className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-orange-600"
      >
        <ArrowLeft size={17} />
        Back to My Events
      </Link>

      {/* Event Header */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Building2 size={26} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {event.name}
                  </h1>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusConfig.classes}`}
                  >
                    <StatusIcon size={14} />
                    {statusConfig.label}
                  </span>
                </div>

                <p className="mt-1.5 text-sm text-slate-500">
                  {event.category} · {event.eventType} Event
                </p>
              </div>
            </div>

            {/* Public Event */}
            {event.status === "Approved" && (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-100"
              >
                <ExternalLink size={16} />
                View Public Event
              </button>
            )}
          </div>
        </div>

        {/* Approved Notice */}
        {event.status === "Approved" && (
          <div className="border-t border-green-100 bg-green-50 px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <div>
                <p className="text-sm font-bold text-green-800">
                  Your event is approved and published.
                </p>

                <p className="mt-0.5 text-xs text-green-700">
                  Approved on {event.approvedAt} and published on{" "}
                  {event.publishedAt}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Left / Main */}
        <div className="space-y-6 xl:col-span-2">
          {/* Event Information */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-900">Event Information</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Basic information submitted for this event
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <InfoItem
                icon={CalendarDays}
                label="Event Dates"
                value={formatScheduleRange(event.startDate, event.endDate)}
              />

              <InfoItem icon={MapPin} label="City" value={event.city} />

              <InfoItem icon={Building2} label="Venue" value={event.location} />

              <InfoItem
                icon={Tag}
                label="Event Category"
                value={event.category}
              />

              <div className="sm:col-span-2">
                <InfoItem icon={MapPin} label="Address" value={event.address} />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-900">Description</h2>
            </div>

            <div className="p-5">
              <p className="text-sm leading-6 text-slate-600">
                {event.description}
              </p>
            </div>
          </section>

          {/* Stall Categories */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-900">Stall Options</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Stall options currently configured for this event
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Stall Model
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Stall Type
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Price ({event.eventDays} Days)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {event.stallOptions.map((stall, index) => (
                    <tr key={`${stall.model}-${stall.type}-${index}`}>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {stall.model}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {stall.type}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-900">
                          <IndianRupee size={14} />
                          {stall.priceForEvent.toLocaleString("en-IN")}
                        </span>

                        <p className="mt-0.5 text-xs text-slate-400">
                          For entire {event.eventDays}-day event
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Facilities */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-900">Facilities</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Facilities available at the event
              </p>
            </div>

            <div className="flex flex-wrap gap-2 p-5">
              {event.facilities.map((facility) => (
                <span
                  key={facility}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  {facility}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Event Status */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-900">Event Status</h2>
            </div>

            <div className="p-5">
              <div
                className={`flex items-center gap-3 rounded-lg border p-4 ${statusConfig.classes}`}
              >
                <StatusIcon size={21} />

                <div>
                  <p className="text-sm font-bold">{statusConfig.label}</p>

                  <p className="mt-0.5 text-xs opacity-80">
                    {event.status === "Approved"
                      ? "Visible on the public website."
                      : event.status === "Pending"
                        ? "Waiting for admin verification."
                        : "Please review the rejection details."}
                  </p>
                </div>
              </div>

              {/* Important business rule */}
              {event.status === "Approved" && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3">
                  <Info size={16} className="mt-0.5 shrink-0 text-slate-400" />

                  <p className="text-xs leading-5 text-slate-500">
                    Approved event information cannot be directly edited.
                    Contact the administrator if changes are required.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Inquiries */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Inquiries</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Exhibitor interest
                  </p>
                </div>

                <MessageSquare size={19} className="text-orange-500" />
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <Users size={21} />
                </div>

                <div>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {event.inquiries.total}
                  </p>

                  <p className="text-xs text-slate-500">Total inquiries</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-orange-50 p-3">
                  <p className="text-lg font-extrabold text-orange-600">
                    {event.inquiries.new}
                  </p>

                  <p className="text-xs font-semibold text-orange-700">New</p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-lg font-extrabold text-slate-700">
                    {event.inquiries.contacted}
                  </p>

                  <p className="text-xs font-semibold text-slate-500">
                    Contacted
                  </p>
                </div>
              </div>

              <Link
                to="/organizer/inquiries"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                <MessageSquare size={16} />
                View Inquiries
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400">{label}</p>

        <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default OrganizerEventDetails;
