import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  UserPlus,
  Building2,
  Sparkles,
  X,
  KeyRound,
} from "lucide-react";
import api from "../services/api";
import { formatScheduleRange } from "../utils/dateUtils";

function AdminEventSubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states & selected submission
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [organizerAccountInfo, setOrganizerAccountInfo] = useState(null);
  const [accountInfoLoading, setAccountInfoLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Approval outcome modal state
  const [approvalResult, setApprovalResult] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [showPassword, setShowPassword] = useState(true);

  // Floating Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [{ data }] = await Promise.all([
        api.get(
          `/admin/event-submissions?status=${status}&page=${page}&limit=10`,
        ),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);

      setSubmissions(data.submissions);

      setPagination(
        data.pagination || {
          page,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load event submissions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status, page]);

  const handleOpenApprove = async (sub) => {
    setSelectedSubmission(sub);
    setApprovalNotes(sub.adminNotes || "");
    setModalError("");
    setOrganizerAccountInfo(null);
    setShowApprovalModal(true);

    try {
      setAccountInfoLoading(true);
      const { data } = await api.get(`/admin/event-submissions/${sub._id}`);
      setOrganizerAccountInfo(data.organizerAccountInfo || null);
    } catch {
      setOrganizerAccountInfo({ accountType: "new_user" });
    } finally {
      setAccountInfoLoading(false);
    }
  };

  const handleOpenReject = (sub) => {
    setSelectedSubmission(sub);
    setRejectNotes(sub.adminNotes || "");
    setModalError("");
    setShowRejectModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedSubmission) return;

    try {
      setActionLoading(true);
      setModalError("");

      const { data } = await api.post(
        `/admin/event-submissions/${selectedSubmission._id}/approve`,
        {
          adminNotes: approvalNotes.trim() || undefined,
        },
      );

      // Update submissions list in place
      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === selectedSubmission._id
            ? {
                ...item,
                status: "approved",
                adminNotes: approvalNotes.trim() || item.adminNotes,
                publishedEventId: data.event?._id,
              }
            : item,
        ),
      );

      setShowApprovalModal(false);
      setApprovalResult(data);
      showToast("Event approved and published successfully!", "success");
    } catch (requestError) {
      setModalError(
        requestError.response?.data?.message ||
          "Failed to approve and publish event.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedSubmission) return;
    if (!rejectNotes.trim()) {
      setModalError("Please provide a reason for rejection.");
      return;
    }

    try {
      setActionLoading(true);
      setModalError("");

      await api.patch(`/admin/event-submissions/${selectedSubmission._id}`, {
        action: "rejected",
        adminNotes: rejectNotes.trim(),
      });

      // Update submissions list in place
      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === selectedSubmission._id
            ? {
                ...item,
                status: "rejected",
                adminNotes: rejectNotes.trim(),
              }
            : item,
        ),
      );

      setShowRejectModal(false);
      showToast("Event submission rejected.", "error");
    } catch (requestError) {
      setModalError(
        requestError.response?.data?.message ||
          "Failed to reject the submission.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = async (text, fieldName) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      console.error("Failed to copy text");
    }
  };

  const handleCopyAllCredentials = () => {
    if (!approvalResult?.credentials) return;
    const { email, temporaryPassword } = approvalResult.credentials;
    const loginUrl = `${window.location.origin}/login`;
    const text = [
      `Organizer Login Credentials`,
      `----------------------------`,
      `Login URL: ${loginUrl}`,
      `Email: ${email}`,
      `Temporary Password: ${temporaryPassword}`,
      ``,
      `Please log in and update your password at earliest convenience.`,
    ].join("\n");

    handleCopy(text, "all");
  };

  const formatStatus = (value) => {
    return value.replace("_", " ");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Event Submissions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review submitted events before making them visible to the public.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              aria-label="Filter submissions by status"
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All submissions</option>
            </select>

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />

              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={load}
              className="shrink-0 font-bold text-red-700 underline underline-offset-2 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <SubmissionsSkeleton />
        ) : submissions.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              No submissions found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              There are no event submissions matching the selected status.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {submissions.map((item) => (
                <article
                  key={item._id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">
                    {/* Submission Information */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                            item.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : item.status === "rejected"
                                ? "bg-red-50 text-red-700 border border-red-200/60"
                                : item.status === "under_review"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                  : "bg-orange-50 text-orange-700 border border-orange-200/60"
                          }`}
                        >
                          {formatStatus(item.status)}
                        </span>
                      </div>

                      <h2 className="mt-2 text-lg font-bold text-slate-900">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-600">
                        {item.city} · {item.venue}
                      </p>

                      <div className="mt-4 space-y-1">
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Organizer:</span>{" "}
                          {item.organizerName} · {item.organizerPhone}
                        </p>

                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Schedule:</span>{" "}
                          {formatScheduleRange(item.startDate, item.endDate)}
                        </p>

                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Stalls:</span>{" "}
                          {item.availableStalls} available of {item.totalStalls}
                        </p>

                        {item.status === "rejected" && item.adminNotes && (
                          <div className="mt-2 rounded-lg border border-red-100 bg-red-50/70 p-2 text-xs text-red-800">
                            <span className="font-bold">Rejection reason:</span> {item.adminNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap items-start gap-2 lg:justify-end">
                      <Link
                        to={`/admin/event-submissions/${item._id}`}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        View Details
                      </Link>

                      {item.status === "approved" && item.publishedEventId && (
                        <Link
                          to={`/admin/events/${item.publishedEventId}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <span>Published Event</span>
                          <ExternalLink size={14} />
                        </Link>
                      )}

                      {["pending", "under_review"].includes(item.status) && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenReject(item)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenApprove(item)}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 shadow-xs"
                          >
                            Approve & publish
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(page - 1) * pagination.limit + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(page * pagination.limit, pagination.total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {pagination.total}
                  </span>
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page === 1 || loading}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
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
                  ))}

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
      </div>

      {/* ========================================================================= */}
      {/* 1. APPROVAL CONFIRMATION MODAL WITH DYNAMIC ACCOUNT RECOGNITION */}
      {/* ========================================================================= */}
      {showApprovalModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Approve & Publish Event
                  </h3>
                  <p className="text-xs text-slate-500">
                    Public event creation and organizer provisioning
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !actionLoading && setShowApprovalModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Event Reference Card */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Event
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedSubmission.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                  <span>
                    Organizer: <strong>{selectedSubmission.organizerName}</strong>
                  </span>
                  <span>
                    Email: <strong>{selectedSubmission.organizerEmail}</strong>
                  </span>
                </div>
              </div>

              {/* Dynamic Account Recognition Banner */}
              {accountInfoLoading ? (
                <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ) : (
                <>
                  {organizerAccountInfo?.accountType === "new_user" && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                        <UserPlus size={15} className="text-blue-600" />
                        <span>New Organizer Account Detected</span>
                      </div>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        This is a <strong>brand new organizer</strong>. No registered account was found for <span className="font-mono">{selectedSubmission.organizerEmail}</span>. Approving will create a new Organizer account and generate secure temporary login credentials.
                      </p>
                    </div>
                  )}

                  {organizerAccountInfo?.accountType === "existing_exhibitor" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                        <UserCheck size={15} className="text-amber-600" />
                        <span>Existing Exhibitor Account Detected</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        This user is already registered as an <strong>Exhibitor</strong> (<span className="font-mono">{selectedSubmission.organizerEmail}</span>). Approving will add <strong>Organizer</strong> privileges to their existing account. They will keep their existing password.
                      </p>
                    </div>
                  )}

                  {organizerAccountInfo?.accountType === "existing_organizer" && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                        <Building2 size={15} className="text-emerald-600" />
                        <span>Existing Organizer Account Detected</span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        This user already has an active <strong>Organizer</strong> account (<span className="font-mono">{selectedSubmission.organizerEmail}</span>). Approving will publish this event directly to their existing Organizer dashboard.
                      </p>
                    </div>
                  )}

                  {(organizerAccountInfo?.accountType === "admin_conflict" ||
                    organizerAccountInfo?.accountType === "split_conflict") && (
                    <div className="rounded-xl border border-red-200 bg-red-50/90 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-red-900 font-bold text-xs">
                        <AlertTriangle size={15} className="text-red-600" />
                        <span>Account Conflict Detected</span>
                      </div>
                      <p className="text-xs text-red-800 leading-relaxed">
                        {organizerAccountInfo.accountType === "admin_conflict"
                          ? "The contact details belong to an Administrator account and cannot be provisioned as an organizer."
                          : "The email and phone number belong to two different registered accounts. Please verify contact details."}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Admin Approval Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any internal remarks or approval notes..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {modalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{modalError}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowApprovalModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmApprove}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
              >
                {actionLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm & Approve</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REJECTION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showRejectModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Reject Event Submission
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide a reason for the organizer/record
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !actionLoading && setShowRejectModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-red-200/80 bg-red-50/70 p-3.5 text-xs text-red-800 space-y-1">
                <p className="font-bold">Are you sure you want to reject this event submission?</p>
                <p className="text-slate-600 leading-relaxed">
                  This action will mark the submission as rejected and record the reason provided below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => {
                    setRejectNotes(e.target.value);
                    if (modalError) setModalError("");
                  }}
                  placeholder="Explain why this submission cannot be approved..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {modalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{modalError}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
              >
                {actionLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>Reject Submission</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. POST-APPROVAL OUTCOME MODAL (NEW ORGANIZER / EXISTING ACCOUNT) */}
      {/* ========================================================================= */}
      {approvalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-8">
            {/* Header */}
            <div className="relative border-b border-slate-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-6 py-5">
              <button
                type="button"
                onClick={() => setApprovalResult(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 transition shadow-sm"
                title="Close"
              >
                <X size={18} />
              </button>

              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                      <Sparkles size={12} />
                      Event Approved
                    </span>
                    {approvalResult.event?.publicId && (
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {approvalResult.event.publicId}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                    {approvalResult.isNewOrganizer
                      ? "Organizer account created successfully"
                      : "Organizer access added to existing account"}
                  </h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Event Reference Card */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Published Event
                  </p>
                  <p className="truncate text-sm font-bold text-slate-800">
                    {approvalResult.event?.title || selectedSubmission?.title}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                  Live
                </span>
              </div>

              {/* OUTCOME CASE A: NEW ORGANIZER */}
              {approvalResult.isNewOrganizer ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-inner">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <KeyRound size={16} className="text-orange-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Organizer Credentials
                        </span>
                      </div>
                      <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-300 border border-orange-500/30">
                        Temporary Password
                      </span>
                    </div>

                    <div className="mt-4 space-y-3.5">
                      {/* Email Row */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Email
                        </p>
                        <div className="mt-1 flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2 border border-slate-700/60">
                          <span className="font-mono text-sm text-slate-100 select-all">
                            {approvalResult.credentials?.email ||
                              approvalResult.organizer?.email}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                approvalResult.credentials?.email ||
                                  approvalResult.organizer?.email,
                                "email",
                              )
                            }
                            className="ml-2 flex items-center gap-1 rounded p-1 text-slate-400 hover:text-white transition"
                            title="Copy email"
                          >
                            {copiedField === "email" ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                                <Check size={14} /> Copied
                              </span>
                            ) : (
                              <Copy size={15} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Temporary Password Row */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Temporary Password
                        </p>
                        <div className="mt-1 flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2 border border-slate-700/60">
                          <span className="font-mono text-sm font-bold text-emerald-400 select-all tracking-wider">
                            {showPassword
                              ? approvalResult.credentials?.temporaryPassword
                              : "••••••••••••••••"}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="rounded p-1 text-slate-400 hover:text-white transition"
                              title={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <EyeOff size={15} />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  approvalResult.credentials?.temporaryPassword,
                                  "password",
                                )
                              }
                              className="rounded p-1 text-slate-400 hover:text-white transition"
                              title="Copy password"
                            >
                              {copiedField === "password" ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                                  <Check size={14} /> Copied
                                </span>
                              ) : (
                                <Copy size={15} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Copy All Button */}
                    <button
                      type="button"
                      onClick={handleCopyAllCredentials}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-xs font-bold text-white transition hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20"
                    >
                      {copiedField === "all" ? (
                        <>
                          <Check size={15} />
                          <span>Credentials Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={15} />
                          <span>Copy All Credentials</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Advisory */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex items-start gap-2.5">
                    <ShieldCheck
                      size={18}
                      className="text-amber-600 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-amber-900 leading-relaxed">
                      <strong>
                        Please share these credentials with the organizer.
                      </strong>{" "}
                      The temporary password will not be shown again. The
                      organizer can log in and update their password.
                    </p>
                  </div>
                </div>
              ) : (
                /* OUTCOME CASE B: EXISTING ORGANIZER / EXHIBITOR */
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <ShieldCheck size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Existing Account Updated
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      Organizer access has been added to the existing account
                      for{" "}
                      <strong className="text-slate-900 font-semibold">
                        {approvalResult.organizer?.name}
                      </strong>{" "}
                      (
                      <span className="font-mono text-xs">
                        {approvalResult.organizer?.email}
                      </span>
                      ).
                    </p>

                    <div className="pt-2 border-t border-emerald-200/60">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Active Account Roles:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {approvalResult.organizer?.roles?.map((role) => (
                          <span
                            key={role}
                            className="rounded-full bg-white border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shadow-2xs"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed">
                    The organizer can log in immediately using their existing
                    password at the standard login page and will find this event
                    ready in their Organizer Portal.
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setApprovalResult(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Close
              </button>
              {approvalResult.event?._id && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/admin/events/${approvalResult.event._id}`)
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <span>View Published Event</span>
                  <ExternalLink size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-2xl border transition-all animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === "success"
              ? "bg-slate-900 border-emerald-500/40"
              : "bg-slate-900 border-red-500/40"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle size={17} className="text-red-400 flex-shrink-0" />
          )}
          <span className="leading-tight">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white transition p-0.5"
            aria-label="Close toast"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

const SUBMISSION_SKELETON_ITEMS = [
  { titleW: "w-64", locW: "w-52", orgW: "w-60", schedW: "w-80", stallW: "w-40" },
  { titleW: "w-72", locW: "w-40", orgW: "w-56", schedW: "w-72", stallW: "w-36" },
  { titleW: "w-60", locW: "w-64", orgW: "w-60", schedW: "w-80", stallW: "w-44" },
  { titleW: "w-80", locW: "w-44", orgW: "w-52", schedW: "w-72", stallW: "w-36" },
  { titleW: "w-56", locW: "w-48", orgW: "w-56", schedW: "w-80", stallW: "w-40" },
  { titleW: "w-60", locW: "w-56", orgW: "w-52", schedW: "w-72", stallW: "w-44" },
];

function SubmissionsSkeleton() {
  return (
    <>
      <div className="space-y-4">
        {SUBMISSION_SKELETON_ITEMS.map((item, index) => (
          <article
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse"
          >
            <div className="flex flex-col justify-between gap-5 lg:flex-row">
              {/* Submission Information */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-6 w-16 rounded-full bg-orange-50 border border-orange-100/60" />
                </div>

                <div className={`mt-2.5 h-6 rounded-md bg-slate-200 ${item.titleW}`} />

                <div className={`mt-2 h-4 rounded bg-slate-100 ${item.locW}`} />

                <div className="mt-4 space-y-2">
                  <div className={`h-3.5 rounded bg-slate-100 ${item.orgW}`} />
                  <div className={`h-3.5 rounded bg-slate-100 ${item.schedW}`} />
                  <div className={`h-3.5 rounded bg-slate-100 ${item.stallW}`} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap items-start gap-2 lg:justify-end">
                <div className="h-9 w-24 rounded-lg border border-slate-200 bg-slate-50" />
                <div className="h-9 w-16 rounded-lg border border-red-100 bg-red-50/50" />
                <div className="h-9 w-36 rounded-lg bg-emerald-600/70" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between animate-pulse">
        <div className="h-4 w-36 rounded bg-slate-200" />
        <div className="flex items-center gap-1">
          <div className="h-9 w-20 rounded-lg border border-slate-200 bg-slate-50" />
          <div className="hidden h-9 w-9 rounded-lg bg-orange-500/80 sm:block" />
          <div className="hidden h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 sm:block" />
          <div className="hidden h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 sm:block" />
          <div className="h-9 w-16 rounded-lg border border-slate-200 bg-slate-50" />
        </div>
      </div>
    </>
  );
}

export default AdminEventSubmissions;
