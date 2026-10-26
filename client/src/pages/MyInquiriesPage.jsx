import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  Calendar,
  MapPin,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sparkles,
  User,
  MessageSquare,
  X,
  Building,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SocialBanner from "../components/layout/SocialBanner";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function MyInquiriesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [aggregates, setAggregates] = useState({
    all: 0,
    new: 0,
    accepted: 0,
    booked: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchInquiries = useCallback(
    async (targetPage = page, targetStatus = activeTab, targetSearch = searchQuery) => {
      setLoading(true);
      setError("");
      try {
        const params = {
          page: targetPage,
          limit: 10,
        };
        if (targetStatus && targetStatus !== "all") {
          params.status = targetStatus;
        }
        if (targetSearch?.trim()) {
          params.search = targetSearch.trim();
        }

        const { data } = await api.get("/inquiries/my-inquiries", { params });
        setInquiries(data.inquiries || []);
        if (data.aggregates) {
          setAggregates(data.aggregates);
        }
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error("Failed to load inquiries:", err);
        setError(
          err.response?.data?.message ||
            "Unable to fetch your stall inquiries. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [page, activeTab, searchQuery]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchInquiries(1, activeTab, searchQuery);
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries(1, activeTab, searchQuery);
  };

  const handleTabChange = (status) => {
    setActiveTab(status);
    setPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status, count) => {
    switch (status) {
      case "booked":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-extrabold text-indigo-700 shadow-2xs">
            <span className="text-sm">🎪</span>
            <span>Stall Booked {count ? `(${count})` : ""}</span>
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-700 shadow-2xs">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Request Accepted</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-extrabold text-rose-700 shadow-2xs">
            <XCircle size={13} className="text-rose-600" />
            <span>Declined</span>
          </span>
        );
      case "new":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-extrabold text-amber-700 shadow-2xs">
            <Clock size={13} className="text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#2D3748] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumbs & Title */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs text-orange-400 font-semibold mb-1">
                <Link to="/" className="hover:underline">
                  Home
                </Link>
                <span>/</span>
                <span>Account</span>
                <span>/</span>
                <span>My Inquiries</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl">📋</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  My Stall Inquiries
                </h1>
                <span className="rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 px-2.5 py-0.5 text-xs font-bold">
                  {aggregates.all} Requests
                </span>
              </div>

              <p className="text-xs text-gray-300 mt-1 max-w-2xl">
                Track your stall requests in real time, review organizer feedback, and get in touch with hosts once approved.
              </p>
            </div>

            <button
              onClick={() => fetchInquiries(page, activeTab, searchQuery)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 border border-slate-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:border-slate-500 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {/* All */}
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`rounded-xl p-3.5 text-left transition border ${
                activeTab === "all"
                  ? "bg-white/15 border-orange-400/80 shadow-md ring-2 ring-orange-400/30"
                  : "bg-slate-800/80 border-slate-700 hover:bg-slate-700/60"
              }`}
            >
              <p className="text-[11px] font-semibold text-slate-300">Total Inquiries</p>
              <p className="text-2xl font-black text-white mt-0.5">{aggregates.all}</p>
            </button>

            {/* Pending */}
            <button
              type="button"
              onClick={() => handleTabChange("new")}
              className={`rounded-xl p-3.5 text-left transition border ${
                activeTab === "new"
                  ? "bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/30"
                  : "bg-slate-800/80 border-slate-700 hover:bg-slate-700/60"
              }`}
            >
              <p className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <span>⏳</span> Pending Review
              </p>
              <p className="text-2xl font-black text-amber-400 mt-0.5">{aggregates.new}</p>
            </button>

            {/* Accepted */}
            <button
              type="button"
              onClick={() => handleTabChange("accepted")}
              className={`rounded-xl p-3.5 text-left transition border ${
                activeTab === "accepted"
                  ? "bg-emerald-500/20 border-emerald-400 shadow-md ring-2 ring-emerald-400/30"
                  : "bg-slate-800/80 border-slate-700 hover:bg-slate-700/60"
              }`}
            >
              <p className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                <span>🎉</span> Accepted Leads
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">
                {aggregates.accepted}
              </p>
            </button>

            {/* Booked */}
            <button
              type="button"
              onClick={() => handleTabChange("booked")}
              className={`rounded-xl p-3.5 text-left transition border ${
                activeTab === "booked"
                  ? "bg-indigo-500/20 border-indigo-400 shadow-md ring-2 ring-indigo-400/30"
                  : "bg-slate-800/80 border-slate-700 hover:bg-slate-700/60"
              }`}
            >
              <p className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                <span>🎪</span> Confirmed Bookings
              </p>
              <p className="text-2xl font-black text-indigo-400 mt-0.5">{aggregates.booked}</p>
            </button>

            {/* Declined */}
            <button
              type="button"
              onClick={() => handleTabChange("rejected")}
              className={`rounded-xl p-3.5 text-left transition border col-span-2 sm:col-span-1 ${
                activeTab === "rejected"
                  ? "bg-rose-500/20 border-rose-400 shadow-md ring-2 ring-rose-400/30"
                  : "bg-slate-800/80 border-slate-700 hover:bg-slate-700/60"
              }`}
            >
              <p className="text-[11px] font-semibold text-rose-300 flex items-center gap-1">
                <span>❌</span> Declined
              </p>
              <p className="text-2xl font-black text-rose-400 mt-0.5">{aggregates.rejected}</p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Controls: Search & Tabs */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All", count: aggregates.all },
              { id: "new", label: "Pending", count: aggregates.new, emoji: "⏳" },
              { id: "accepted", label: "Accepted", count: aggregates.accepted, emoji: "✅" },
              { id: "booked", label: "Booked", count: aggregates.booked, emoji: "🎪" },
              { id: "rejected", label: "Declined", count: aggregates.rejected, emoji: "❌" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                }`}
              >
                {tab.emoji && <span>{tab.emoji}</span>}
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-white text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-80 flex-shrink-0"
          >
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event, city, category..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9.5 pr-8 text-xs text-slate-800 transition outline-none hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  fetchInquiries(1, activeTab, "");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchInquiries()}
              className="font-bold underline hover:no-underline text-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs animate-pulse flex flex-col md:flex-row gap-5"
              >
                <div className="w-full md:w-56 h-36 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                  <div className="h-16 bg-slate-100 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && inquiries.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
              🎪
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-800">
              {searchQuery || activeTab !== "all"
                ? "No inquiries found matching criteria"
                : "You haven't inquired about any event stalls yet"}
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500 leading-relaxed">
              {searchQuery || activeTab !== "all"
                ? "Try clearing your search query or switching to another status tab to view your past requests."
                : "Browse upcoming exhibitions, food carnivals, and trade fairs to request booth space and grow your brand."}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {searchQuery || activeTab !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                    fetchInquiries(1, "all", "");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  Clear Filters
                </button>
              ) : null}

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-orange-700 hover:shadow-md active:scale-95"
              >
                <span>Explore Events & Stalls</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* Inquiries Cards List */}
        {!loading && inquiries.length > 0 && (
          <div className="space-y-5">
            {inquiries.map((inquiry) => {
              const event = inquiry.eventId;
              const organizer = inquiry.organizerId;
              const eventId = event?._id || event?.publicId || inquiry.eventId;
              const eventTitle = event?.title || "Event Details";
              const isAccepted = inquiry.status === "accepted";
              const isBooked = inquiry.status === "booked";
              const isRejected = inquiry.status === "rejected";
              const isNew = inquiry.status === "new";

              return (
                <div
                  key={inquiry._id}
                  className={`group relative rounded-2xl border bg-white p-5 shadow-xs transition duration-200 hover:shadow-md ${
                    isBooked
                      ? "border-indigo-200/90 ring-1 ring-indigo-500/10"
                      : isAccepted
                      ? "border-emerald-200/90 ring-1 ring-emerald-500/10"
                      : isRejected
                      ? "border-slate-200/90"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-5 items-start">
                    {/* Event Poster / Visual */}
                    <div className="relative w-full lg:w-60 h-44 rounded-xl overflow-hidden bg-slate-900 shrink-0 shadow-inner">
                      {event?.posterImage ? (
                        <img
                          src={event.posterImage}
                          alt={eventTitle}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 p-4 text-center">
                          <span className="text-3xl">🎪</span>
                          <span className="text-xs font-bold text-slate-300 mt-2 truncate max-w-full">
                            {eventTitle}
                          </span>
                        </div>
                      )}

                      {/* City Badge on poster */}
                      {event?.city && (
                        <div className="absolute top-2.5 left-2.5 z-10 rounded-md bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                          {event.city}
                        </div>
                      )}
                    </div>

                    {/* Middle Column: Event & Inquiry Info */}
                    <div className="flex-1 w-full space-y-3.5">
                      {/* Top Row: Category pill & Live Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-orange-50 border border-orange-200/80 px-2.5 py-1 text-[11px] font-bold text-orange-700">
                            Category: {inquiry.category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Inquired on {formatDate(inquiry.createdAt)}
                          </span>
                        </div>

                        <div>{getStatusBadge(inquiry.status, inquiry.stallsBooked)}</div>
                      </div>

                      {/* Title & Event Details */}
                      <div>
                        <Link
                          to={`/events/details/${eventId}`}
                          className="text-base sm:text-lg font-extrabold text-slate-900 hover:text-orange-600 transition flex items-center gap-1.5 group-hover:text-orange-600"
                        >
                          <span>{eventTitle}</span>
                          <ExternalLink size={13} className="text-slate-400 shrink-0" />
                        </Link>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                          {event?.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="text-orange-500 shrink-0" />
                              <span className="truncate max-w-xs">{event.venue}</span>
                            </div>
                          )}
                          {(event?.startDate || event?.endDate) && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-orange-500 shrink-0" />
                              <span>
                                {formatDate(event.startDate)} - {formatDate(event.endDate)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status-Specific Feedback Banners */}
                      {isBooked && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50/90 p-3.5 text-xs text-indigo-950 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <span className="text-base shrink-0">🎪</span>
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-indigo-900">
                                Stall Confirmed & Booked ({inquiry.stallsBooked || 1} Stall{inquiry.stallsBooked === 1 ? "" : "s"} Reserved)
                              </p>
                              <p className="text-[11px] text-indigo-800 leading-relaxed">
                                Congratulations! Your stall reservation has been confirmed and finalized with the organizer.
                                {inquiry.bookedAt && ` Confirmed on ${formatDate(inquiry.bookedAt)}.`}
                              </p>
                              {inquiry.bookingNotes && (
                                <div className="mt-1.5 rounded-lg bg-white/70 border border-indigo-100 p-2 text-[11px] text-indigo-900">
                                  <strong>Organizer Notes:</strong> {inquiry.bookingNotes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {isAccepted && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-950 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <span className="text-base shrink-0">🎉</span>
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-emerald-900">
                                Stall Request Accepted by Host!
                              </p>
                              <p className="text-[11px] text-emerald-800 leading-relaxed">
                                Great news! The event organizer has approved your stall request for <strong>{inquiry.category}</strong>. You can now connect directly to finalize booth placement and token payment.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {isNew && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                          <span className="text-base shrink-0">⏳</span>
                          <div>
                            <p className="font-bold text-amber-900">Inquiry Under Review</p>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                              The host has received your request and is reviewing vendor categories. You will see an update here once accepted.
                            </p>
                          </div>
                        </div>
                      )}

                      {isRejected && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 flex items-start gap-2.5">
                          <span className="text-base shrink-0">ℹ️</span>
                          <div>
                            <p className="font-bold text-slate-800">Request Declined</p>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              The organizer was unable to accept this stall request for {inquiry.category}. You may re-apply with another category or an updated note.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Direct Organizer Contact Card (Show when Accepted or Booked) */}
                      {(isAccepted || isBooked) && organizer && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {organizer.name ? organizer.name.charAt(0) : "H"}
                            </div>
                            <div className="text-xs">
                              <p className="font-bold text-slate-900">{organizer.name || "Event Organizer"}</p>
                              <p className="text-[11px] text-slate-500">Event Host</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {organizer.phone && (
                              <a
                                href={`tel:${organizer.phone}`}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                              >
                                <Phone size={12} />
                                <span>Call {organizer.phone}</span>
                              </a>
                            )}
                            {organizer.email && (
                              <a
                                href={`mailto:${organizer.email}?subject=Stall%20Booking%20Inquiry%20-%20${encodeURIComponent(
                                  eventTitle
                                )}`}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                              >
                                <Mail size={12} />
                                <span>Email Host</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message preview snippet if provided */}
                      {inquiry.message && (
                        <div className="text-xs text-slate-600 bg-slate-50/60 rounded-lg p-2.5 border border-slate-100 italic">
                          <span className="font-semibold not-italic text-slate-700">Your note: </span>
                          "{inquiry.message}"
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(inquiry)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
                        >
                          <span>View Full Request Details</span>
                          <ChevronRight size={13} />
                        </button>

                        <div className="flex items-center gap-2">
                          {isRejected && (
                            <Link
                              to={`/events/details/${eventId}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-2xs"
                            >
                              <span>Submit Fresh Inquiry</span>
                              <ArrowRight size={12} />
                            </Link>
                          )}

                          <Link
                            to={`/events/details/${eventId}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                          >
                            <span>View Event</span>
                            <ExternalLink size={11} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-xs font-semibold text-slate-600">
            <div>
              Showing page <span className="font-bold text-slate-900">{page}</span> of{" "}
              <span className="font-bold text-slate-900">{pagination.totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const prev = Math.max(1, page - 1);
                  setPage(prev);
                  fetchInquiries(prev, activeTab, searchQuery);
                }}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = Math.min(pagination.totalPages, page + 1);
                  setPage(next);
                  fetchInquiries(next, activeTab, searchQuery);
                }}
                disabled={page >= pagination.totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-lg">
                  📋
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Stall Inquiry Details
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ID: {selectedInquiry._id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Event Card Info */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Target Event
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  {selectedInquiry.eventId?.title || "Event"}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Location</span>
                    <span className="font-semibold text-slate-800">
                      {selectedInquiry.eventId?.city || "TBD"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Current Status</span>
                    {getStatusBadge(selectedInquiry.status, selectedInquiry.stallsBooked)}
                  </div>
                </div>
              </div>

              {/* Inquiry Submission Info */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Submission Summary
                </h5>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      Stall Category
                    </span>
                    <span className="text-sm font-extrabold text-orange-600">
                      {selectedInquiry.category}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      Applied On
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {formatDate(selectedInquiry.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Contact details sent */}
                <div className="rounded-xl border border-slate-100 bg-white p-3.5 text-xs space-y-2 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contact Provided in Inquiry
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Full Name</span>
                      <span className="font-semibold">
                        {selectedInquiry.firstName} {selectedInquiry.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Phone</span>
                      <span className="font-semibold">{selectedInquiry.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] block">Email</span>
                      <span className="font-semibold">{selectedInquiry.email}</span>
                    </div>
                  </div>
                </div>

                {/* Submitted Message */}
                {selectedInquiry.message && (
                  <div className="rounded-xl border border-slate-100 bg-white p-3.5 text-xs space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Exhibitor Note / Requirements
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedInquiry.message}
                    </p>
                  </div>
                )}

                {/* If booked, show booked details */}
                {selectedInquiry.status === "booked" && (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-extrabold text-sm">
                      <span>🎪</span>
                      <span>Booking Finalized</span>
                    </div>
                    <p className="text-indigo-800 text-[11px]">
                      Stalls Reserved: <strong>{selectedInquiry.stallsBooked || 1}</strong>
                    </p>
                    {selectedInquiry.bookingNotes && (
                      <p className="text-indigo-800 text-[11px]">
                        <strong>Notes from Organizer:</strong> {selectedInquiry.bookingNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>

              <Link
                to={`/events/details/${selectedInquiry.eventId?._id || selectedInquiry.eventId}`}
                onClick={() => setSelectedInquiry(null)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
              >
                <span>View Event</span>
                <ExternalLink size={12} />
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

export default MyInquiriesPage;
