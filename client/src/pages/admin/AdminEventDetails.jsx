import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  User,
  Phone,
  Mail,
  Building2,
  Users,
  Store,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";
import { formatScheduleRange } from "../../utils/dateUtils";

function AdminEventDetails() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(`/admin/events/${eventId}`);

        setEvent(data.event);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load event details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const formatDate = (value) => {
    if (!value) return "Not provided";

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

        <div className="mt-4 h-9 w-80 animate-pulse rounded bg-slate-200" />

        <div className="mt-6 h-96 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Events
        </Link>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-bold text-red-700">Unable to load event</p>

          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Events
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Published Event
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {event.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Event ID: {event.publicId}
            </p>
          </div>

          <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
            Published
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Event Overview */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Event Information</h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={CalendarDays}
              label="Event Dates"
              value={formatScheduleRange(event.startDate, event.endDate)}
            />

            <InfoItem
              icon={Building2}
              label="Event Type"
              value={event.eventType}
            />

            <InfoItem icon={MapPin} label="City" value={event.city} />

            <InfoItem icon={Building2} label="Venue" value={event.address} />

            <InfoItem
              icon={Building2}
              label="Venue Type"
              value={event.venueType}
            />

            <InfoItem
              icon={Users}
              label="Expected Visitors"
              value={event.expectedVisitors || "Not provided"}
            />
          </div>
        </section>

        {/* Organizer */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Organizer Information</h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-3">
            <InfoItem icon={User} label="Name" value={event.organizerName} />

            <InfoItem icon={Phone} label="Phone" value={event.organizerPhone} />

            <InfoItem icon={Mail} label="Email" value={event.organizerEmail} />
          </div>
        </section>

        {/* Description */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Event Description</h2>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Description
              </p>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                {event.description || "No description provided."}
              </p>
            </div>

            {event.highlights && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Highlights
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                  {event.highlights}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Categories & Facilities */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Categories & Facilities
            </h2>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-2">
            <TagGroup title="Categories" items={event.categories} />

            <TagGroup title="Facilities" items={event.facilities} />
          </div>
        </section>

        {/* Stall Information */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Stall Information</h2>
          </div>

          <div className="p-5">
            <div className="mb-5 grid gap-4 sm:grid-cols-3">
              <InfoItem
                icon={Store}
                label="Stall Model"
                value={event.stallSetup?.model || "Not provided"}
              />

              <InfoItem
                icon={Store}
                label="Total Stalls"
                value={event.totalStalls}
              />

              <InfoItem
                icon={Store}
                label="Available Stalls"
                value={event.availableStalls}
              />
            </div>

            {event.stallSetup?.options?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-3 py-3 font-bold">Stall Type</th>

                      <th className="px-3 py-3 font-bold">Tables</th>

                      <th className="px-3 py-3 font-bold">Chairs</th>

                      <th className="px-3 py-3 font-bold">Event Price</th>

                      <th className="px-3 py-3 font-bold">Daily Price</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {event.stallSetup.options.map((option, index) => (
                      <tr key={`${option.stallType}-${index}`}>
                        <td className="px-3 py-3 font-semibold text-slate-900">
                          {option.stallType}
                        </td>

                        <td className="px-3 py-3 text-slate-600">
                          {option.tables}
                        </td>

                        <td className="px-3 py-3 text-slate-600">
                          {option.chairs}
                        </td>

                        <td className="px-3 py-3 text-slate-600">
                          ₹{option.priceForEvent}
                        </td>

                        <td className="px-3 py-3 text-slate-600">
                          {option.pricePerDay ? `₹${option.pricePerDay}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Images */}
        {(event.posterImage || event.floorPlanImage) && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-900">Event Images</h2>
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-2">
              {event.posterImage && (
                <ImagePreview title="Poster" src={event.posterImage} />
              )}

              {event.floorPlanImage && (
                <ImagePreview title="Floor Plan" src={event.floorPlanImage} />
              )}
            </div>
          </section>
        )}

        {/* Publication Information */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Publication Information
            </h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-3">
            <InfoItem
              icon={CheckCircle2Icon}
              label="Approval Status"
              value={event.approvalStatus}
            />

            <InfoItem
              icon={CalendarDays}
              label="Created"
              value={formatDate(event.createdAt)}
            />

            <InfoItem
              icon={CalendarDays}
              label="Last Updated"
              value={formatDate(event.updatedAt)}
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

      <p className="mt-1.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function TagGroup({ title, items = [] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {items?.length > 0 ? (
          items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700"
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-400">None provided</span>
        )}
      </div>
    </div>
  );
}

function ImagePreview({ title, src }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <ImageIcon size={17} className="text-slate-400" />

        <p className="text-sm font-bold text-slate-700">{title}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <img
          src={src}
          alt={title}
          className="max-h-[500px] w-full object-contain"
        />
      </div>
    </div>
  );
}

function CheckCircle2Icon(props) {
  return (
    <svg
      {...props}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export default AdminEventDetails;
