import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
...previousForm,
      [name]: type === "checkbox"? checked: value,
    }));

    if (error) {
      setError("");
    }
  };

  const getToken = () => {
    return (
      localStorage.getItem("hr_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")
    );
  };

  const getRoleFromToken = () => {
    try {
      const token = getToken();

      if (!token) return null;

      const tokenParts = token.split(".");

      if (tokenParts.length!== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));

      return payload?.role || payload?.user?.role || null;
    } catch {
      return null;
    }
  };

  const redirectUser = (role) => {
    const normalizedRole = String(role || "").toUpperCase();

    if (normalizedRole === "LANDLORD") {
      navigate("/landlord/dashboard", { replace: true });
    } else if (normalizedRole === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = form.email.trim();
    const password = form.password.trim();

    if (!email ||!password) {
      setError("Please enter your email address and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await login({
...form,
        email,
        password,
      });

      const role =
        response?.user?.role ||
        response?.role ||
        response?.data?.user?.role ||
        response?.data?.role ||
        getRoleFromToken();

      redirectUser(role);
    } catch (loginError) {
      console.error("LOGIN ERROR:", loginError);

      const serverMessage =
        loginError?.response?.data?.error ||
        loginError?.response?.data?.message ||
        loginError?.message;

      setError(
        serverMessage || "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020617] px-4 py-8 font-sans text-slate-800 selection:bg-yellow-500 selection:text-[#022036] sm:px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#075985_0%,#020617_42%,#000814_100%)]" />

      {/* Neon Top Glow */}
      <div className="pointer-events-none absolute -top-56 left-1/2 h-[500px] w-[950px] -translate-x-1/2 rounded-full bg-blue-600/40 blur-[140px]" />

      {/* Neon Left Glow */}
      <div className="pointer-events-none absolute -left-48 top-1/4 h-[700px] w-[550px] rounded-full bg-cyan-500/30 blur-[140px]" />

      {/* Neon Bottom Glow */}
      <div className="pointer-events-none absolute -bottom-64 left-1/2 h-[520px] w-[950px] -translate-x-1/2 rounded-full bg-blue-700/40 blur-[150px]" />

      {/* Right Accent */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-indigo-600/20 blur-[140px]" />

      {/* Decorative Light Lines */}
      <div className="pointer-events-none absolute left-0 top-1/3 h-px w-1/2 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent blur-sm" />
      <div className="pointer-events-none absolute bottom-1/4 right-0 h-px w-1/2 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent blur-sm" />

      {/* Main Login Card */}
      <section className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-white shadow-[0_0_90px_rgba(14,165,233,0.28)] lg:grid-cols-2">
        {/* LEFT NEON PANEL */}
        <div className="relative hidden min-h-[700px] overflow-hidden bg-[#001b44] lg:block">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85"
            alt="Modern rental home"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-25 transition-transform duration-1000 hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#001b44]/95 via-[#003b82]/80 to-[#020617]/95" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,183,255,0.55),transparent_32%),radial-gradient(circle_at_75%_60%,rgba(37,99,235,0.45),transparent_38%)]" />

          {/* Decorative Neon Circles */}
          <div className="absolute -left-24 top-20 h-64 w-64 rounded-full border border-cyan-300/30 shadow-[0_0_45px_rgba(34,211,238,0.35)]" />
          <div className="absolute -left-14 top-32 h-44 w-44 rounded-full border border-blue-400/30" />
          <div className="absolute bottom-16 right-[-80px] h-72 w-72 rounded-full border border-blue-300/25 shadow-[0_0_55px_rgba(59,130,246,0.35)]" />

          {/* Neon Diamond */}
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2rem] border-2 border-cyan-300/60 shadow-[0_0_22px_rgba(34,211,238,0.9),inset_0_0_22px_rgba(34,211,238,0.35)]" />

          <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-2xl border border-blue-200/70 shadow-[0_0_35px_rgba(96,165,250,0.9)]" />

          {/* Platform Badge */}
          <div className="absolute left-8 top-8 flex items-center gap-2 rounded-full border border-cyan-300/25 bg-blue-950/40 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(14,165,233,0.25)] backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
            HouseRentalSystem
          </div>

          {/* Left Content */}
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/30 bg-cyan-400/20 text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.45)] backdrop-blur-md">
              <Home size={29} strokeWidth={2.5} />
            </div>

            <h2 className="max-w-md text-4xl font-black leading-tight">
              Find a place you can{" "}
              <span className="text-cyan-300 drop-shadow-[0_0_12px_rgba(103,232,249,0.8)]">
                call home.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm font-light leading-7 text-blue-100/80">
              Discover trusted rental properties, connect with verified
              landlords, and manage your rental journey from one secure
              platform.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Verified rental properties",
                "Simple tenant and landlord communication",
                "Secure account management",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2.5 text-xs font-medium text-blue-100"
                >
                  <CheckCircle2
                    size={16}
                    className="text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]"
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="flex min-h-[700px] flex-col justify-center bg-white p-7 sm:p-12 lg:p-16">
          {/* Mobile Branding */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-[#022036] shadow-md">
              <Home size={25} strokeWidth={2.5} />
            </div>

            <div>
              <strong className="block text-sm font-black text-[#022036]">
                HouseRentalSystem
              </strong>

              <span className="text-[9px] font-black uppercase tracking-widest text-yellow-600">
                Find. Rent. Live.
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-5 hidden h-14 w-14 items-center justify-center rounded-2xl border border-yellow-200 bg-yellow-50 shadow-sm lg:flex">
              {!logoError? (
                <img
                  src="/download.png"
                  alt="HouseRentalSystem logo"
                  className="h-8 w-8 object-contain"
                  onError={() => setLogoError(true)}
                />
              ): (
                <Home size={28} className="text-yellow-600" />
              )}
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#022036]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm font-light text-slate-500">
              Sign in to continue to your rental account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-700"
              >
                Email address
              </label>

              <div className="group relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-yellow-600"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-yellow-500 focus:bg-white focus:ring-4 focus:ring-yellow-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-extrabold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
              </div>

              <div className="group relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-yellow-600"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword? "text": "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-yellow-500 focus:bg-white focus:ring-4 focus:ring-yellow-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) =>!previous)}
                  aria-label={showPassword? "Hide password": "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword? (
                    <EyeOff size={18} />
                  ): (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
{/* Remember Me + Forgot Password */}
<div className="flex items-center justify-between">
  <label className="group flex cursor-pointer items-center gap-2.5">
    <input
      type="checkbox"
      name="rememberMe"
      checked={form.rememberMe}
      onChange={handleChange}
      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-yellow-500 focus:ring-yellow-500"
    />

    <span className="text-xs font-semibold text-slate-600 transition-colors group-hover:text-slate-900">
      Keep me signed in
    </span>
  </label>

  <Link
    to="/forgot-password"
    className="text-xs font-bold text-yellow-600 transition-colors hover:text-yellow-700 hover:underline"
  >
    Forgot password?
  </Link>
</div>


            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold leading-5 text-rose-700"
              >
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white">
!
                </span>

                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#022036] px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_25px_rgba(2,32,54,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#043658] hover:shadow-[0_12px_35px_rgba(14,165,233,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {!loading && (
                <span className="absolute inset-y-0 -left-24 w-16 -skew-x-12 bg-white/25 transition-all duration-700 group-hover:left-[120%]" />
              )}

              {loading? (
                <span className="relative flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-cyan-300" />
                  <span>Authenticating...</span>
                </span>
              ): (
                <span className="relative flex items-center gap-3">
                  <span>Sign in securely</span>

                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500 text-[#022036] transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-yellow-400">
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </span>
                </span>
              )}
            </button>

            {/* Security Message */}
            <div className="flex items-center justify-center gap-2 pt-1 text-[10px] font-semibold text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              Your account information is protected
            </div>
          </form>

          {/* Register Link */}
<div className="mt-9 border-t border-slate-100 pt-6 text-center">
  <p className="text-xs font-medium text-slate-500">
    Do not have an account yet?
    <Link
      to="/register"
      className="ml-1 font-extrabold text-yellow-600 transition-colors hover:text-yellow-700 hover:underline"
    >
      Create your account
    </Link>
  </p>
</div>
        </div>
      </section>
    </main>
  );
}
