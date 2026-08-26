import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { forgotPassword, resetPassword } from "../../services/authService";
import { Home, Mail, Lock, KeyRound, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Enter OTP & New Password
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Step 1: Request OTP Email
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      setSuccess(
        response?.message ||
          "An OTP verification code has been sent to your email."
      );
      setStep(2); // Switches view to show OTP & New Password fields
    } catch (err) {
      console.error("FORGOT PASSWORD ERROR:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await resetPassword({ email, otpCode, newPassword });
      setSuccess(response?.message || "Password successfully reset!");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to reset password. Check your OTP code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-sans bg-slate-50 text-slate-900 selection:bg-[#FFC107] selection:text-[#022036]">
      {/* LEFT BRAND */}
      <section className="hidden lg:flex flex-col justify-between p-12 bg-[#022036] text-white border-r border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFC107] text-[#022036] flex items-center justify-center font-black text-lg shadow-md">
            <Home size={22} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">HouseRental</span>
        </div>

        <div className="space-y-6 max-w-md">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFC107] block">
            SECURE YOUR ACCOUNT
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Get back
            <br />
            into your account.
          </h1>

          <p className="text-xs text-slate-300 font-light leading-relaxed">
            Forgot your password? No problem. Enter the email
            address connected to your HouseRental account and
            securely reset your password.
          </p>

          <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2.5">
              <span className="text-[#FFC107] font-bold">✓</span>
              <strong className="text-white">Secure password recovery</strong>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[#FFC107] font-bold">✓</span>
              <strong className="text-white">Protected account information</strong>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[#FFC107] font-bold">✓</span>
              <strong className="text-white">Simple and secure process</strong>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          © 2026 HouseRental. All rights reserved.
        </div>
      </section>

      {/* RIGHT SECTION */}
      <section className="flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md">

          {/* MOBILE LOGO */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#022036] flex items-center justify-center font-black text-sm">
              <Home size={18} />
            </div>
            <span className="font-bold text-[#022036]">HouseRental</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">

            {/* HEADER */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block">
                PASSWORD RECOVERY
              </span>

              <h2 className="text-xl font-black text-[#022036] tracking-tight">
                {step === 1 ? "Forgot your password?" : "Enter OTP & New Password"}
              </h2>

              <p className="text-xs text-slate-500 font-light">
                {step === 1
                  ? "Enter your email address and we'll help you reset your password securely."
                  : `Enter the 6-digit OTP sent to ${email} and set your new password.`}
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="p-4 rounded-2xl text-xs flex items-center gap-2 border font-semibold bg-rose-50 border-rose-200 text-rose-700">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="p-4 rounded-2xl text-xs flex items-center gap-2 border font-semibold bg-emerald-50 border-emerald-200 text-emerald-800">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* STEP 1: EMAIL FORM */}
            {step === 1 && (
              <form className="space-y-4" onSubmit={handleRequestOTP}>
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                    Email address
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 font-bold text-xs">@</span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FFC107] font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#FFC107', color: '#022036' }}
                  className="w-full py-3.5 hover:bg-[#ffcd38] font-black rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP & NEW PASSWORD FORM */}
            {step === 2 && (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div className="space-y-1">
                  <label htmlFor="otpCode" className="block text-xs font-bold text-slate-700">
                    6-Digit OTP Code
                  </label>
                  <div className="relative flex items-center">
                    <KeyRound size={16} className="absolute left-3.5 text-slate-400" />
                    <input
                      id="otpCode"
                      name="otpCode"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm tracking-widest text-[#022036] font-bold font-mono focus:outline-none focus:border-[#FFC107]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="newPassword" className="block text-xs font-bold text-slate-700">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-3.5 text-slate-400" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#FFC107]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#FFC107', color: '#022036' }}
                  className="w-full py-3.5 hover:bg-[#ffcd38] font-black rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Verify & Reset Password
                      <span>→</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-transparent border-none text-amber-600 cursor-pointer text-xs font-bold hover:underline"
                  >
                    Didn't receive code? Re-enter email
                  </button>
                </div>
              </form>
            )}

            {/* BACK TO LOGIN */}
            <div>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors">
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </div>

            {/* SECURITY */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                ✓
              </span>
              <span>Your information is securely protected.</span>
            </div>

          </div>

          <div className="pt-8 text-center text-[10px] text-slate-400 lg:hidden">
            © 2026 HouseRental. All rights reserved.
          </div>
        </div>
      </section>
    </main>
  );
}