import { useEffect, useState } from "react";
import {
  Search,
  MessageSquare,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Phone,
  Mail,
  User,
  Tag,
  CalendarDays,
  MapPin,
  RefreshCw,
  Check,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import api from "../../services/api";

function OrganizerInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Search & Filter
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Aggregates for summary cards
  const [aggregates, setAggregates] = useState({
    all: 0,
    new: 0,
    accepted: 0,
    rejected: 0,
  });

  // Active Inquiry Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // Fetch inquiries from server
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/organizer/inquiries", {
        params: {
          page,
          limit: 10,
          ...(searchTerm ? { search: searchTerm } : {}),
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        },
      });

      setInquiries(data.inquiries || []);

      if (data.pagination) {
        setPagination(data.pagination);
      }

      if (data.aggregates) {
        setAggregates(data.aggregates);
      }
    } catch (err) {
      console.error("Failed to load inquiries:", err);
      setError(err.response?.data?.message || "Failed to load inquiries.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, searchTerm, statusFilter]);

  // Handle status update (accept or reject)
  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      setUpdatingId(inquiryId);
      setActionSuccess("");

      const { data } = await api.patch(
        `/organizer/inquiries/${inquiryId}/status`,
        { status: newStatus },
      );

      // Update in local state
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === inquiryId ? { ...item, status: newStatus } : item,
        ),
      );

      // If open in modal, update modal state too
      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }

      // Update aggregates
      setAggregates((prev) => {
        const copy = { ...prev };
        const oldStatus = inquiries.find((i) => i._id === inquiryId)?.status || "new";
        if (copy[oldStatus] !== undefined && copy[oldStatus] > 0) {
          copy[oldStatus] -= 1;
        }
        if (copy[newStatus] !== undefined) {
          copy[newStatus] += 1;
        }
        return copy;
      });

      setActionSuccess(
        data.message || `Inquiry marked as ${newStatus} successfully.`,
      );

      setTimeout(() => {
        setActionSuccess("");
      }, 3500);
    } catch (err) {
      console.error(`Failed to update inquiry to ${newStatus}:`, err);
      setError(
        err.response?.data?.message || `Failed to update inquiry status.`,
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "accepted") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span>Accepted</span>
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
          <XCircle size={13} className="text-rose-500" />
          <span>Rejected</span>
        </span>
      );
    }
    if (s === "contacted") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
          <MessageSquare size={13} className="text-purple-500" />
          <span>Contacted</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
        <Clock3 size={13} className="text-amber-500" />
        <span>New</span>
      </span>
    );
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Date TBA";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("all");
    setPage(1);
  };

  const hasActiveFilters = searchInput.trim() || statusFilter !== "all";

  const firstItem =
    pagination.total === 0 ? 0 : (page - 1) * pagination.limit + 1;

  const lastItem = Math.min(page * pagination.limit, pagination.total);

  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (page >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header matching AdminEvents */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-orange-500">Exhibitor Management</p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Inquiries
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and manage stall inquiries and booking requests from exhibitors.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInquiries}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Action Success / Error Notifications */}
      {actionSuccess && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess("")}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-600 hover:text-red-800"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Summary Cards Grid matching AdminEvents SummaryCard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={MessageSquare}
          title="Total Inquiries"
          value={aggregates.all}
          description="All inquiries received"
          loading={initialLoading}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />

        <SummaryCard
          icon={Clock3}
          title="New Inquiries"
          value={aggregates.new}
          description="Awaiting your response"
          loading={initialLoading}
          active={statusFilter === "new"}
          onClick={() => setStatusFilter("new")}
        />

        <SummaryCard
          icon={CheckCircle2}
          title="Accepted"
          value={aggregates.accepted}
          description="Approved exhibitors"
          loading={initialLoading}
          active={statusFilter === "accepted"}
          onClick={() => setStatusFilter("accepted")}
        />

        <SummaryCard
          icon={XCircle}
          title="Rejected"
          value={aggregates.rejected}
          description="Declined inquiries"
          loading={initialLoading}
          active={statusFilter === "rejected"}
          onClick={() => setStatusFilter("rejected")}
        />
      </div>

      {/* Main Inquiries Section matching AdminEvents */}
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search + Filters Toolbar */}
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search exhibitors, events, categories..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative w-full lg:w-48">
              <Clock3
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-8 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
              >
                <option value="all">All Inquiries</option>
                <option value="new">New / Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex w-fit items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={15} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading / Empty / Table Content */}
        {loading ? (
          <InquiriesTableSkeleton />
        ) : inquiries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <MessageSquare size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No inquiries found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {hasActiveFilters
                ? "Try changing or clearing your filters."
                : "No stall inquiries have been received yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table matching AdminEvents table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Exhibitor
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Event
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Category
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Date
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((item) => {
                    const fullName = `${item.firstName} ${item.lastName || ""}`.trim();
                    const eventTitle = item.eventId?.title || "Event";
                    const eventCity = item.eventId?.city || "";

                    return (
                      <tr
                        key={item._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* Exhibitor */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                              <User size={19} />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {fullName}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {item.phone} • {item.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Event */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                              {eventTitle}
                            </p>
                            {eventCity && (
                              <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                                <MapPin size={13} className="text-slate-400" />
                                {eventCity}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.category}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDateTime(item.createdAt)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {getStatusBadge(item.status)}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards matching AdminEvents */}
            <div className="divide-y divide-slate-100 md:hidden">
              {inquiries.map((item) => {
                const fullName = `${item.firstName} ${item.lastName || ""}`.trim();
                const eventTitle = item.eventId?.title || "Event";

                return (
                  <div key={item._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                          <User size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {fullName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {eventTitle}
                          </p>
                        </div>
                      </div>

                      {getStatusBadge(item.status)}
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <Phone size={14} />
                        {item.phone}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Tag size={14} />
                        {item.category}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Eye size={15} />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination matching AdminEvents */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {firstItem}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold text-slate-700">
                    {lastItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {pagination.total}
                  </span>
                </p>

                <div className="flex items-center gap-1">
                  {/* Previous */}
                  <button
                    type="button"
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page === 1 || loading}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((pageNumber, index) =>
                    pageNumber === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-sm text-slate-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        disabled={loading}
                        className={`hidden h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition sm:block ${
                          pageNumber === page
                            ? "bg-orange-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page === pagination.totalPages || loading}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedInquiry(null);
          }}
        >
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <MessageSquare size={19} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Inquiry Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Received on {formatDateTime(selectedInquiry.createdAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Status Header Bar */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Current Status
                  </p>
                  <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedInquiry._id, "accepted")}
                    disabled={
                      updatingId === selectedInquiry._id ||
                      selectedInquiry.status === "accepted"
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition shadow-sm disabled:opacity-50"
                  >
                    {updatingId === selectedInquiry._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                    <span>Accept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedInquiry._id, "rejected")}
                    disabled={
                      updatingId === selectedInquiry._id ||
                      selectedInquiry.status === "rejected"
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-3.5 py-2 text-xs font-bold text-white transition shadow-sm disabled:opacity-50"
                  >
                    {updatingId === selectedInquiry._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <X size={13} />
                    )}
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Exhibitor Information */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Exhibitor Contact Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-xl border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-[11px] text-slate-400">Full Name</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedInquiry.firstName} {selectedInquiry.lastName || ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">Gender</p>
                    <p className="font-bold text-slate-800 text-sm capitalize mt-0.5">
                      {selectedInquiry.gender || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">Mobile Number</p>
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="font-bold text-orange-600 hover:underline text-sm mt-0.5 flex items-center gap-1.5"
                    >
                      <Phone size={13} />
                      <span>{selectedInquiry.phone}</span>
                    </a>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">Email Address</p>
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="font-bold text-orange-600 hover:underline text-sm mt-0.5 flex items-center gap-1.5 truncate"
                    >
                      <Mail size={13} />
                      <span className="truncate">{selectedInquiry.email}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Event & Stall Category */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Event & Category Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-xl border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-[11px] text-slate-400">Event Title</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedInquiry.eventId?.title || "Event Listing"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">Stall / Product Category</p>
                    <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 border border-orange-200/60 px-2.5 py-1 text-xs font-bold text-orange-800 mt-1">
                      <Tag size={12} className="text-orange-600" />
                      <span>{selectedInquiry.category}</span>
                    </span>
                  </div>

                  {selectedInquiry.eventId?.city && (
                    <div>
                      <p className="text-[11px] text-slate-400">Location</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{selectedInquiry.eventId.city}</span>
                      </p>
                    </div>
                  )}

                  {selectedInquiry.eventId?.startDate && (
                    <div>
                      <p className="text-[11px] text-slate-400">Event Dates</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                        <CalendarDays size={13} className="text-slate-400" />
                        <span>{formatDateTime(selectedInquiry.eventId.startDate)}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Inquiry Message */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Message from Exhibitor
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs sm:text-sm text-slate-700 leading-relaxed min-h-[80px]">
                  {selectedInquiry.message ? (
                    <p className="whitespace-pre-wrap">{selectedInquiry.message}</p>
                  ) : (
                    <p className="italic text-slate-400">No custom message was provided.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-lg border border-slate-200 bg-white hover:bg-slate-100 px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, title, value, description, loading, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
        active ? "border-orange-500 ring-2 ring-orange-500/20" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          {loading ? (
            <div className="mt-2 h-9 w-20 animate-pulse rounded-lg bg-slate-200" />
          ) : (
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
          )}
        </div>

        <div className="rounded-lg bg-orange-50 p-2.5 text-orange-500">
          <Icon size={21} />
        </div>
      </div>

      {loading ? (
        <div className="mt-3 h-3.5 w-32 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-3 text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}

function InquiriesTableSkeleton() {
  return (
    <div className="space-y-4 p-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-16 w-full animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
  );
}

export default OrganizerInquiries;
