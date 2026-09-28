import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SocialBanner from "../components/layout/SocialBanner";
import EventCard from "../components/events/EventCard";
import api from "../services/api";
import { useFavorites } from "../context/FavoritesContext";

function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchFavoriteEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/favorites");
        setFavoriteEvents(data.favorites || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load your favorite events.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteEvents();
  }, []);

  // Filter out any events that were unfavorited in the current session
  const activeEvents = favoriteEvents.filter((event) => {
    const eventId = String(event._id || event.id);
    return favoriteIds.some((id) => String(id) === eventId);
  });

  // Client-side search filtering by event title, venue, or city
  const filteredEvents = activeEvents.filter((e) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (e.title && e.title.toLowerCase().includes(query)) ||
      (e.venue && e.venue.toLowerCase().includes(query)) ||
      (e.city && e.city.toLowerCase().includes(query)) ||
      (e.address && e.address.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans">
      <Navbar />

      {/* Favorites Banner */}
      <div className="bg-[#2D3748] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-orange-400 font-semibold mb-1">
              <Link to="/" className="hover:underline">
                Home
              </Link>
              <span>/</span>
              <span>Account</span>
              <span>/</span>
              <span>Favorites</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl">❤️</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                My Saved Events
              </h1>
              <span className="rounded-full bg-red-500/20 text-red-300 border border-red-400/30 px-2.5 py-0.5 text-xs font-bold">
                {activeEvents.length} Saved
              </span>
            </div>

            <p className="text-xs text-gray-300 mt-1">
              Track and book stall spaces in your bookmarked exhibitions, food
              carnivals & trade fairs
            </p>
          </div>

          <Link
            to="/"
            className="bg-[#F25C05] hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md transition"
          >
            Explore More Events →
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search Bar & Stats */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-extrabold text-gray-800">
              Showing {filteredEvents.length} Saved Event
              {filteredEvents.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search saved events by name, venue, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-semibold space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
            <p className="text-sm">Loading your saved events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-semibold bg-white rounded-xl border border-red-100 p-8">
            {error}
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-4 max-w-lg mx-auto my-6">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl mx-auto">
              ♡
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              No Favorite Events Saved Yet
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
              Browse upcoming exhibitions, flea markets, and lifestyle expos.
              Click the heart icon on any event card to save it here for easy
              reference and booking.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition"
              >
                Browse Upcoming Events
              </Link>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-gray-200 space-y-3">
            <p className="text-sm font-semibold text-gray-600">
              No saved events matched your search query "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              Clear search filter
            </button>
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

export default FavoritesPage;
