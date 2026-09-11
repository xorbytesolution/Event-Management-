import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../services/api";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, checkAdminAuth, showSuccessMessage } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to dashboard or attempted route
  useEffect(() => {
    if (admin) {
      const destination = location.state?.from || "/admin";
      navigate(destination, { replace: true });
    }
  }, [admin, navigate, location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/admin/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const hasAdminRole =
        data.user.roles?.includes("admin") || data.user.role === "admin";

      if (!hasAdminRole) {
        setError("You do not have administrator access.");
        return;
      }

      // Synchronize AdminAuthContext state with the newly set adminAccessToken cookie
      await checkAdminAuth();

      showSuccessMessage("Admin login successful! Welcome back.");

      const destination = location.state?.from || "/admin";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to log in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm space-y-5"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage event submissions.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Email
          </label>

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Admin email"
            autoComplete="email"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Password
          </label>

          <div className="relative mt-1.5">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Admin password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 pr-10 outline-none focus:border-orange-500 focus:bg-white"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Admin Login"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
