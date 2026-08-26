import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please fill in both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await login(form);

      // Robust role check: check response object, fallback to context user, or decode from localStorage if needed
      const userRole = response?.user?.role || response?.role || user?.role;

      // Ensure token exists in response or localStorage
      const hasToken = response?.token || localStorage.getItem('hr_token') || localStorage.getItem('token') || localStorage.getItem('accessToken');

      if (hasToken || response) {
        if (userRole === "LANDLORD") {
          navigate("/landlord/dashboard", { replace: true });
        } else if (userRole === "ADMIN") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true }); // Tenant Dashboard
        }
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        (err.response && err.response.data && (err.response.data.error || err.response.data.message)) ||
        err.message ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 text-slate-800 relative overflow-hidden px-4 py-8 font-sans selection:bg-yellow-500 selection:text-[#022036]">
      {/* Luxury Ambient Lighting Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10">
        
        {/* LEFT - Cinematic Image Panel */}
        <div className="relative hidden lg:block overflow-hidden bg-gradient-to-br from-[#022036] to-[#043658]">
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80" 
            alt="Luxury Home" 
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#022036] via-[#022036]/60 to-transparent"></div>

          {/* Top Badge */}
          <div className="absolute top-8 left-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span>Teamwork IT Solution Platform</span>
          </div>

          {/* Caption */}
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <h2 className="text-3xl font-black leading-tight mb-3">
              Find your <span className="text-yellow-400">dream rental</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              Experience premium properties with verified landlords & secure contracts tailored for you.
            </p>
          </div>
        </div>

        {/* RIGHT - Form Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-50 border border-yellow-200 mb-4 shadow-xs">
              <img 
                src="/download.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#022036] tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your House Rental account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 transition-all font-mono"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between text-sm py-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 bg-slate-50 text-yellow-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-yellow-500"
                />
                <span className="text-slate-600 group-hover:text-slate-900 transition-colors text-xs font-semibold">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-yellow-600 hover:underline font-bold">
                Forgot password?
              </Link>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs text-center font-semibold">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] text-[#022036] font-extrabold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer uppercase tracking-wider text-xs"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#022036] border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-xs">Signing In...</span>
                </>
              ) : (
                <>
                  <span className="text-xs">Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{" "}
              <Link to="/register" className="text-yellow-600 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}