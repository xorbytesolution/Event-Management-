// client/src/pages/CityEventsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SocialBanner from "../components/layout/SocialBanner";
import EventCard from "../components/events/EventCard";
import api from "../services/api"; // Centralized Axios instance

function CityEventsPage() {
  const { cityName } = useParams();
  const normalizedCity = (cityName || "hyderabad").toLowerCase();
  const cityDisplayName = cityName ? cityName.charAt(0).toUpperCase() + cityName.slice(1) : "Hyderabad";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCityEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(
          `/events?city=${encodeURIComponent(normalizedCity)}`,
        );
        setEvents(data.events || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load events for this city.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCityEvents();
  }, [normalizedCity]);

  // Client-side search filter over real DB fields
  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.address &&
        e.address.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans">
      <Navbar />

      {/* City Title Banner */}
      <div className="bg-[#2D3748] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-orange-400 font-semibold mb-1">
              <Link to="/" className="hover:underline">
                Home
              </Link>
              <span>/</span>
              <span>Cities</span>
              <span>/</span>
              <span className="capitalize">{cityDisplayName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Exhibitions & Events in{" "}
              <span className="text-orange-500 capitalize">
                {cityDisplayName}
              </span>
            </h1>
            <p className="text-xs text-gray-300 mt-1">
              Discover verified stalls, food carnivals & lifestyle exhibitions available for booking
            </p>
          </div>

          <Link
            to="/create-event"
            className="bg-[#F25C05] hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md transition"
          >
            + List Event in {cityDisplayName}
          </Link>
        </div>
      </div>

      {/* Main Content List Container */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search Bar & Stats */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-extrabold text-gray-800">
              Showing {filteredEvents.length} Verified Event{filteredEvents.length === 1 ? "" : "s"} in {cityDisplayName}
            </span>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by event name or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-semibold space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
            <p className="text-sm">Loading verified events in {cityDisplayName}...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-semibold">
            {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 space-y-4">
            <div className="text-4xl">🎪</div>
            <h3 className="text-xl font-bold text-gray-800">
              No active events listed for {cityDisplayName} right now
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Be the first organizer to host an exhibition or fair here!
            </p>
            <Link
              to="/create-event"
              className="inline-block bg-[#F25C05] hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition"
            >
              + Host an Event in {cityDisplayName}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((evt) => (
              <EventCard key={evt._id || evt.publicId} event={evt} />
            ))}
          </div>
        )}
      </main>

      <SocialBanner />
      <Footer />
    </div>
  );
}

export default CityEventsPage;
