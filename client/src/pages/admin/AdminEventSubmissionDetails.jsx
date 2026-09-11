import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  User,
  Phone,
  Mail,
  Store,
  Building2,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  X,
  KeyRound,
  Sparkles,
  AlertTriangle,
  UserCheck,
  UserPlus,
  Info,
} from "lucide-react";
import api from "../../services/api";
import { formatScheduleRange } from "../../utils/dateUtils.js";

function AdminEventSubmissionDetails() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [organizerAccountInfo, setOrganizerAccountInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [modalError, setModalError] = useState("");

  // Approval outcome state
  const [approvalResult, setApprovalResult] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [showPassword, setShowPassword] = useState(true);

  useEffect(() => {
    const loadSubmission = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(
          `/admin/event-submissions/${submissionId}`,
        );

        setSubmission(data.submission);
        setOrganizerAccountInfo(data.organizerAccountInfo || null);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load event submission.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSubmission();
  }, [submissionId]);

  const handleOpenApprove = () => {
    setApprovalNotes(submission?.adminNotes || "");
    setModalError("");
    setShowApprovalModal(true);
  };

  const handleOpenReject = () => {
    setRejectNotes(submission?.adminNotes || "");
    setModalError("");
    setShowRejectModal(true);
  };

  const handleConfirmApprove = async () => {
    try {
      setActionLoading(true);
      setModalError("");

      const { data } = await api.post(
        `/admin/event-submissions/${submissionId}/approve`,
        {
          adminNotes: approvalNotes.trim() || undefined,
        },
      );

      // Update submission state in place
      setSubmission((prev) => ({
        ...prev,
        status: "approved",
        adminNotes: approvalNotes.trim() || prev?.adminNotes,
        publishedEventId: data.event?._id,
      }));

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
    if (!rejectNotes.trim()) {
      setModalError("Please provide a reason for rejection.");
      return;
    }

    try {
      setActionLoading(true);
      setModalError("");

      await api.patch(`/admin/event-submissions/${submissionId}`, {
        action: "rejected",
        adminNotes: rejectNotes.trim(),
      });

      setSubmission((prev) => ({
        ...prev,
        status: "rejected",
        adminNotes: rejectNotes.trim(),
      }));

      setShowRejectModal(false);
      showToast("Event submission has been rejected.", "error");
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
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
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

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />

        <div className="mt-6 h-96 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link
          to="/admin/event-submissions"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to submissions
        </Link>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-bold text-red-700">
            Unable to load submission
          </p>

          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const formatDate = (value) => {
    if (!value) return "Not provided";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (value) => {
    if (!value) return "";

    return value
      .replace("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/event-submissions"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to submissions
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Event Submission
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {submission.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Submitted on {formatDate(submission.createdAt)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
              submission.status === "approved"
                ? "bg-green-50 text-green-700"
                : submission.status === "rejected"
                  ? "bg-red-50 text-red-700"
                  : submission.status === "under_review"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-orange-50 text-orange-700"
            }`}
          >
            {formatStatus(submission.status)}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Event Information */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Event Information</h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            <InfoItem
              icon={CalendarDays}
              label="Event Dates"
              value={formatScheduleRange(
                submission.startDate,
                submission.endDate,
              )}
            />

            <InfoItem
              icon={Building2}
              label="Event Type"
              value={submission.eventType}
            />

            <InfoItem icon={MapPin} label="City" value={submission.city} />

            <InfoItem icon={Building2} label="Venue" value={submission.venue} />

            <InfoItem
              icon={Building2}
              label="Venue Type"
              value={submission.venueType}
            />

            <InfoItem
              icon={Users}
              label="Expected Visitors"
              value={submission.expectedVisitors || "Not provided"}
            />
          </div>
        </section>

        {/* Organizer */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Organizer Information</h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-3">
            <InfoItem
              icon={User}
              label="Name"
              value={submission.organizerName}
            />

            <InfoItem
              icon={Phone}
              label="Phone"
              value={submission.organizerPhone}
            />

            <InfoItem
              icon={Mail}
              label="Email"
              value={submission.organizerEmail}
            />
          </div>
        </section>

        {/* Description */}
        {(submission.description || submission.highlights) && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-900">Event Description</h2>
            </div>

            <div className="space-y-5 p-5">
              {submission.description && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                    {submission.description}
                  </p>
                </div>
              )}

              {submission.highlights && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Highlights
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                    {submission.highlights}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Categories & Facilities */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Categories & Facilities
            </h2>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-2">
            <TagGroup title="Categories" items={submission.categories} />

            <TagGroup title="Facilities" items={submission.facilities} />
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
                value={submission.stallSetup?.model || "Not provided"}
              />

              <InfoItem
                icon={Store}
                label="Total Stalls"
                value={submission.totalStalls}
              />

              <InfoItem
                icon={Store}
                label="Available Stalls"
                value={submission.availableStalls}
              />
            </div>

            {submission.stallSetup?.options?.length > 0 && (
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
                    {submission.stallSetup.options.map((option, index) => (
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
        {(submission.posterImage || submission.floorPlanImage) && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-bold text-slate-900">Event Images</h2>
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-2">
              {submission.posterImage && (
                <ImagePreview title="Poster" src={submission.posterImage} />
              )}

              {submission.floorPlanImage && (
                <ImagePreview
                  title="Floor Plan"
                  src={submission.floorPlanImage}
                />
              )}
            </div>
          </section>
        )}

        {/* Admin Review */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">Admin Review</h2>
          </div>

          <div className="p-5">
            {submission.adminNotes && (
              <div className="mb-5 rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Admin Notes
                </p>

                <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                  {submission.adminNotes}
                </p>
              </div>
            )}

            {["pending", "under_review"].includes(submission.status) && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleOpenReject}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Reject
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleOpenApprove}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                >
                  <CheckCircle2 size={18} />
                  Approve & Publish
                </button>
              </div>
            )}

            {submission.status === "approved" && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-semibold">
                    This submission has been approved and published.
                  </span>
                </div>
                {submission.publishedEventId && (
                  <Link
                    to={`/admin/events/${submission.publishedEventId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100"
                  >
                    <span>View Published Event</span>
                    <ExternalLink size={14} />
                  </Link>
                )}
              </div>
            )}

            {submission.status === "rejected" && (
              <div className="flex items-center gap-2 text-red-700">
                <XCircle size={18} />
                <span className="text-sm font-semibold">
                  This submission has been rejected.
                </span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 1. APPROVAL CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showApprovalModal && (
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
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Event
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {submission.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                  <span>
                    Organizer: <strong>{submission.organizerName}</strong>
                  </span>
                  <span>
                    Email: <strong>{submission.organizerEmail}</strong>
                  </span>
                </div>
              </div>

              {/* Dynamic Account Recognition Banner */}
              {organizerAccountInfo?.accountType === "new_user" && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <UserPlus size={15} className="text-blue-600" />
                    <span>New Organizer Account Detected</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    This is a <strong>brand new organizer</strong>. No registered account was found for <span className="font-mono">{submission.organizerEmail}</span>. Approving will create a new Organizer account and generate secure temporary login credentials.
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
                    This user is already registered as an <strong>Exhibitor</strong> (<span className="font-mono">{submission.organizerEmail}</span>). Approving will add <strong>Organizer</strong> privileges to their existing account. They will keep their existing password.
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
                    This user already has an active <strong>Organizer</strong> account (<span className="font-mono">{submission.organizerEmail}</span>). Approving will publish this event directly to their existing Organizer dashboard.
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
      {/* 2. REJECTION MODAL */}
      {/* ========================================================================= */}
      {showRejectModal && (
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
            {/* Header with Green Accent */}
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
                    {approvalResult.event?.title || submission.title}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                  Live
                </span>
              </div>

              {/* OUTCOME CASE A: NEW ORGANIZER */}
              {approvalResult.isNewOrganizer ? (
                <div className="space-y-4">
                  {/* Credentials Box */}
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

                  {/* Warning / Advisory */}
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
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => navigate("/admin/event-submissions")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft size={14} />
                <span>Back to Submissions</span>
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalResult(null)}
                  className="flex-1 sm:flex-initial rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Stay on Details
                </button>
                {approvalResult.event?._id && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/admin/events/${approvalResult.event._id}`)
                    }
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                  >
                    <span>View Published Event</span>
                    <ExternalLink size={14} />
                  </button>
                )}
              </div>
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
        {items.length > 0 ? (
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

export default AdminEventSubmissionDetails;
