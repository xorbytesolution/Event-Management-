import { useEffect, useState, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
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
  Calendar,
  X,
  Check,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../utils/dateUtils";
import {
  adminProfileSchema,
  adminPasswordSchema,
} from "../../validations/adminProfile.validation";

// Preset avatar options for quick selection
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
];

function AdminProfileSkeleton() {
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

function AdminProfile() {
  const { updateUser } = useAuth();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
    roles: ["admin"],
  });

  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
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

  // Track if any field was modified by comparing with admin data
  const isProfileModified = useMemo(() => {
    if (!admin) return false;
    const curName = (formData.name || "").trim();
    const origName = (admin.name || "").trim();
    const curPhone = (formData.phone || "").trim();
    const origPhone = (admin.phone || "").trim();
    const curImg = (formData.profileImage || "").trim();
    const origImg = (admin.profileImage || "").trim();

    return (
      curName !== origName || curPhone !== origPhone || curImg !== origImg
    );
  }, [formData, admin]);

  // Fetch admin profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const [{ data }] = await Promise.all([
        api.get("/admin/profile"),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      const adminData = data.admin;
      const adminRoles = adminData.roles || (adminData.role ? [adminData.role] : ["admin"]);

      setAdmin(adminData);
      setFormData({
        name: adminData.name || "",
        email: adminData.email || "",
        phone: adminData.phone || "",
        profileImage: adminData.profileImage || "",
        roles: adminRoles,
      });

      // Update AuthContext user state so layouts reflect latest values
      if (updateUser) {
        updateUser({
          name: adminData.name,
          email: adminData.email,
          phone: adminData.phone,
          profileImage: adminData.profileImage,
          roles: adminRoles,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load admin profile data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return "AD";
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

    // Clear field-specific error as user types
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
    if (!admin) return;
    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      profileImage: admin.profileImage || "",
      roles: admin.roles || (admin.role ? [admin.role] : ["admin"]),
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

    // 1. Check if user actually made any modifications
    if (!isProfileModified) {
      setProfileError(
        "No changes detected. Please modify a field to save updates.",
      );
      return;
    }

    // 2. Client-side Zod validation
    const validationResult = adminProfileSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setProfileFieldErrors(fieldErrors);
      setProfileError("Please correct the highlighted fields before saving.");
      return;
    }

    try {
      setSavingProfile(true);

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        profileImage: formData.profileImage.trim() || null,
      };

      const { data } = await api.patch("/admin/profile", payload);

      setProfileSuccess(data.message || "Profile updated successfully!");
      setAdmin((prev) => ({ ...prev, ...data.admin }));

      if (updateUser) {
        updateUser(data.admin);
      }

      setTimeout(() => {
        setProfileSuccess("");
      }, 4000);
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        if (Array.isArray(backendErrors)) {
          const fieldErrors = {};
          backendErrors.forEach((issue) => {
            if (issue.field) fieldErrors[issue.field] = issue.message;
          });
          setProfileFieldErrors(fieldErrors);
        } else if (typeof backendErrors === "object") {
          setProfileFieldErrors(backendErrors);
        }
      }
      setProfileError(
        err.response?.data?.message || "Failed to update admin profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error as user types
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

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordFieldErrors({});

    // Client-side Zod validation
    const validationResult = adminPasswordSchema.safeParse(passwordData);
    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setPasswordFieldErrors(fieldErrors);
      setPasswordError(
        "Please fill out all required password fields correctly.",
      );
      return;
    }

    try {
      setChangingPassword(true);

      const payload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      };

      const { data } = await api.patch("/admin/profile/password", payload);

      setPasswordSuccess(data.message || "Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordFieldErrors({});

      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordSuccess("");
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        if (Array.isArray(backendErrors)) {
          const fieldErrors = {};
          backendErrors.forEach((issue) => {
            if (issue.field) fieldErrors[issue.field] = issue.message;
          });
          setPasswordFieldErrors(fieldErrors);
        } else if (typeof backendErrors === "object") {
          setPasswordFieldErrors(backendErrors);
        }
      }
      setPasswordError(
        err.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const getProfileInputClass = (fieldName) => `
    w-full rounded-xl border
    ${
      profileFieldErrors[fieldName]
        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/15"
        : "border-slate-200 bg-white focus:border-orange-500 focus:ring-orange-500/20"
    }
    py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-900 transition focus:outline-hidden focus:ring-2
  `;

  const getPasswordInputClass = (fieldName) => `
    w-full rounded-xl border
    ${
      passwordFieldErrors[fieldName]
        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/15"
        : "border-slate-200 bg-white focus:border-orange-500 focus:ring-orange-500/20"
    }
    py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-900 transition focus:outline-hidden focus:ring-2
  `;

  if (loading) {
    return <AdminProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="text-base font-bold text-red-700">
                Failed to load profile
              </p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchProfile}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
            <ShieldCheck size={14} />
            <span>Account & Security</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Admin Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your administrative credentials, personal details, and account security.
          </p>
        </div>

        {/* Quick Action Button for Change Password Modal */}
        <button
          type="button"
          onClick={() => {
            setPasswordModalOpen(true);
            setPasswordError("");
            setPasswordSuccess("");
            setPasswordFieldErrors({});
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xs transition hover:border-orange-200 hover:bg-orange-50/70 hover:text-orange-600 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
        >
          <KeyRound size={17} className="text-orange-500" />
          <span>Change Password</span>
        </button>
      </div>

      {/* Aggregates / Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Role Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                System Role
              </p>
              <p className="mt-1 text-lg font-extrabold text-slate-900 capitalize">
                {admin?.roles?.join(", ") || admin?.role || "Admin"}
              </p>
              <p className="text-xs text-slate-500">Full administrative access</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Shield size={20} />
            </div>
          </div>
        </div>

        {/* Account Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Account Status
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <p className="text-lg font-extrabold text-slate-900 capitalize">
                  {admin?.accountStatus || "Active"}
                </p>
              </div>
              <p className="text-xs text-emerald-600 font-medium">Verified session</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* Member Since Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Member Since
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {admin?.createdAt ? formatDateTime(admin.createdAt) : "Recently"}
              </p>
              <p className="text-xs text-slate-500">Account provisioning date</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Calendar size={20} />
            </div>
          </div>
        </div>

        {/* Last Modified Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Last Updated
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {admin?.updatedAt ? formatDateTime(admin.updatedAt) : "Recently"}
              </p>
              <p className="text-xs text-slate-500">Audit trail timestamp</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Clock size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Edit Profile Form (2 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2 sm:p-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                Personal Information
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Update your administrative profile details and mobile number.
              </p>
            </div>

            {/* Change status badge */}
            <div className="pt-2 sm:pt-0">
              {isProfileModified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Unsaved changes</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Up to date</span>
                </span>
              )}
            </div>
          </div>

          {/* Feedback Alerts */}
          {profileSuccess && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800 animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <span>{profileError}</span>
            </div>
          )}

          <form
            onSubmit={handleSaveProfile}
            noValidate
            className="mt-6 space-y-6"
          >
            {/* Avatar Section */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Profile Photo
              </label>

              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Avatar Display */}
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-orange-100 shadow-xs">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt={formData.name || "Admin"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden",
                        );
                      }}
                    />
                  ) : null}
                  <div
                    className={`flex h-full w-full items-center justify-center bg-orange-100 text-xl font-extrabold text-orange-600 ${
                      formData.profileImage ? "hidden" : ""
                    }`}
                  >
                    {getInitials(formData.name)}
                  </div>
                </div>

                {/* Avatar Input & Quick Presets */}
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Camera size={16} />
                    </div>
                    <input
                      type="url"
                      name="profileImage"
                      id="profileImage"
                      value={formData.profileImage}
                      onChange={handleProfileChange}
                      placeholder="Paste Image URL (https://...)"
                      className={`w-full rounded-xl border ${
                        profileFieldErrors.profileImage
                          ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/15"
                          : "border-slate-200 bg-slate-50 focus:border-orange-500 focus:bg-white focus:ring-orange-500/20"
                      } py-2.5 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:outline-hidden focus:ring-2`}
                    />
                  </div>

                  {profileFieldErrors.profileImage && (
                    <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{profileFieldErrors.profileImage}</span>
                    </p>
                  )}

                  {/* Preset Avatar Selector */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Quick Avatars:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {AVATAR_PRESETS.map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              profileImage: presetUrl,
                            }));
                            setProfileFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.profileImage;
                              return copy;
                            });
                          }}
                          className={`h-7 w-7 overflow-hidden rounded-full border-2 transition hover:scale-110 ${
                            formData.profileImage === presetUrl
                              ? "border-orange-500 ring-2 ring-orange-200"
                              : "border-slate-200 opacity-70 hover:opacity-100"
                          }`}
                          title={`Select Avatar ${idx + 1}`}
                        >
                          <img
                            src={presetUrl}
                            alt={`Preset ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                      {formData.profileImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              profileImage: "",
                            }));
                            setProfileFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.profileImage;
                              return copy;
                            });
                          }}
                          className="ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 hover:text-red-600"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    placeholder="e.g. John Doe"
                    className={getProfileInputClass("name")}
                  />
                </div>
                {profileFieldErrors.name && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{profileFieldErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Email (Read-Only) */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                  >
                    Email Address
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Lock size={11} /> Read-only
                  </span>
                </div>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    disabled
                    readOnly
                    value={formData.email}
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/80 py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-600"
                    title="Account email address cannot be modified directly"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={getProfileInputClass("phone")}
                  />
                </div>
                {profileFieldErrors.phone ? (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{profileFieldErrors.phone}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    10-digit number used for admin alerts
                  </p>
                )}
              </div>

              {/* Role (Read-Only) */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="role"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                  >
                    System Role
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Lock size={11} /> Read-only
                  </span>
                </div>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Shield size={16} />
                  </div>
                  <input
                    type="text"
                    name="role"
                    id="role"
                    disabled
                    readOnly
                    value="Administrator (admin)"
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/80 py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-600 capitalize"
                    title="Role is determined by system authorization"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Defines administrative rights and portal access
                </p>
              </div>
            </div>

            {/* Read-Only System Details Banner */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-400">
                    System Role:
                  </span>
                  <span className="ml-2 inline-flex items-center rounded-md bg-orange-100 px-2 py-0.5 font-extrabold text-orange-700 uppercase tracking-wide text-[10px]">
                    {(formData.roles || [formData.role || "admin"]).join(", ")}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">
                    Account Status:
                  </span>
                  <span className="ml-2 inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 font-extrabold text-emerald-700 capitalize text-[10px]">
                    {admin?.accountStatus || "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={handleResetProfile}
                disabled={savingProfile || !isProfileModified}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                disabled={savingProfile || !isProfileModified}
                title={
                  !isProfileModified
                    ? "Modify at least one field to save changes"
                    : "Save changes"
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 ${
                  !isProfileModified
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : "bg-orange-500 text-white shadow-xs hover:bg-orange-600"
                } disabled:cursor-not-allowed`}
              >
                {savingProfile ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving Changes...</span>
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

        {/* Right Column: Security Overview & Quick Password Action (1 col) */}
        <div className="space-y-6">
          {/* Security Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Security & Access
                </h3>
                <p className="text-xs text-slate-500">Authentication control</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Ensure your administrator password remains strong and unique.
                Admins have full access to approve submissions and edit event listings.
              </p>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                <div className="flex gap-2">
                  <ShieldCheck size={16} className="shrink-0 text-amber-600" />
                  <p className="leading-snug">
                    Password must be at least <strong>8 characters</strong> long.
                    We recommend a mixture of letters, numbers, and symbols.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPasswordModalOpen(true);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setPasswordFieldErrors({});
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/20"
              >
                <KeyRound size={16} />
                <span>Update Password</span>
              </button>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Admin Access Scope
            </h4>

            <ul className="mt-3 space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span>Event Submissions Review & Approval</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span>Full Event Management & Stall Controls</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span>Exhibitor Directory & Profile Oversight</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span>System Analytics & Aggregates</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Change Password
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter current and new password
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Alerts */}
            {passwordSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Modal Form with noValidate to avoid browser's native popup */}
            <form
              onSubmit={handleChangePasswordSubmit}
              noValidate
              className="mt-5 space-y-4"
            >
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    name="currentPassword"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className={getPasswordInputClass("currentPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    aria-label={
                      showCurrentPass ? "Hide password" : "Show password"
                    }
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordFieldErrors.currentPassword && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{passwordFieldErrors.currentPassword}</span>
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type={showNewPass ? "text" : "password"}
                    name="newPassword"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Min. 8 characters"
                    className={getPasswordInputClass("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    aria-label={showNewPass ? "Hide password" : "Show password"}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordFieldErrors.newPassword && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{passwordFieldErrors.newPassword}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Re-enter new password"
                    className={getPasswordInputClass("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    aria-label={
                      showConfirmPass ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordFieldErrors.confirmPassword && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{passwordFieldErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Password Requirement Real-Time Helpers */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1.5 text-xs text-slate-600">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                  Password Requirements
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                      passwordData.newPassword.length >= 8
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {passwordData.newPassword.length >= 8 ? (
                      <Check size={11} strokeWidth={3} />
                    ) : (
                      "•"
                    )}
                  </div>
                  <span
                    className={
                      passwordData.newPassword.length >= 8
                        ? "text-emerald-700 font-medium"
                        : "text-slate-500"
                    }
                  >
                    At least 8 characters long
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                      passwordData.confirmPassword &&
                      passwordData.newPassword === passwordData.confirmPassword
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {passwordData.confirmPassword &&
                    passwordData.newPassword ===
                      passwordData.confirmPassword ? (
                      <Check size={11} strokeWidth={3} />
                    ) : (
                      "•"
                    )}
                  </div>
                  <span
                    className={
                      passwordData.confirmPassword &&
                      passwordData.newPassword ===
                        passwordData.confirmPassword
                        ? "text-emerald-700 font-medium"
                        : "text-slate-500"
                    }
                  >
                    Passwords match
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  disabled={changingPassword}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProfile;
