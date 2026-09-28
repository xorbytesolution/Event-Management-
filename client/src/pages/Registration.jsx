import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import {
  CATEGORIES_LIST,
  registrationSchema,
} from "../validations/registration.validation";

function Registration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, checkAuth, showSuccessMessage } = useAuth();

  const isAlreadyExhibitor = user?.roles?.includes("exhibitor");
  const isOrganizerUpgrading =
    user?.roles?.includes("organizer") && !isAlreadyExhibitor;

  const [formData, setFormData] = useState({
    mobile: "",
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Field-level validation errors & server-level error
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill fields if a logged-in organizer is upgrading their account
  useEffect(() => {
    if (user && isOrganizerUpgrading) {
      const nameParts = (user.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: user.email || prev.email,
        mobile: user.phone || prev.mobile,
        gender: user.gender || prev.gender,
      }));
    }
  }, [user, isOrganizerUpgrading]);

  // Validation helpers
  const getFieldError = (field) => validationErrors[field];
  const hasFieldError = (field) => Boolean(validationErrors[field]);

  const getInputClass = (fieldName, extraClasses = "") => `
    w-full rounded-lg border px-4 py-3 text-sm outline-none transition
    ${
      hasFieldError(fieldName)
        ? "border-red-400 bg-red-50/50 text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
        : "border-slate-300 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
    } ${extraClasses}
  `;

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    // Mobile number: only digits, max 10 digits
    if (name === "mobile") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    const updatedFormData = {
      ...formData,
      [name]: updatedValue,
    };

    setFormData(updatedFormData);

    // If there are existing validation errors, re-evaluate touched field(s) in real-time
    if (Object.keys(validationErrors).length > 0) {
      const validationData = {
        ...updatedFormData,
        categories: selectedCategories,
        termsAccepted,
      };

      const result = registrationSchema.safeParse(validationData);
      const fieldsToCheck =
        name === "password" || name === "confirmPassword"
          ? ["password", "confirmPassword"]
          : [name];

      setValidationErrors((prev) => {
        const updated = { ...prev };

        fieldsToCheck.forEach((f) => {
          delete updated[f];
        });

        if (!result.success) {
          result.error.issues.forEach((issue) => {
            const field = issue.path[0];
            if (fieldsToCheck.includes(field) && !updated[field]) {
              updated[field] = issue.message;
            }
          });
        }

        return updated;
      });
    }

    setError("");
  };

  const toggleCategory = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updated);

    if (validationErrors.categories) {
      if (updated.length > 0) {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next.categories;
          return next;
        });
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          categories: "Please select at least one category",
        }));
      }
    }

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const validationData = {
      mobile: formData.mobile,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      gender: formData.gender,
      categories: selectedCategories,
      termsAccepted,
    };

    // ---------------------------------
    // Zod Schema Validation
    // ---------------------------------
    const validationResult = registrationSchema.safeParse(validationData);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });

      setValidationErrors(fieldErrors);
      return;
    }

    setValidationErrors({});
    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.mobile.trim(),
        gender: formData.gender,
        categories: selectedCategories,
        termsAccepted,
      };

      const { data } = await api.post("/auth/register", payload);

      if (isAuthenticated || isOrganizerUpgrading) {
        // Refresh AuthContext session so user.roles immediately has ["organizer", "exhibitor"]
        await checkAuth();
        const successMsg =
          data?.message ||
          "Exhibitor access added to your account successfully! You can now contact event organizers.";
        showSuccessMessage?.(successMsg);

        const returnUrl = location.state?.from || "/";
        navigate(returnUrl, {
          replace: true,
          state: {
            successMessage: successMsg,
          },
        });
      } else {
        await checkAuth();
        navigate("/login", {
          state: {
            successMessage:
              data?.message ||
              "Registration successful! Please log in to continue.",
            from: location.state?.from,
          },
        });
      }
    } catch (requestError) {
      const backendErrors = requestError.response?.data?.errors;

      // Handle field-level backend validation errors
      if (Array.isArray(backendErrors)) {
        const errors = {};
        backendErrors.forEach((issue) => {
          const path = issue.path;
          const field = Array.isArray(path) ? path[0] : path;
          if (field) {
            const key = field === "phone" ? "mobile" : field;
            if (!errors[key]) {
              errors[key] = issue.message;
            }
          }
        });

        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return;
        }
      }

      setError(
        requestError.response?.data?.message ||
          "Unable to complete registration. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // If already registered as an exhibitor, prevent duplicate registrations and guide them
  if (isAlreadyExhibitor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Already Registered as an Exhibitor
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account (
              <span className="font-semibold text-slate-800">
                {user?.email}
              </span>
              ) already has active Exhibitor access. You have full permissions
              to inquire about stalls and contact event organizers.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                to={location.state?.from || "/"}
                className="rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700 transition shadow-xs"
              >
                {location.state?.from
                  ? "Return to Event"
                  : "Browse Events & Stalls"}
              </Link>
              {user?.roles?.includes("organizer") && (
                <Link
                  to="/organizer"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Organizer Portal
                </Link>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Registration Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  {isOrganizerUpgrading ? "Add Exhibitor Access" : "Sign Up"}
                </h1>

                <p className="mt-1 text-xs text-slate-500">
                  {isOrganizerUpgrading
                    ? "Upgrade your account to inquire about stalls and contact organizers"
                    : "Create your exhibitor account"}
                </p>
              </div>

              <Link
                to="/"
                className="text-2xl font-bold text-slate-400 transition hover:text-slate-700"
                aria-label="Close"
              >
                ×
              </Link>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="px-6 py-6">
              <div className="space-y-5">
                {isOrganizerUpgrading && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <span>✨</span> Upgrading Existing Organizer Account
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      You are currently logged in as an Organizer (
                      <strong className="text-slate-800">{user?.email}</strong>
                      ). Enter your existing account password and select your
                      categories to add Exhibitor stall booking privileges to your
                      existing account.
                    </p>
                  </div>
                )}

                {/* General / Server Error */}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Mobile */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-slate-600">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    {isOrganizerUpgrading && (
                      <span className="text-[11px] font-semibold text-slate-400">
                        Linked to account
                      </span>
                    )}
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    readOnly={isOrganizerUpgrading}
                    placeholder="Enter mobile number"
                    maxLength={10}
                    className={getInputClass(
                      "mobile",
                      isOrganizerUpgrading
                        ? "!bg-slate-100/80 cursor-not-allowed text-slate-600"
                        : "",
                    )}
                  />
                  {hasFieldError("mobile") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {getFieldError("mobile")}
                    </p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                    First Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className={getInputClass("firstName")}
                  />
                  {hasFieldError("firstName") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {getFieldError("firstName")}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className={getInputClass("lastName")}
                  />
                  {hasFieldError("lastName") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {getFieldError("lastName")}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-slate-600">
                      Email <span className="text-red-500">*</span>
                    </label>
                    {isOrganizerUpgrading && (
                      <span className="text-[11px] font-semibold text-slate-400">
                        Linked to account
                      </span>
                    )}
                  </div>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={isOrganizerUpgrading}
                    placeholder="Email"
                    className={getInputClass(
                      "email",
                      isOrganizerUpgrading
                        ? "!bg-slate-100/80 cursor-not-allowed text-slate-600"
                        : "",
                    )}
                  />
                  {hasFieldError("email") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {getFieldError("email")}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                    {isOrganizerUpgrading
                      ? "Current Account Password"
                      : "Password"}{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={
                        isOrganizerUpgrading
                          ? "Enter your existing account password"
                          : "Create a password"
                      }
                      className={getInputClass("password", "pr-11")}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {hasFieldError("password") ? (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {getFieldError("password")}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-400">
                      {isOrganizerUpgrading
                        ? "Enter your existing password to verify ownership and link exhibitor privileges"
                        : "Minimum 8 characters"}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                    {isOrganizerUpgrading
                      ? "Confirm Account Password"
                      : "Confirm Password"}{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder={
                        isOrganizerUpgrading
                          ? "Confirm your account password"
                          : "Confirm your password"
                      }
                      className={getInputClass("confirmPassword", "pr-11")}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {hasFieldError("confirmPassword") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {getFieldError("confirmPassword")}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <fieldset>
                  <legend className="mb-2 block text-sm font-semibold text-slate-600">
                    Gender <span className="text-red-500">*</span>
                  </legend>

                  <div className="flex gap-6">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={handleChange}
                        className="h-4 w-4 accent-orange-500"
                      />

                      <span className="text-sm text-slate-600">Male</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={handleChange}
                        className="h-4 w-4 accent-orange-500"
                      />

                      <span className="text-sm text-slate-600">Female</span>
                    </label>
                  </div>

                  {hasFieldError("gender") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {getFieldError("gender")}
                    </p>
                  )}
                </fieldset>

                {/* Categories */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                    Categories <span className="text-red-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowCategories(true)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${
                      hasFieldError("categories")
                        ? "border-red-400 bg-red-50/50"
                        : "border-slate-300 bg-slate-50 hover:border-slate-400"
                    }`}
                  >
                    <span
                      className={
                        selectedCategories.length
                          ? "font-semibold text-slate-800"
                          : "text-slate-400"
                      }
                    >
                      {selectedCategories.length
                        ? `${selectedCategories.length} Categories Selected`
                        : "Select Products"}
                    </span>

                    <span className="text-xs font-bold text-orange-600">
                      Select →
                    </span>
                  </button>

                  {/* Selected categories */}
                  {selectedCategories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedCategories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold text-orange-800"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}

                  {hasFieldError("categories") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {getFieldError("categories")}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="border-t border-slate-200 pt-5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setTermsAccepted(checked);
                        if (validationErrors.termsAccepted) {
                          if (checked) {
                            setValidationErrors((prev) => {
                              const next = { ...prev };
                              delete next.termsAccepted;
                              return next;
                            });
                          } else {
                            setValidationErrors((prev) => ({
                              ...prev,
                              termsAccepted:
                                "Please accept the Terms & Conditions",
                            }));
                          }
                        }
                        setError("");
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-orange-500"
                    />

                    <span className="text-xs leading-relaxed text-slate-500">
                      By clicking Submit, you are accepting our{" "}
                      <Link
                        to="/terms-conditions"
                        className="font-semibold text-orange-600 hover:underline"
                      >
                        Terms & Conditions
                      </Link>
                    </span>
                  </label>

                  {hasFieldError("termsAccepted") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {getFieldError("termsAccepted")}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Processing..."
                  : isOrganizerUpgrading
                    ? "Activate Exhibitor Access"
                    : "Submit"}
              </button>

              {/* Login Link */}
              {!isOrganizerUpgrading && (
                <p className="mt-5 text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-orange-600 hover:underline"
                  >
                    Login
                  </Link>
                </p>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Category Modal */}
      {showCategories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Select Categories
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select the products you are interested in.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCategories(false)}
                className="text-xl font-bold text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {/* Categories */}
            <div className="grid max-h-[55vh] grid-cols-1 gap-3 overflow-y-auto p-6 sm:grid-cols-2 md:grid-cols-3">
              {CATEGORIES_LIST.map((category) => {
                const selected = selectedCategories.includes(category);

                return (
                  <label
                    key={category}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-xs font-medium transition ${
                      selected
                        ? "border-orange-400 bg-orange-50 text-orange-800"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 accent-orange-500"
                    />

                    <span>{category}</span>
                  </label>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <span className="text-xs font-semibold text-slate-500">
                {selectedCategories.length} Selected
              </span>

              <button
                type="button"
                onClick={() => setShowCategories(false)}
                className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Registration;
