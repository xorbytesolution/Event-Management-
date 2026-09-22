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

function ContactOrganizerModal({ isOpen, onClose, event }) {
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

  // Extract organizer name and event title
  const organizerName =
    event?.organizerName ||
    event?.organizerId?.name ||
    event?.organizerCompany ||
    "Organizer";

  const eventTitle = event?.title || "Event";

  // Pre-fill fields whenever the modal opens or user/event changes
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
    }
  }, [isOpen, user, event]);

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

      await api.post("/inquiries", payload);

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
                      placeholder="Type your message, questions about stalls, pricing, or requirements..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9.5 pr-3 text-sm text-slate-800 transition outline-none hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 resize-none min-h-[95px] leading-relaxed"
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
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Submit Inquiry</span>
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
