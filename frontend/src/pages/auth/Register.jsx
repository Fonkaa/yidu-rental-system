import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Home,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const countries = [
    { code: "ET", name: "Ethiopia", dial: "+251" },
    { code: "KE", name: "Kenya", dial: "+254" },
    { code: "UG", name: "Uganda", dial: "+256" },
    { code: "TZ", name: "Tanzania", dial: "+255" },
    { code: "SO", name: "Somalia", dial: "+252" },
    { code: "ER", name: "Eritrea", dial: "+291" },
    { code: "DJ", name: "Djibouti", dial: "+253" },
    { code: "RW", name: "Rwanda", dial: "+250" },
    { code: "SS", name: "South Sudan", dial: "+211" },
    { code: "SD", name: "Sudan", dial: "+249" },
    { code: "NG", name: "Nigeria", dial: "+234" },
    { code: "GH", name: "Ghana", dial: "+233" },
    { code: "ZA", name: "South Africa", dial: "+27" },
    { code: "EG", name: "Egypt", dial: "+20" },
    { code: "MA", name: "Morocco", dial: "+212" },
    { code: "AE", name: "United Arab Emirates", dial: "+971" },
    { code: "SA", name: "Saudi Arabia", dial: "+966" },
    { code: "IN", name: "India", dial: "+91" },
    { code: "CN", name: "China", dial: "+86" },
    { code: "JP", name: "Japan", dial: "+81" },
    { code: "GB", name: "United Kingdom", dial: "+44" },
    { code: "DE", name: "Germany", dial: "+49" },
    { code: "FR", name: "France", dial: "+33" },
    { code: "US", name: "United States", dial: "+1" },
    { code: "CA", name: "Canada", dial: "+1" },
    { code: "AU", name: "Australia", dial: "+61" },
  ];

  const getFlagUrl = (code) =>
    `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountries, setShowCountries] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "TENANT",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
...previous,
      [name]: type === "checkbox"? checked: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setShowCountries(false);

    setForm((previous) => ({
...previous,
      phone: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!fullName ||!email ||!phone) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password!== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName,
        email,
        phone: `${selectedCountry.dial}${phone}`,
        password: form.password,
        role: form.role,
      });

      setSuccess("Account created successfully. Redirecting...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (registerError) {
      console.error("REGISTER ERROR:", registerError);

      setError(
        registerError?.response?.data?.error ||
          registerError?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-3 py-5 font-sans text-slate-800 selection:bg-yellow-500 selection:text-[#022036] sm:px-5">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#075985_0%,#020617_44%,#000814_100%)]" />
      <div className="pointer-events-none absolute -top-52 left-1/2 h-[430px] w-[850px] -translate-x-1/2 rounded-full bg-blue-600/35 blur-[130px]" />
      <div className="pointer-events-none absolute -left-48 top-1/4 h-[600px] w-[450px] rounded-full bg-cyan-500/25 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-56 left-1/2 h-[430px] w-[850px] -translate-x-1/2 rounded-full bg-blue-700/35 blur-[140px]" />

      {/* Main Card */}
      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[1.7rem] border border-cyan-300/20 bg-white shadow-[0_0_70px_rgba(14,165,233,0.25)] lg:grid-cols-2">
        {/* LEFT PANEL */}
        <div className="relative hidden min-h-[620px] overflow-hidden bg-[#001b44] lg:block">
          <img
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=85"
            alt="HouseRentalSystem"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#001b44]/95 via-[#003b82]/80 to-[#020617]/95" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,183,255,0.55),transparent_32%),radial-gradient(circle_at_75%_60%,rgba(37,99,235,0.4),transparent_38%)]" />

          {/* Decorative Neon Shapes */}
          <div className="absolute -left-24 top-16 h-56 w-56 rounded-full border border-cyan-300/30 shadow-[0_0_40px_rgba(34,211,238,0.35)]" />

          <div className="absolute bottom-10 right-[-70px] h-64 w-64 rounded-full border border-blue-300/25 shadow-[0_0_50px_rgba(59,130,246,0.35)]" />

          <div className="absolute left-1/2 top-[38%] h-24 w-24 -translate-x-1/2 rotate-45 rounded-[1.5rem] border-2 border-cyan-300/60 shadow-[0_0_25px_rgba(34,211,238,0.8)]" />

          {/* Brand */}
          <div className="absolute left-7 top-7 flex items-center gap-2 rounded-full border border-cyan-300/25 bg-blue-950/40 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
            HouseRentalSystem
          </div>

          {/* Compact Marketing Copy */}
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/30 bg-cyan-400/20 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.4)]">
              <Home size={25} />
            </div>

            <h2 className="max-w-sm text-3xl font-black leading-tight">
            
       Don't have an account?  Register now to find your  
              <br />
              <span className="text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]">
                home and perfectaccess all rental services.
              </span>
            </h2>

            <p className="mt-3 max-w-sm text-xs font-light leading-6 text-blue-100/80">
              Find trusted homes, connect with verified
                landlords, and rent with confidence.
            </p>

            <div className="mt-5 space-y-2">
              {[
                "Trusted rental homes",
                "Verified landlords",
                "Simple rental management",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-[11px] font-medium text-blue-100"
                >
                  <CheckCircle2 size={14} className="text-cyan-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REGISTER FORM */}
        <div className="flex min-h-[620px] flex-col justify-center bg-white p-5 sm:p-8 lg:p-10">
          {/* Mobile Brand */}
          <div className="mb-5 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 text-[#022036] shadow-md">
              <Home size={22} />
            </div>

            <div>
              <strong className="block text-sm font-black text-[#022036]">
                HouseRentalSystem
              </strong>
              <span className="text-[8px] font-black uppercase tracking-widest text-yellow-600">
                Find. Rent. Live.
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-5 text-center lg:text-left">
            <div className="mb-3 hidden h-11 w-11 items-center justify-center rounded-xl border border-yellow-200 bg-yellow-50 lg:flex">
              {!logoError? (
                <img
                  src="/download.png"
                  alt="HouseRentalSystem logo"
                  className="h-7 w-7 object-contain"
                  onError={() => setLogoError(true)}
                />
              ): (
                <Home size={23} className="text-yellow-600" />
              )}
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#022036] sm:text-3xl">
              Create your account
            </h1>

            <p className="mt-1 text-xs font-light text-slate-500 sm:text-sm">
              Start your journey with HouseRentalSystem
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-slate-700"
              >
                Full name
              </label>

              <div className="group relative">
                <User
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-600"
                />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-yellow-500 focus:bg-white focus:ring-4 focus:ring-yellow-500/10 sm:text-sm"
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-slate-700"
                >
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-600"
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-yellow-500 focus:bg-white focus:ring-4 focus:ring-yellow-500/10 sm:text-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-slate-700"
                >
                  Phone number
                </label>

                <div className="flex rounded-lg border border-slate-200 bg-slate-50 transition-all focus-within:border-yellow-500 focus-within:ring-4 focus-within:ring-yellow-500/10">
                  <button
                    type="button"
                    onClick={() => setShowCountries((previous) =>!previous)}
                    className="flex h-[42px] items-center gap-1 border-r border-slate-200 px-2 transition-colors hover:bg-slate-100"
                  >
                    <img
                      src={getFlagUrl(selectedCountry.code)}
                      alt={selectedCountry.name}
                      className="h-3.5 w-5 rounded-sm object-cover"
                    />

                    <span className="text-[10px] font-bold text-slate-700">
                      {selectedCountry.dial}
                    </span>

                    <ChevronDown
                      size={12}
                      className={`text-slate-500 transition-transform ${
                        showCountries? "rotate-180": ""
                      }`}
                    />
                  </button>

                  <div className="relative flex min-w-0 flex-1 items-center">
                    <Phone
                      size={14}
                      className="pointer-events-none absolute left-2 text-slate-400"
                    />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="912 345 678"
                      autoComplete="tel"
                      required
                      className="min-w-0 w-full bg-transparent py-2.5 pl-7 pr-2 text-xs font-mono text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                    />
                  </div>
                </div>

                {showCountries && (
                  <div className="absolute left-0 right-0 top-[68px] z-50 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-2xl">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountryChange(country)}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-slate-100"
                      >
                        <img
                          src={getFlagUrl(country.code)}
                          alt={country.name}
                          className="h-3.5 w-5 rounded-sm object-cover"
                        />

                        <span className="flex-1 font-medium text-slate-700">
                          {country.name}
                        </span>

                        <span className="font-bold text-slate-500">
                          {country.dial}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>

              <div className="group relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-600"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword? "text": "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-yellow-500 focus:bg-white focus:ring-4 focus:ring-yellow-500/10 sm:text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) =>!previous)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword? "Hide password": "Show password"}
                >
                  {showPassword? (
                    <EyeOff size={16} />
                  ): (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-slate-700"
              >
                Confirm password
              </label>

              <div className="group relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-600"
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword? "text": "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-yellow-500 focus:bg-white focus:ring-4 focus:ring-yellow-500/10 sm:text-sm"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) =>!previous)
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={
                    showConfirmPassword
? "Hide confirm password"
: "Show confirm password"
                  }
                >
                  {showConfirmPassword? (
                    <EyeOff size={16} />
                  ): (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-slate-700"
              >
                Account type
              </label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all focus:border-yellow-500 focus:bg-white focus:ring-4 focus:ring-yellow-500/10 sm:text-sm"
              >
                               <option value="TENANT">Tenant (Looking for a home)</option>
                <option value="LANDLORD">Landlord (Listing properties)</option>
              </select>
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-2 pt-1">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 accent-yellow-500"
              />

              <span className="text-[10px] leading-4 text-slate-500 sm:text-xs">
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="font-bold text-yellow-600 hover:underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="font-bold text-yellow-600 hover:underline"
                >
                  Privacy Policy
                </Link>
.
              </span>
            </label>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-center text-[11px] font-semibold text-rose-700"
              >
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                role="status"
                className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-center text-[11px] font-semibold text-emerald-700"
              >
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-1 flex w-full items-center justify-center overflow-hidden rounded-lg bg-[#022036] px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#043658] hover:shadow-[0_10px_28px_rgba(14,165,233,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {!loading && (
                <span className="absolute inset-y-0 -left-24 w-16 -skew-x-12 bg-white/25 transition-all duration-700 group-hover:left-[120%]" />
              )}

              {loading? (
                <span className="relative flex items-center gap-2.5">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-cyan-300" />
                  Creating account...
                </span>
              ): (
                <span className="relative flex items-center gap-2.5">
                  Create account securely
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow-500 text-[#022036] transition-transform group-hover:translate-x-1">
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </span>
                </span>
              )}
            </button>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[9px] font-semibold text-slate-400">
              <ShieldCheck size={12} className="text-emerald-500" />
              Your information is protected
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-extrabold text-yellow-600 hover:underline"
              >
                Sign in securely
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}