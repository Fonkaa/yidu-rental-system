import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "../../services/authService";
import "./ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        token,
        password: form.password,
      });

      setSuccess(
        response?.message ||
          "Password reset successfully. You can now sign in."
      );

      setForm({
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-page">

      {/* LEFT BRAND */}
      <section className="reset-brand">

        <div className="brand-logo">
          <div className="brand-icon">H</div>
          <span>HouseRental</span>
        </div>

        <div className="reset-brand-content">

          <span className="brand-label">
            ACCOUNT SECURITY
          </span>

          <h1>
            Create a new
            <br />
            secure password.
          </h1>

          <p>
            Choose a strong password to protect your
            HouseRental account and keep your rental
            information secure.
          </p>

          <div className="security-features">

            <div className="security-feature">
              <span>✓</span>
              <strong>At least 8 characters</strong>
            </div>

            <div className="security-feature">
              <span>✓</span>
              <strong>Keep your account protected</strong>
            </div>

            <div className="security-feature">
              <span>✓</span>
              <strong>Secure password recovery</strong>
            </div>

          </div>

        </div>

        <div className="brand-footer">
          © 2026 HouseRental. All rights reserved.
        </div>

      </section>

      {/* RIGHT */}
      <section className="reset-section">

        <div className="reset-container">

          {/* MOBILE LOGO */}
          <div className="mobile-logo">

            <div className="brand-icon">
              H
            </div>

            <span>
              HouseRental
            </span>

          </div>

          <div className="reset-card">

            {/* HEADER */}
            <div className="reset-header">

              <span className="reset-welcome">
                PASSWORD RESET
              </span>

              <h2>
                Create new password
              </h2>

              <p>
                Enter your new password below to
                secure your HouseRental account.
              </p>

            </div>

            {/* FORM */}
            <form
              className="reset-form"
              onSubmit={handleSubmit}
            >

              {/* PASSWORD */}
              <div className="form-group">

                <label htmlFor="password">
                  New password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    •
                  </span>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                  />

                </div>

              </div>

              {/* CONFIRM PASSWORD */}
              <div className="form-group">

                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    •
                  </span>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                  />

                </div>

              </div>

              {/* ERROR */}
              {error && (
                <div className="reset-error">

                  <span className="message-icon">
                    !
                  </span>

                  <span>
                    {error}
                  </span>

                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="reset-success">

                  <span className="message-icon">
                    ✓
                  </span>

                  <span>
                    {success}
                  </span>

                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                className="reset-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    Reset password
                    <span>→</span>
                  </>
                )}

              </button>

            </form>

            {/* BACK */}
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