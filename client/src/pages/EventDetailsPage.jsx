import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SocialBanner from "../components/layout/SocialBanner";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDateTime, formatScheduleRange } from "../utils/dateUtils.js";

function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRoleWarningModal, setShowRoleWarningModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEventDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/events/${eventId}`);
        setEvent(data.event);
      } catch (err) {
        setError(
          err.response?.data?.message || "Event details could not be found.",
        );
      } finally {
        setLoading(false);
      }
    };
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const handleContactOrganizer = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Please log in as an exhibitor to contact event organizers.",
        },
      });
      return;
    }

    const isExhibitor = user?.roles?.includes("exhibitor");
    if (!isExhibitor) {
      setShowRoleWarningModal(true);
      return;
    }

    setShowContactModal(true);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
            <p className="text-sm font-bold text-gray-600">
              Loading event details...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-4">
            <div className="text-4xl">🔍</div>
            <h2 className="text-xl font-bold text-gray-900">
              {error || "Event Not Found"}
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              The event you are looking for might have ended or is not yet
              published.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition"
              >
                <span>←</span>
                <span>Back to Homepage</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format Dates
  const startDateObj = event.startDate ? new Date(event.startDate) : null;
  const formattedDate =
    formatScheduleRange(event.startDate, event.endDate) ||
    event.date ||
    "Dates to be announced";

  // Normalize pricing options
  const pricingOptions = event.stallSetup?.options?.length
    ? event.stallSetup.options.map((opt) => ({
        daysLabel: opt.pricePerDay ? "Per Day" : "Full Event",
        price: `₹${(opt.priceForEvent || opt.pricePerDay || 0).toLocaleString("en-IN")}/-`,
        tables: opt.tables || 0,
        chairs: opt.chairs || 0,
        stallType: opt.stallType,
      }))
    : event.pricingOptions || [];

  const displayId = event.publicId || event._id || event.id;
  const venueAddress =
    event.address || event.venue || "Venue address available upon request";
  const cityDisplay = event.city
    ? event.city.charAt(0).toUpperCase() + event.city.slice(1)
    : "";

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans">
      <Navbar />

      {/* Back Button Strip */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() =>
              navigate(event.city ? `/events/${event.city.toLowerCase()}` : "/")
            }
            className="inline-flex items-center space-x-2 bg-[#00A65A] hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2 rounded-lg shadow-sm transition"
          >
            <span>←</span>
            <span>View All {cityDisplay} Events</span>
          </button>
          <span className="text-xs text-gray-500 font-semibold">
            ID: {displayId}
          </span>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Poster & Organizer CTAs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Poster Graphics */}
            <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-br from-amber-800 via-yellow-700 to-amber-950 p-6 flex flex-col justify-between min-h-[380px] shadow-lg border border-amber-900/30">
              {event.posterImage && (
                <img
                  src={event.posterImage}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
              )}
              <div className="flex justify-between items-start z-10">
                <span className="bg-black/60 text-cyan-300 font-mono text-xs px-2.5 py-1 rounded border border-cyan-400/30">
                  ID: {displayId}
                </span>
                {startDateObj && (
                  <div className="bg-red-800 text-yellow-300 border-2 border-dashed border-yellow-400 rounded-full w-14 h-14 flex flex-col items-center justify-center text-[10px] font-black leading-tight shadow-md">
                    <span>{startDateObj.getDate()}</span>
                    <span>
                      {startDateObj.toLocaleString("en-IN", { month: "short" })}
                    </span>
                    <span>{startDateObj.getFullYear()}</span>
                  </div>
                )}
              </div>

              <div className="text-center my-6 z-10 space-y-2">
                <span className="text-yellow-300 text-xs font-black tracking-widest uppercase">
                  {event.eventType
                    ? `${event.eventType.toUpperCase()} EVENT`
                    : "EXHIBITION"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-yellow-300 tracking-tight drop-shadow-md">
                  {event.title}
                </h2>
                <p className="text-xs font-bold text-amber-200">
                  {venueAddress}
                </p>
              </div>

              {/* Poster WhatsApp Banner Footer */}
              <div className="z-10 bg-amber-950/90 border border-yellow-500/40 rounded-lg p-2.5 flex items-center justify-between text-white text-[10px]">
                <div>
                  <span className="text-amber-300 font-bold block">
                    Event Stalls & Bookings
                  </span>
                  <span>Direct Organizer Contact</span>
                </div>
                {event.organizerPhone && (
                  <div className="text-right">
                    <span className="block text-gray-300">
                      Press the button
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleContactOrganizer}
                className="w-full bg-[#F25C05] hover:bg-orange-600 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition transform active:scale-95 text-center"
              >
                Contact Event Organizer
              </button>
            </div>

            {/* Info Box: Type, Verified, Footfall */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-600">Event Type:</span>
                <span className="font-bold text-gray-800 capitalize">
                  {event.eventType || "Exhibition"}
                </span>
              </div>

              {event.venueType && (
                <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-600">
                    Venue Type:
                  </span>
                  <span className="font-bold text-gray-800">
                    {event.venueType}
                  </span>
                </div>
              )}

              {event.expectedVisitors && (
                <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-600">
                    Expected Visitors:
                  </span>
                  <span className="font-bold text-gray-800">
                    {event.expectedVisitors}
                  </span>
                </div>
              )}

              {event.organizerName && (
                <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-600">
                    Organizer:
                  </span>
                  <span className="font-bold text-gray-800">
                    {event.organizerName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Event Specs & Pricing Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title & Metadata */}
            <div>
              <span className="text-xs font-extrabold text-orange-500 tracking-wider">
                ID : {displayId}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 leading-snug">
                {event.title}
              </h1>

              <div className="mt-3 flex flex-wrap justify-between items-center text-sm font-semibold text-gray-800">
                <span>🗓️ {formattedDate}</span>
                {cityDisplay && (
                  <span className="text-gray-500 text-xs">
                    📍 {cityDisplay}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-2 font-medium">
                {venueAddress}
              </p>

              {event.description && (
                <p className="text-xs text-gray-700 mt-3 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {event.description}
                </p>
              )}
            </div>

            {/* Stall Count & Inclusions Breakdown */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                {/* Stall Availability Counter Box */}
                <div className="border border-gray-400 rounded-md overflow-hidden text-center shadow-2xs">
                  <div className="bg-white px-4 py-1.5 text-xs font-semibold text-gray-700">
                    <span className="text-lg font-extrabold text-gray-900 mr-1">
                      {event.availableStalls ?? 0}
                    </span>
                    Stalls Available
                  </div>
                  <div className="bg-gray-500 text-white text-xs font-bold px-4 py-1">
                    {event.totalStalls ?? 0} Total Stalls
                  </div>
                </div>

                {/* Pricing Breakdown Cards */}
                <div className="flex flex-wrap gap-4">
                  {pricingOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-300 rounded-xl overflow-hidden bg-gray-50/60 min-w-[150px] shadow-2xs"
                    >
                      <div className="bg-gray-100 px-3 py-1.5 text-xs text-center border-b border-gray-200">
                        {opt.daysLabel} -{" "}
                        <span className="font-extrabold text-orange-600">
                          {opt.price}
                        </span>
                      </div>
                      <div className="p-3 text-xs space-y-1 text-gray-700 font-medium">
                        <div className="flex items-center space-x-1 text-orange-600 font-semibold">
                          <span>✓</span>
                          <span>Tables - {opt.tables}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-orange-600 font-semibold">
                          <span>✓</span>
                          <span>Chairs - {opt.chairs}</span>
                        </div>
                        <div className="pt-2 text-[11px] font-bold text-orange-600 border-t border-gray-200 mt-1">
                          {opt.stallType}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories Section */}
            {event.categories && event.categories.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="inline-block border border-orange-500 text-orange-600 font-bold text-xs px-3 py-1 rounded-md">
                  Categories
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {event.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-gray-300 text-gray-700 text-xs font-medium px-3 py-1 rounded-full shadow-2xs hover:border-orange-400 transition cursor-default"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities Section */}
            {event.facilities && event.facilities.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="inline-block border border-orange-500 text-orange-600 font-bold text-xs px-3 py-1 rounded-md">
                  Facilities
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-1">
                  {event.facilities.map((fac, idx) => {
                    let icon = "⚙️";
                    if (fac.toLowerCase().includes("water")) icon = "💧";
                    if (fac.toLowerCase().includes("parking")) icon = "🚗";
                    if (
                      fac.toLowerCase().includes("power") ||
                      fac.toLowerCase().includes("light")
                    )
                      icon = "⚡";
                    if (fac.toLowerCase().includes("toilet")) icon = "🚻";
                    if (fac.toLowerCase().includes("ac")) icon = "❄️";

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center space-y-1"
                      >
                        <span className="text-2xl">{icon}</span>
                        <span className="text-xs font-semibold text-gray-700">
                          {fac}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Contact Modal Overlay */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-800">
                Contact Event Organizer
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Connect directly with the organizer for stall booking and
              sponsorships:
            </p>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl space-y-2 text-center">
              <span className="text-xs font-semibold text-gray-500 block">
                {event.organizerName
                  ? `Organizer: ${event.organizerName}`
                  : "Organizer Contact"}
              </span>
              {event.organizerPhone ? (
                <a
                  href={`tel:${event.organizerPhone}`}
                  className="text-xl font-extrabold text-orange-600 hover:underline block"
                >
                  +91 {event.organizerPhone}
                </a>
              ) : (
                <span className="text-sm font-bold text-gray-700">
                  Contact details unavailable
                </span>
              )}
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowContactModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Warning Modal (for non-exhibitors like organizers) */}
      {showRoleWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 text-xl font-bold">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Exhibitor Access Required
                  </h3>
                  <p className="text-xs text-amber-700 font-medium">
                    Stall inquiry restricted
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRoleWarningModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-gray-700 space-y-2">
              <p className="font-semibold text-gray-800">
                Only registered exhibitors can contact event organizers for
                stall bookings.
              </p>
              <p className="text-gray-600">
                You are currently logged in as an{" "}
                <span className="font-bold text-gray-900">Organizer</span>. To
                inquire about stalls and contact organizers, please register or
                add an exhibitor profile to your account.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowRoleWarningModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs transition"
              >
                Cancel
              </button>
              <Link
                to="/registration"
                onClick={() => setShowRoleWarningModal(false)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition"
              >
                Register as Exhibitor
              </Link>
            </div>
          </div>
        </div>
      )}

      <SocialBanner />
      <Footer />
    </div>
  );
}

export default EventDetailsPage;
