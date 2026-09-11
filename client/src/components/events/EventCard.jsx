// client/src/components/events/EventCard.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

import { formatDateTime } from "../../utils/dateUtils.js";

function EventCard({ event }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRoleWarningModal, setShowRoleWarningModal] = useState(false);
  const navigate = useNavigate();
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

    // Direct phone call
    window.location.href = `tel:${event.organizerPhone}`;
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
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-xl"
            >
              {isFavorite ? "❤️" : "♡"}
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
          {event.organizerPhone && (
            <button
              onClick={handleContactOrganizer}
              className="border px-4 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              📞 Call Organizer
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
                onClick={() => setShowRoleWarningModal(false)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition"
              >
                Register as Exhibitor
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventCard;
