import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import ContactOrganizerModal from "./ContactOrganizerModal.jsx";
import api from "../../services/api.js";

import { formatDateTime } from "../../utils/dateUtils.js";

function EventCard({ event }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRoleWarningModal, setShowRoleWarningModal] = useState(false);
  const [inquiryData, setInquiryData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Normalize ID and Location
  const eventId = event.publicId || event._id || event.id;
  const venue = event.address || event.venue || "Venue details to be updated";

  // Format Dates
  const startDateStr = event.startDate
    ? formatDateTime(event.startDate)
    : event.date || "Upcoming";

  // Normalize Pricing Options from DB stallSetup
  const pricingList = event.stallSetup?.options?.length
    ? event.stallSetup.options.map((opt) => ({
        daysLabel: opt.pricePerDay ? "Per Day" : "Full Event",
        price: `₹${(opt.priceForEvent || opt.pricePerDay || 0).toLocaleString("en-IN")}/-`,
        stallType: opt.stallType,
        tables: opt.tables,
        chairs: opt.chairs,
      }))
    : event.pricingOptions || [];

  // Check if current logged-in user is the organizer of this event
  const isHostOrganizer =
    user &&
    event &&
    Boolean(
      (event.organizerId &&
        String(event.organizerId?._id || event.organizerId) ===
          String(user._id || user.id)) ||
        (event.organizerEmail &&
          event.organizerEmail.toLowerCase() === user.email?.toLowerCase()) ||
        (event.organizerPhone && event.organizerPhone === user.phone),
    );

  // Check if current user has an active inquiry for this event
  useEffect(() => {
    const checkInquiry = async () => {
      const eventIdentifier = event?._id || event?.publicId || eventId;
      if (
        isAuthenticated &&
        user?.roles?.includes("exhibitor") &&
        !isHostOrganizer &&
        eventIdentifier
      ) {
        try {
          const { data } = await api.get(`/inquiries/check/${eventIdentifier}`);
          setInquiryData(data);
        } catch (err) {
          console.debug("Inquiry check in EventCard:", err);
        }
      } else {
        setInquiryData(null);
      }
    };
    if (event) {
      checkInquiry();
    }
  }, [event, eventId, isAuthenticated, user, isHostOrganizer]);

  const handleContactOrganizer = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location.pathname + location.search,
          message: "Please log in as an exhibitor to contact event organizers.",
        },
      });
      return;
    }

    if (isHostOrganizer) {
      navigate(`/organizer/events/${eventId}`);
      return;
    }

    const isExhibitor = user?.roles?.includes("exhibitor");
    if (!isExhibitor) {
      setShowRoleWarningModal(true);
      return;
    }

    setShowContactModal(true);
  };


  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs hover:shadow-md transition p-4 flex flex-col md:flex-row gap-6 items-start">
      {/* Poster Image / Gradient Visual */}
      <div className="relative w-full md:w-80 h-56 rounded-xl overflow-hidden bg-gradient-to-br from-amber-800 via-yellow-700 to-amber-950 flex-shrink-0 flex flex-col justify-between p-4 shadow-inner">
        {event.posterImage ? (
          <img
            src={event.posterImage}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="text-center my-auto z-10">
            <h3 className="text-2xl font-black text-yellow-300 tracking-tight drop-shadow-md">
              {event.eventType ? event.eventType.toUpperCase() : "EXPO"}
            </h3>
          </div>
        )}
        {/* Real-time Exhibitor Inquiry Status Pill */}
        {inquiryData?.hasInquiry && (
          <div className="absolute top-2.5 left-2.5 z-20">
            {inquiryData.status === "booked" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md">
                🎪 Stall Booked ({inquiryData?.inquiry?.stallsBooked || 1})
              </span>
            ) : inquiryData.status === "accepted" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md">
                ✅ Inquired: Approved
              </span>
            ) : inquiryData.status === "new" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md">
                ⏳ Inquired: Pending
              </span>
            ) : inquiryData.status === "rejected" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md">
                ❌ Inquired: Declined
              </span>
            ) : null}
          </div>
        )}

        <div className="z-10 bg-amber-950/80 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg text-center truncate">
          {venue}
        </div>
      </div>

      {/* Overview & Pricing */}
      <div className="flex-1 w-full flex flex-col justify-between space-y-4">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold text-orange-500">
              ID : {eventId}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(event._id || eventId, navigate, location.pathname);
              }}
              className="p-1 rounded-full text-xl transition-transform active:scale-125 hover:opacity-80 focus:outline-hidden"
              aria-label={isFavorite(event._id || eventId) ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite(event._id || eventId) ? "❤️" : "♡"}
            </button>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mt-1">
            {event.title}
          </h3>
          <p className="text-sm font-bold text-gray-900 mt-1">{startDateStr}</p>
        </div>

        {/* Stalls & Pricing */}
        <div className="flex flex-wrap items-center gap-4 py-2 border-t border-b border-gray-100">
          <div className="border border-gray-400 rounded-md overflow-hidden text-center">
            <div className="bg-white px-3 py-1 text-xs font-semibold text-gray-700">
              <span className="text-base font-extrabold text-gray-900 mr-1">
                {event.availableStalls ?? 0}
              </span>
              Available
            </div>
            <div className="bg-gray-500 text-white text-xs font-bold px-3 py-1">
              {event.totalStalls ?? 0} Total Stalls
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {pricingList.slice(0, 3).map((opt, idx) => (
              <div
                key={idx}
                className="border border-gray-300 rounded-md bg-gray-50/50 text-center min-w-[120px] p-1.5 text-xs"
              >
                <div className="text-orange-600 font-extrabold">
                  {opt.price}
                </div>
                <div className="text-gray-600 font-semibold">
                  {opt.stallType}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end items-center space-x-3 pt-1">
          {isHostOrganizer ? (
            <Link
              to={`/organizer/events/${eventId}`}
              className="inline-flex items-center gap-1.5 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-2xs"
              title="You are hosting this event. Manage stalls and inquiries in your Organizer Portal."
            >
              <span>👑 Your Event</span>
              <span className="text-[10px] text-purple-500 font-semibold">
                (Manage)
              </span>
            </Link>
          ) : inquiryData?.hasInquiry && inquiryData?.status === "new" ? (
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center gap-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-2xs"
              title="Inquiry is pending review. Click to view details."
            >
              <span>⏳</span>
              <span>Pending Review</span>
            </button>
          ) : inquiryData?.hasInquiry && inquiryData?.status === "booked" ? (
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center gap-1.5 border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-2xs"
              title="Stall booking is confirmed! Click to view details."
            >
              <span>🎪</span>
              <span>Stall Booked ({inquiryData?.inquiry?.stallsBooked || 1})</span>
            </button>
          ) : inquiryData?.hasInquiry && inquiryData?.status === "accepted" ? (
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-2xs"
              title="Stall inquiry accepted! Click to view details."
            >
              <span>✅</span>
              <span>Stall Accepted!</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContactOrganizer}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                inquiryData?.status === "rejected"
                  ? "border border-orange-300 bg-orange-50/50 hover:bg-orange-100 text-orange-700 hover:border-orange-500 shadow-2xs"
                  : "border border-slate-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 hover:bg-orange-50/50"
              }`}
            >
              {inquiryData?.status === "rejected"
                ? "Submit Fresh Inquiry"
                : "📞 Contact Organizer"}
            </button>
          )}

          <Link
            to={`/events/details/${eventId}`}
            className="bg-orange-600 text-white font-extrabold px-5 py-2 rounded-lg text-xs shadow-md"
          >
            + More Details
          </Link>
        </div>
      </div>


      {/* Role Warning Modal (for non-exhibitors like organizers) */}
      {showRoleWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-amber-200 animate-in fade-in zoom-in-95 duration-200 text-left">
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
                Only registered exhibitors can contact event organizers for stall bookings.
              </p>
              <p className="text-gray-600">
                You are currently logged in as an <span className="font-bold text-gray-900">Organizer</span>. To inquire about stalls and contact organizers, please register or add an exhibitor profile to your account.
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
                state={{ from: location.pathname + location.search }}
                onClick={() => setShowRoleWarningModal(false)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition"
              >
                Register as Exhibitor
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Contact Organizer Inquiry Modal */}
      <ContactOrganizerModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        event={event}
        inquiryInfo={inquiryData}
        onInquirySuccess={(updated) => {
          setInquiryData(updated);
        }}
      />

    </div>
  );
}

export default EventCard;

