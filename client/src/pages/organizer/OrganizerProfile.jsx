import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  Calendar,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Camera,
  Save,
  RotateCcw,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  MessageSquare,
  FileText,
  BadgeCheck,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../utils/dateUtils";
import {
  organizerProfileSchema,
  organizerPasswordSchema,
} from "../../validations/organizerProfile.validation";

// Preset avatar options for quick selection
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
];

function OrganizerProfileSkeleton() {
  return (
    <div className="animate-pulse px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2.5">
        <div className="h-4 w-32 rounded-md bg-slate-200" />
        <div className="h-8 w-64 rounded-md bg-slate-200" />
        <div className="h-4 w-96 max-w-full rounded-md bg-slate-200" />
      </div>

      {/* Aggregate Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded-md bg-slate-200" />
                <div className="h-6 w-28 rounded-md bg-slate-200" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2 space-y-6">
          <div className="h-5 w-40 rounded-md bg-slate-200" />
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-36 rounded-md bg-slate-200" />
              <div className="h-3 w-48 rounded-md bg-slate-200" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 rounded-md bg-slate-200" />
                <div className="h-10 w-full rounded-lg bg-slate-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="h-5 w-36 rounded-md bg-slate-200" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded-md bg-slate-200" />
            <div className="h-4 w-4/5 rounded-md bg-slate-200" />
          </div>
          <div className="h-11 w-full rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function OrganizerProfile() {
  const { updateUser } = useAuth();

  const [organizer, setOrganizer] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
    roles: ["organizer"],
  });

  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Track if any profile field was modified
  const isProfileModified = useMemo(() => {
    if (!organizer) return false;
    const curName = (formData.name || "").trim();
    const origName = (organizer.name || "").trim();
    const curPhone = (formData.phone || "").trim();
    const origPhone = (organizer.phone || "").trim();
    const curImg = (formData.profileImage || "").trim();
    const origImg = (organizer.profileImage || "").trim();

    return curName !== origName || curPhone !== origPhone || curImg !== origImg;
  }, [formData, organizer]);

  // Fetch organizer profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/organizer/profile");

      const orgData = data.organizer;
      const orgRoles =
        orgData.roles || (orgData.role ? [orgData.role] : ["organizer"]);

      setOrganizer(orgData);
      setStats(
        data.stats || {
          totalEvents: 0,
          publishedEvents: 0,
          draftEvents: 0,
          totalInquiries: 0,
        },
      );

      setFormData({
        name: orgData.name || "",
        email: orgData.email || "",
        phone: orgData.phone || "",
        profileImage: orgData.profileImage || "",
        roles: orgRoles,
      });

      // Update AuthContext user state so top nav/sidebar reflect fresh values
      if (updateUser) {
        updateUser({
          name: orgData.name,
          email: orgData.email,
          phone: orgData.phone,
          profileImage: orgData.profileImage,
          roles: orgRoles,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load organizer profile data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return "OR";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (profileFieldErrors[name]) {
      setProfileFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    setProfileError("");
    setProfileSuccess("");
  };

  const handleResetProfile = () => {
    if (!organizer) return;
    setFormData({
      name: organizer.name || "",
      email: organizer.email || "",
      phone: organizer.phone || "",
      profileImage: organizer.profileImage || "",
      roles: organizer.roles || ["organizer"],
    });
    setProfileFieldErrors({});
    setProfileError("");
    setProfileSuccess("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileFieldErrors({});

    if (!isProfileModified) {
      setProfileError(
        "No changes detected. Please modify a field to save updates.",
      );
      return;
    }

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      profileImage: formData.profileImage.trim() || null,
    };

    const validationResult = organizerProfileSchema.safeParse(payload);
    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setProfileFieldErrors(fieldErrors);
      return;
    }

    try {
      setSavingProfile(true);
      const { data } = await api.put("/organizer/profile", payload);

      setProfileSuccess(data.message || "Profile updated successfully.");
      setOrganizer((prev) => ({ ...prev, ...data.organizer }));

      if (updateUser) {
        updateUser({
          ...organizer,
          ...data.organizer,
        });
      }
    } catch (err) {
      setProfileError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (passwordFieldErrors[name]) {
      setPasswordFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordFieldErrors({});

    const validationResult = organizerPasswordSchema.safeParse(passwordData);
    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setPasswordFieldErrors(fieldErrors);
      return;
    }

    try {
      setChangingPassword(true);
      const { data } = await api.put("/organizer/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess(
        data.message ||
          "Password changed successfully. Please remember your new password.",
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          "Failed to change password. Please verify current password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // Live password strength calculation
  const newPass = passwordData.newPassword;
  const passLength = newPass.length >= 8;
  const passHasLower = /[a-z]/.test(newPass);
  const passHasUpper = /[A-Z]/.test(newPass);
  const passHasNumber = /[0-9]/.test(newPass);
  const passHasSpecial = /[^A-Za-z0-9]/.test(newPass);
  const passMatch =
    newPass && passwordData.confirmPassword
      ? newPass === passwordData.confirmPassword
      : null;

  const strengthCount = [
    passLength,
    passHasLower,
    passHasUpper,
    passHasNumber,
    passHasSpecial,
  ].filter(Boolean).length;

  const isDualRole = organizer?.roles?.includes("exhibitor");

  if (loading) {
    return <OrganizerProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner">
          <AlertCircle size={32} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Unable to Load Profile
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-600">{error}</p>
        <button
          onClick={fetchProfile}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-orange-700"
        >
          <RotateCcw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
              <Link
                to="/organizer"
                className="hover:text-orange-600 transition-colors"
              >
                Organizer Portal
              </Link>
              <span>/</span>
              <span className="text-slate-800">My Profile</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Organizer Profile
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                <Building2 size={13} />
                Event Organizer
              </span>
              {organizer?.isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <BadgeCheck size={13} />
                  Verified Partner
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-slate-600">
              Manage your personal credentials, contact info, and secure
              account password.
            </p>
          </div>

          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:border-orange-300 hover:bg-orange-50/50 hover:text-orange-700 sm:self-auto"
          >
            <CalendarDays size={16} />
            <span>View My Events</span>
          </Link>
        </div>

        {/* Temporary password alert banner */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/40 p-4.5 sm:p-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldAlert size={20} />
            </div>
            <div className="flex-1 text-sm">
              <h3 className="font-bold text-amber-900">
                Important: Update Your Temporary Password
              </h3>
              <p className="mt-0.5 text-amber-800/90 leading-relaxed">
                If your organizer account was created or approved with a
                temporary password by the administrator, please use the{" "}
                <strong>Security & Password</strong> section below to choose a
                strong, private password.
              </p>
            </div>
          </div>
        </div>

        {/* Dual-Role Banner if user is also an exhibitor */}
        {isDualRole && (
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-blue-50/50 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-950">
                    Dual-Role Account (Organizer & Exhibitor)
                  </h4>
                  <p className="text-xs text-indigo-800">
                    You have active access to book stalls and manage exhibits
                    with the same account.
                  </p>
                </div>
              </div>
              <Link
                to="/exhibitor"
                className="inline-flex items-center gap-1.5 self-start rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 sm:self-auto"
              >
                <span>Go to Exhibitor Hub</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Events
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {stats.totalEvents}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">All submissions</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <CalendarDays size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Published Events
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                  {stats.publishedEvents}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Live on platform</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BadgeCheck size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pending / Drafts
                </p>
                <p className="mt-1 text-2xl font-extrabold text-amber-600">
                  {stats.draftEvents}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Under admin review
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Stall Inquiries
                </p>
                <p className="mt-1 text-2xl font-extrabold text-blue-600">
                  {stats.totalInquiries}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  From registered exhibitors
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MessageSquare size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Profile Information Form (2 Cols) */}
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Personal Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your public display name and official contact number.
                  </p>
                </div>
                {isProfileModified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
                    Unsaved changes
                  </span>
                )}
              </div>

              {profileSuccess && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <p>{profileSuccess}</p>
                </div>
              )}

              {profileError && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800">
                  <AlertCircle size={18} className="shrink-0 text-rose-600" />
                  <p>{profileError}</p>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
                {/* Avatar Preview & URL Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Profile Avatar
                  </label>
                  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 shadow-inner">
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt={formData.name || "Organizer"}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-xl font-black text-slate-600">
                          {getInitials(formData.name)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          name="profileImage"
                          value={formData.profileImage}
                          onChange={handleProfileChange}
                          placeholder="Paste image URL (https://...)"
                          className={`w-full rounded-xl border px-3.5 py-2 text-sm transition outline-none focus:ring-2 focus:ring-orange-500/20 ${
                            profileFieldErrors.profileImage
                              ? "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500"
                              : "border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-orange-500 focus:bg-white"
                          }`}
                        />
                        {formData.profileImage && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((p) => ({ ...p, profileImage: "" }))
                            }
                            className="rounded-lg border border-slate-200 p-2 text-xs text-slate-500 hover:bg-slate-100"
                            title="Clear image"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {profileFieldErrors.profileImage && (
                        <p className="text-xs text-rose-600">
                          {profileFieldErrors.profileImage}
                        </p>
                      )}

                      {/* Quick Presets */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-slate-500">Presets:</span>
                        <div className="flex items-center gap-1.5">
                          {AVATAR_PRESETS.map((presetUrl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  profileImage: presetUrl,
                                }))
                              }
                              className="h-7 w-7 overflow-hidden rounded-full border border-slate-300 transition hover:scale-110 hover:border-orange-500"
                            >
                              <img
                                src={presetUrl}
                                alt={`Preset ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative mt-2">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleProfileChange}
                        placeholder="Your full name"
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition outline-none focus:ring-2 focus:ring-orange-500/20 ${
                          profileFieldErrors.name
                            ? "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500"
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-orange-500 focus:bg-white"
                        }`}
                      />
                    </div>
                    {profileFieldErrors.name && (
                      <p className="mt-1 text-xs text-rose-600">
                        {profileFieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative mt-2">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleProfileChange}
                        placeholder="10 digit phone number"
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition outline-none focus:ring-2 focus:ring-orange-500/20 ${
                          profileFieldErrors.phone
                            ? "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500"
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-orange-500 focus:bg-white"
                        }`}
                      />
                    </div>
                    {profileFieldErrors.phone && (
                      <p className="mt-1 text-xs text-rose-600">
                        {profileFieldErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email Address (Read-only) */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Email Address
                      </label>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Permanent ID
                      </span>
                    </div>
                    <div className="relative mt-2">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-3 text-sm text-slate-500 select-none"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Email address is linked to account authentication and
                      cannot be changed.
                    </p>
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Member Since
                    </label>
                    <div className="relative mt-2">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Calendar size={16} />
                      </div>
                      <input
                        type="text"
                        disabled
                        value={
                          organizer?.createdAt
                            ? formatDateTime(organizer.createdAt)
                            : "N/A"
                        }
                        className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-3 text-sm text-slate-500 select-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    disabled={!isProfileModified || savingProfile}
                    onClick={handleResetProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                    <span>Reset</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!isProfileModified || savingProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Security & Change Password Card */}
          <div className="space-y-8 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Security & Password
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update your account password
                  </p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <p className="leading-relaxed">{passwordSuccess}</p>
                </div>
              )}

              {passwordError && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <p className="leading-relaxed">{passwordError}</p>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="mt-6 space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className={`w-full rounded-xl border py-2.5 pl-9 pr-10 text-xs sm:text-sm transition outline-none focus:ring-2 focus:ring-orange-500/20 ${
                        passwordFieldErrors.currentPassword
                          ? "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-orange-500 focus:bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {passwordFieldErrors.currentPassword && (
                    <p className="mt-1 text-xs text-rose-600">
                      {passwordFieldErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showNewPass ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 8 characters"
                      className={`w-full rounded-xl border py-2.5 pl-9 pr-10 text-xs sm:text-sm transition outline-none focus:ring-2 focus:ring-orange-500/20 ${
                        passwordFieldErrors.newPassword
                          ? "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-orange-500 focus:bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {passwordFieldErrors.newPassword && (
                    <p className="mt-1 text-xs text-rose-600">
                      {passwordFieldErrors.newPassword}
                    </p>
                  )}

                  {/* Password Strength Indicator */}
                  {newPass.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-600">
                          Password Strength:
                        </span>
                        <span
                          className={`font-bold ${
                            strengthCount <= 2
                              ? "text-rose-600"
                              : strengthCount <= 4
                                ? "text-amber-600"
                                : "text-emerald-600"
                          }`}
                        >
                          {strengthCount <= 2
                            ? "Weak"
                            : strengthCount <= 4
                              ? "Good"
                              : "Strong"}
                        </span>
                      </div>
                      <div className="flex h-1.5 gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-full flex-1 rounded-full transition-colors ${
                              lvl <= strengthCount
                                ? strengthCount <= 2
                                  ? "bg-rose-500"
                                  : strengthCount <= 4
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <ul className="mt-2 space-y-1 text-[10px] text-slate-500">
                        <li
                          className={`flex items-center gap-1.5 ${passLength ? "text-emerald-600 font-semibold" : ""}`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full ${passLength ? "bg-emerald-500" : "bg-slate-400"}`}
                          />
                          At least 8 characters
                        </li>
                        <li
                          className={`flex items-center gap-1.5 ${passHasUpper && passHasLower ? "text-emerald-600 font-semibold" : ""}`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full ${passHasUpper && passHasLower ? "bg-emerald-500" : "bg-slate-400"}`}
                          />
                          Upper & lower case letters
                        </li>
                        <li
                          className={`flex items-center gap-1.5 ${passHasNumber ? "text-emerald-600 font-semibold" : ""}`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full ${passHasNumber ? "bg-emerald-500" : "bg-slate-400"}`}
                          />
                          At least one number
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Repeat new password"
                      className={`w-full rounded-xl border py-2.5 pl-9 pr-10 text-xs sm:text-sm transition outline-none focus:ring-2 focus:ring-orange-500/20 ${
                        passwordFieldErrors.confirmPassword
                          ? "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:border-orange-500 focus:bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {passwordFieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">
                      {passwordFieldErrors.confirmPassword}
                    </p>
                  )}
                  {passMatch !== null && (
                    <p
                      className={`mt-1 text-[11px] font-semibold ${passMatch ? "text-emerald-600" : "text-rose-500"}`}
                    >
                      {passMatch
                        ? "✓ Passwords match"
                        : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    changingPassword ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {changingPassword ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerProfile;
