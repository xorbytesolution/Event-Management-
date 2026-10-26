import React, { useState, useEffect } from "react";
import {
  Phone,
  User,
  Mail,
  Tag,
  MessageSquare,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Send,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

function ContactOrganizerModal({
  isOpen,
  onClose,
  event,
  onInquirySuccess,
  inquiryInfo: propInquiryInfo,
}) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    phone: "",
    firstName: "",
    lastName: "",
    email: "",
    gender: "male",
    category: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState(propInquiryInfo || null);
  const [loadingInquiryStatus, setLoadingInquiryStatus] = useState(false);

  // Extract organizer name and event title
  const organizerName =
    event?.organizerName ||
    event?.organizerId?.name ||
    event?.organizerCompany ||
    "Organizer";

  const eventTitle = event?.title || "Event";

  // Check if current user is the host organizer of this event
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

  // Check if active inquiry already exists (new, accepted, or booked)
  const hasActiveInquiry = Boolean(
    inquiryStatus?.hasInquiry &&
      (inquiryStatus?.status === "new" ||
        inquiryStatus?.status === "accepted" ||
        inquiryStatus?.status === "booked")
  );

  // Sync prop changes
  useEffect(() => {
    if (propInquiryInfo !== undefined) {
      setInquiryStatus(propInquiryInfo);
    }
  }, [propInquiryInfo]);

  // Pre-fill fields and verify inquiry status whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      const nameParts = (user?.name || "").trim().split(/\s+/);
      const fName = nameParts[0] || "";
      const lName = nameParts.slice(1).join(" ") || "";

      // Determine category: matched with user's category, or first category from event
      let chosenCategory = "";
      if (Array.isArray(user?.categories) && user.categories.length > 0) {
        const matched = Array.isArray(event?.categories)
          ? user.categories.find((c) => event.categories.includes(c))
          : null;
        chosenCategory = matched || user.categories[0];
      } else if (user?.category) {
        chosenCategory = user.category;
      }

      if (!chosenCategory && Array.isArray(event?.categories) && event.categories.length > 0) {
        chosenCategory = event.categories[0];
      }

      if (!chosenCategory) {
        chosenCategory = "General";
      }

      setFormData({
        phone: user?.phone || "",
        firstName: fName,
        lastName: lName,
        email: user?.email || "",
        gender: (user?.gender || "male").toLowerCase() === "female" ? "female" : "male",
        category: chosenCategory,
        message: "",
      });

      setErrors({});
      setSuccess(false);
      setErrorMessage("");

      // Query inquiry status if exhibitor and not host organizer
      const eventIdentifier = event?._id || event?.publicId || event?.id;
      if (
        eventIdentifier &&
        user?.roles?.includes("exhibitor") &&
        !isHostOrganizer &&
        !propInquiryInfo
      ) {
        setLoadingInquiryStatus(true);
        api
          .get(`/inquiries/check/${eventIdentifier}`)
          .then((res) => {
            setInquiryStatus(res.data);
          })
          .catch((err) => {
            console.error("Failed to check inquiry status:", err);
          })
          .finally(() => {
            setLoadingInquiryStatus(false);
          });
      }
    }
  }, [isOpen, user, event, isHostOrganizer, propInquiryInfo]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.phone.trim()) {
      errs.phone = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      errs.phone = "Enter a valid 10-digit mobile number";
    }

    if (!formData.firstName.trim()) {
      errs.firstName = "First name is required";
    }

    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Enter a valid email address";
    }

    if (!formData.gender) {
      errs.gender = "Gender is required";
    }

    if (!formData.category.trim()) {
      errs.category = "Category is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (isHostOrganizer) {
      setErrorMessage(
        "You are the host of this event. You cannot submit an inquiry for your own event.",
      );
      return;
    }

    if (hasActiveInquiry) {
      if (inquiryStatus?.status === "booked") {
        setErrorMessage("Stall Confirmed & Booked! You already have an allocated stall for this event.");
      } else if (inquiryStatus?.status === "accepted") {
        setErrorMessage("Stall Inquired & Accepted! Organizer will contact you.");
      } else {
        setErrorMessage("Inquiry Already Submitted (Status: Pending Review)");
      }
      return;
    }

    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        eventId: event._id || event.publicId || event.id,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        category: formData.category.trim(),
        message: formData.message.trim(),
      };

      const { data } = await api.post("/inquiries", payload);

      const updatedInfo = {
        hasInquiry: true,
        canSubmit: false,
        status: "new",
        message: "Inquiry Already Submitted (Status: Pending Review)",
        inquiry: data?.inquiry || null,
      };
      setInquiryStatus(updatedInfo);
      onInquirySuccess?.(updatedInfo);

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error("Inquiry submission failed:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to send inquiry. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100/80 shadow-2xs">
              <Send size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Contact Event Organizer
              </h2>
              <p className="text-xs text-slate-500 line-clamp-1">
                {organizerName} • <span className="font-semibold text-slate-700">{eventTitle}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Notice */}
        {success ? (
          <div className="p-10 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs animate-in zoom-in-50 duration-300">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Inquiry Sent Successfully!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                The event organizer <strong className="text-slate-900">{organizerName}</strong> has received
                your inquiry and will contact you directly.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Form Body */}
            <div className="px-6 py-5 space-y-5 max-h-[72vh] overflow-y-auto">
              {errorMessage && (
                <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
                  <AlertCircle size={16} className="shrink-0 text-rose-500" />
                  <p className="font-medium">{errorMessage}</p>
                </div>
              )}

              {/* Host Organizer Warning */}
              {isHostOrganizer && (
                <div className="flex items-center gap-2.5 rounded-xl border border-purple-200 bg-purple-50 p-3.5 text-xs text-purple-900 shadow-2xs">
                  <span className="text-base shrink-0">👑</span>
                  <div>
                    <p className="font-bold">You are the host of this event</p>
                    <p className="text-[11px] text-purple-700">
                      You cannot submit a stall inquiry for an event that you host. Please manage stall allocations and incoming inquiries from your Organizer Portal.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading Inquiry Status */}
              {loadingInquiryStatus && (
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <Loader2 size={15} className="animate-spin text-orange-500" />
                  <span>Checking existing inquiries...</span>
                </div>
              )}

              {/* Status: Pending Review (new) */}
              {inquiryStatus?.hasInquiry && inquiryStatus?.status === "new" && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/95 p-3.5 text-xs text-amber-900 shadow-2xs">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 text-sm font-bold">
                    ⏳
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-sm text-amber-900">
                      Inquiry Already Submitted (Status: Pending Review)
                    </p>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      You have already submitted a stall inquiry for this event. Your request is currently under review by <strong className="text-amber-950">{organizerName}</strong>. Duplicate inquiries are restricted to prevent spam.
                    </p>
                    {inquiryStatus.inquiry?.createdAt && (
                      <p className="text-[10px] text-amber-700 font-semibold">
                        Submitted on: {new Date(inquiryStatus.inquiry.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Status: Booked / Confirmed */}
              {inquiryStatus?.hasInquiry && inquiryStatus?.status === "booked" && (
                <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50/95 p-3.5 text-xs text-indigo-900 shadow-2xs">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800 text-sm font-bold">
                    🎪
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-sm text-indigo-900">
                      Stall Confirmed & Booked! ({inquiryStatus.inquiry?.stallsBooked || 1} Stall{inquiryStatus.inquiry?.stallsBooked === 1 ? "" : "s"} Allocated)
                    </p>
                    <p className="text-indigo-800 text-[11px] leading-relaxed">
                      Congratulations! Your booth reservation has been confirmed and finalized by <strong className="text-indigo-950">{organizerName}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Status: Accepted */}
              {inquiryStatus?.hasInquiry && inquiryStatus?.status === "accepted" && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/95 p-3.5 text-xs text-emerald-900 shadow-2xs">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-sm font-bold">
                    🎉
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-sm text-emerald-900">
                      Stall Inquired & Accepted! Organizer will contact you.
                    </p>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      Great news! Your stall request has been accepted by <strong className="text-emerald-950">{organizerName}</strong>. The organizer will reach out to you directly via your phone or email for booth allocation and details.
                    </p>
                  </div>
                </div>
              )}

              {/* Status: Rejected (Allow Fresh Inquiry) */}
              {inquiryStatus?.hasInquiry && inquiryStatus?.status === "rejected" && (
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 shadow-2xs">
                  <span className="text-base shrink-0">ℹ️</span>
                  <div>
                    <p className="font-bold text-slate-800">Fresh Inquiry Allowed</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Your previous inquiry was not accepted. You may submit a fresh inquiry with updated details or another stall category below.
                    </p>
                  </div>
                </div>
              )}

              {/* Profile Details Locked Banner */}
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-600">
                <Lock size={14} className="shrink-0 text-orange-500" />
                <span className="font-medium">
                  Your contact details and category are auto-filled from your profile and cannot be modified here.
                </span>
              </div>

              {/* 2-Column Fields Grid matching Admin Profile layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Lock size={10} /> Read-only
                    </span>
                  </div>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User size={15} />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      readOnly
                      disabled
                      value={formData.firstName}
                      placeholder="First name"
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/80 py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Last Name
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Lock size={10} /> Read-only
                    </span>
                  </div>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User size={15} />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      readOnly
                      disabled
                      value={formData.lastName}
                      placeholder="Last name"
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/80 py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Lock size={10} /> Read-only
                    </span>
                  </div>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone size={15} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      readOnly
                      disabled
                      value={formData.phone}
                      placeholder="Mobile number"
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/80 py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.phone}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Lock size={10} /> Read-only
                    </span>
                  </div>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      readOnly
                      disabled
                      value={formData.email}
                      placeholder="Email address"
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/80 py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.email}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Lock size={10} /> Read-only
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-not-allowed select-none transition ${
                        formData.gender === "male"
                          ? "border-orange-300 bg-orange-50/70 text-orange-900 ring-2 ring-orange-200/50"
                          : "border-slate-200 bg-slate-100/70 text-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        disabled
                        checked={formData.gender === "male"}
                        className="h-3.5 w-3.5 text-orange-600 border-slate-300 cursor-not-allowed"
                      />
                      <span>Male</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-not-allowed select-none transition ${
                        formData.gender === "female"
                          ? "border-orange-300 bg-orange-50/70 text-orange-900 ring-2 ring-orange-200/50"
                          : "border-slate-200 bg-slate-100/70 text-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        disabled
                        checked={formData.gender === "female"}
                        className="h-3.5 w-3.5 text-orange-600 border-slate-300 cursor-not-allowed"
                      />
                      <span>Female</span>
                    </div>
                  </div>
                  {errors.gender && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.gender}</p>
                  )}
                </div>

                {/* Category (Read-Only) */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Lock size={10} /> Read-only
                    </span>
                  </div>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Tag size={15} />
                    </div>
                    <input
                      type="text"
                      name="category"
                      readOnly
                      disabled
                      value={formData.category}
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/80 py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none"
                    />
                  </div>
                  {errors.category && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.category}</p>
                  )}
                </div>

                {/* Message to Event Organizer */}
                <div className="col-span-1 sm:col-span-2">
                  <label
                    htmlFor="message"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                  >
                    Message to Event Organizer{" "}
                    <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute top-3 left-3 text-slate-400">
                      <MessageSquare size={16} />
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      disabled={submitting || isHostOrganizer || hasActiveInquiry}
                      placeholder={
                        hasActiveInquiry
                          ? "You already have an active inquiry for this event."
                          : "Type your message, questions about stalls, pricing, or requirements..."
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9.5 pr-3 text-sm text-slate-800 transition outline-none hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 resize-none min-h-[95px] leading-relaxed disabled:bg-slate-100/80 disabled:cursor-not-allowed disabled:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Disclaimer */}
              <div className="pt-1 text-center">
                <p className="text-[11px] text-slate-500">
                  We will never sell your email address. To learn more read our{" "}
                  <span className="text-orange-600 font-semibold cursor-pointer hover:underline">
                    Privacy Policy
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="bg-slate-50/90 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition shadow-2xs active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || isHostOrganizer || hasActiveInquiry || loadingInquiryStatus}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
                  inquiryStatus?.status === "booked"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : inquiryStatus?.status === "accepted"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : inquiryStatus?.status === "new"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-orange-600 hover:bg-orange-700 active:scale-95"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : loadingInquiryStatus ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Checking Status...</span>
                  </>
                ) : inquiryStatus?.status === "booked" ? (
                  <>
                    <span>🎪</span>
                    <span>Stall Confirmed & Booked ({inquiryStatus.inquiry?.stallsBooked || 1} Stall{inquiryStatus.inquiry?.stallsBooked === 1 ? "" : "s"})</span>
                  </>
                ) : inquiryStatus?.status === "accepted" ? (
                  <>
                    <span>✅</span>
                    <span>Stall Inquired & Accepted! Organizer will contact you.</span>
                  </>
                ) : inquiryStatus?.status === "new" ? (
                  <>
                    <span>⏳</span>
                    <span>Inquiry Already Submitted (Status: Pending Review)</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>{inquiryStatus?.status === "rejected" ? "Submit Fresh Inquiry" : "Submit Inquiry"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ContactOrganizerModal;
