import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight
} from "lucide-react";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

      if (response && response.token && response.user) {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        (err.response && err.response.data && (err.response.data.error || err.response.data.message)) ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-login-page">
      {/* Ambient Glow */}
      <div className="ambient-glow"></div>

      {/* Split Container */}
      <div className="dark-login-container">
        {/* LEFT - Cinematic Image Panel */}
        <div className="dark-image-panel">
          <div className="image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80" 
              alt="Modern luxury home" 
              className="cinematic-image"
            />
            <div className="image-gradient-overlay"></div>

            <div className="image-top-badge">
              <span className="badge-dot"></span>
              Trusted Platform
            </div>

            <div className="image-caption">
              <h2>Find your<br />dream rental</h2>
              <p>Premium properties with verified landlords & secure contracts</p>
            </div>
          </div>
        </div>

        {/* RIGHT - Form Panel */}
        <div className="dark-form-panel">
          <div className="form-inner-content">
            {/* Header with Logo */}
            <div className="dark-header">
              <div className="login-logo-wrapper">
                <img 
                  src="/download.png" 
                  alt="House Rental System Logo" 
                  className="login-logo-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <h1 className="main-title">Login into House Rental System</h1>
            </div>

            {/* Form */}
            <form className="dark-auth-form" onSubmit={handleSubmit}>
              <div className="dark-field">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="dark-field password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="dark-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Remember & Forgot */}
              <div className="dark-options-row">
                <label className="dark-checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                  />
                  <span className="label-text">Remember me</span>
                </label>
                <Link to="/forgot-password" className="dark-forgot-link">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="dark-error-banner">
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="dark-primary-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="dark-btn-spinner"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="dark-panel-footer">
              <p>
                Don't have an account? <Link to="/register" className="highlight-link">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}