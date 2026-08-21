import { Link } from "react-router-dom";
import { useState } from "react";
import { forgotPassword } from "../../services/authService";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await forgotPassword(email);

      setSuccess(
        response?.message ||
          "If an account exists with this email, a password reset link has been sent."
      );

      setEmail("");
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

  return (
    <main className="forgot-page">
      {/* LEFT BRAND */}
      <section className="forgot-brand">
        <div className="brand-logo">
          <div className="brand-icon">H</div>
          <span>HouseRental</span>
        </div>

        <div className="forgot-brand-content">
          <span className="brand-label">
            SECURE YOUR ACCOUNT
          </span>

          <h1>
            Get back
            <br />
            into your account.
          </h1>

          <p>
            Forgot your password? No problem. Enter the email
            address connected to your HouseRental account and
            securely reset your password.
          </p>

          <div className="security-features">
            <div className="security-feature">
              <span>✓</span>
              <strong>Secure password recovery</strong>
            </div>

            <div className="security-feature">
              <span>✓</span>
              <strong>Protected account information</strong>
            </div>

            <div className="security-feature">
              <span>✓</span>
              <strong>Simple and secure process</strong>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          © 2026 HouseRental. All rights reserved.
        </div>
      </section>

      {/* RIGHT SECTION */}
      <section className="forgot-section">
        <div className="forgot-container">

          {/* MOBILE LOGO */}
          <div className="mobile-logo">
            <div className="brand-icon">H</div>
            <span>HouseRental</span>
          </div>

          <div className="forgot-card">

            {/* HEADER */}
            <div className="forgot-header">
              <span className="forgot-welcome">
                PASSWORD RECOVERY
              </span>

              <h2>
                Forgot your password?
              </h2>

              <p>
                Enter your email address and we'll help you
                reset your password securely.
              </p>
            </div>

            {/* FORM */}
            <form
              className="forgot-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">@</span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="forgot-error">
                  <span className="message-icon">!</span>
                  <span>{error}</span>
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="forgot-success">
                  <span className="message-icon">✓</span>
                  <span>{success}</span>
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                className="forgot-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
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

            {/* BACK TO LOGIN */}
            <div className="back-login">
              <Link to="/login">
                ← Back to sign in
              </Link>
            </div>

            {/* SECURITY */}
            <div className="security-note">
              <span className="security-icon">
                ✓
              </span>

              <span>
                Your information is securely protected.
              </span>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}