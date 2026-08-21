import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import "./Register.css";

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
    <div className="dark-register-page">
      {/* Ambient Glow */}
      <div className="ambient-glow"></div>

      {/* Split Container */}
      <div className="dark-register-container">
        {/* LEFT - Cinematic Image Panel */}
        <div className="dark-image-panel">
          <div className="image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80" 
              alt="Two people sitting in front of a computer screen displaying the House Rental System platform" 
              className="cinematic-image"
            />
            <div className="image-gradient-overlay"></div>

            <div className="image-top-badge">
              <span className="badge-dot"></span>
              Welcome to House Rental System
            </div>

            <div className="image-caption">
              <h2>Connect with<br />landlords & tenants</h2>
              <p>Build trust through transparent communication between property owners and renters</p>
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
              <h1 className="main-title">Create Account</h1>
              <p className="sub-title">Join House Rental System and find your next home</p>
            </div>

            {/* Form */}
            <form className="dark-auth-form" onSubmit={handleSubmit}>
              <div className="dark-field">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-row">
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

                <div className="dark-field">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <div className="dark-field password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password (min 8 characters)"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="dark-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="dark-field password-field">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="dark-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="dark-field">
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="TENANT">Tenant</option>
                  <option value="LANDLORD">Landlord</option>
                </select>
              </div>

              {error && (
                <div className="dark-error-banner">
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="dark-success-banner">
                  <span>{success}</span>
                </div>
              )}

              <button type="submit" className="dark-primary-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="dark-btn-spinner"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="dark-panel-footer">
              <p>
                Already have an account? <Link to="/login" className="highlight-link">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}