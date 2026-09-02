import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "TENANT",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Registration failed. Please try again."
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
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80" 
            alt="Teamwork Platform" 
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
              Connect with <span className="text-yellow-400">landlords & tenants</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              Build trust through transparent communication between property owners and renters.
            </p>
          </div>
        </div>

        {/* RIGHT - Form Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          {/* Header */}
          <div className="text-center lg:text-left mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-50 border border-yellow-200 mb-3 shadow-xs">
              <img 
                src="/download.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#022036] tracking-tight">Create Account</h1>
            <p className="text-slate-500 text-sm mt-1">Join House Rental System and find your next home</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 transition-all font-medium"
              />
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+251..."
                  autoComplete="tel"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 transition-all font-mono"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-500 transition-all font-mono"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role Select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">I am a</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-yellow-500 transition-all cursor-pointer"
              >
                <option value="TENANT">Tenant (Looking for a home)</option>
                <option value="LANDLORD">Landlord (Listing properties)</option>
              </select>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs text-center font-semibold">
                {error}
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center font-semibold">
                {success}
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
                  <span className="text-xs">Creating Account...</span>
                </>
              ) : (
                <>
                  <span className="text-xs">Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Sign In Link */}
          <div className="text-center mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-yellow-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}