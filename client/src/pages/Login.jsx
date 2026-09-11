import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth, showSuccessMessage } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const [infoMessage, setInfoMessage] = useState(location.state?.message || "");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || "",
  );

  useEffect(() => {
    if (location.state?.successMessage) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const errors = {};

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Allow users with exhibitor or organizer roles.
      // Admin has a separate /admin/login page.
      const hasAllowedRole =
        data.user.roles?.includes("exhibitor") ||
        data.user.roles?.includes("organizer") ||
        data.user.role === "exhibitor" ||
        data.user.role === "organizer";

      if (!hasAllowedRole) {
        setServerError(
          "This login is for exhibitor and organizer accounts. Please use the appropriate login page.",
        );
        return;
      }

      // Backend has already stored the JWT in the HttpOnly cookie.
      // Now synchronize the frontend authentication state.
      await checkAuth();

      showSuccessMessage("Login successful! Welcome back.");

      const isOnlyOrganizer =
        data.user.roles?.includes("organizer") &&
        !data.user.roles?.includes("exhibitor");

      if (isOnlyOrganizer) {
        navigate("/organizer");
      } else {
        navigate("/");
      }
    } catch (requestError) {
      setServerError(
        requestError.response?.data?.message ||
          "Unable to log in. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <form
          onSubmit={submit}
          noValidate
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm space-y-5"
        >
          {/* Header */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Exhibitor Account
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
              Log in
            </h1>

            <p className="mt-2 text-sm text-slate-500">Log in your account</p>
          </div>

          {/* Errors */}

          {infoMessage && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
              {infoMessage}
            </div>
          )}
          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </div>
          )}
          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 font-normal outline-none transition ${
                fieldErrors.email
                  ? "border-red-400 bg-red-50 focus:border-red-500"
                  : "border-slate-300 bg-slate-50 focus:border-orange-500 focus:bg-white"
              }`}
            />

            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>

            <div className="relative mt-1.5">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={`w-full rounded-lg border px-3 py-2.5 pr-10 font-normal outline-none transition ${
                  fieldErrors.password
                    ? "border-red-400 bg-red-50 focus:border-red-500"
                    : "border-slate-300 bg-slate-50 focus:border-orange-500 focus:bg-white"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>

          {/* Registration */}
          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/registration"
              className="font-bold text-orange-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
