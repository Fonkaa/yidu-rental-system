import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Users,
  Heart,
  Save,
  Edit3,
  X,
  Loader2,
} from "lucide-react";

import {
  getMyProfile,
  updateMyProfile,
} from "../../services/profileService";

import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    faydaNumber: "",
    gender: "",
    maritalStatus: "",
    familyNumber: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyProfile();

        const user = response?.user;

        if (!user) {
          throw new Error("Profile information not found");
        }

        setProfile(user);

        setForm({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          faydaNumber: user.faydaNumber || "",
          gender: user.gender || "",
          maritalStatus: user.maritalStatus || "",
          familyNumber:
            user.familyNumber !== null &&
            user.familyNumber !== undefined
              ? String(user.familyNumber)
              : "",
        });
      } catch (err) {
        console.error("LOAD PROFILE ERROR:", err);

        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setEditing(true);
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {
    if (!profile) return;

    setForm({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      faydaNumber: profile.faydaNumber || "",
      gender: profile.gender || "",
      maritalStatus: profile.maritalStatus || "",
      familyNumber:
        profile.familyNumber !== null &&
        profile.familyNumber !== undefined
          ? String(profile.familyNumber)
          : "",
    });

    setError("");
    setEditing(false);
  };

  // ==========================================
  // SAVE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updateMyProfile({
        fullName: form.fullName,
        phone: form.phone,
        faydaNumber: form.faydaNumber,
        gender: form.gender,
        maritalStatus: form.maritalStatus,
        familyNumber:
          form.familyNumber === ""
            ? null
            : Number(form.familyNumber),
      });

      const updatedUser = response?.user;

      if (!updatedUser) {
        throw new Error("Invalid profile response");
      }

      setProfile(updatedUser);

      setForm({
        fullName: updatedUser.fullName || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        faydaNumber: updatedUser.faydaNumber || "",
        gender: updatedUser.gender || "",
        maritalStatus: updatedUser.maritalStatus || "",
        familyNumber:
          updatedUser.familyNumber !== null &&
          updatedUser.familyNumber !== undefined
            ? String(updatedUser.familyNumber)
            : "",
      });

      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);

      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 size={24} className="profile-spinner" />
        <span>Loading profile...</span>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          {error}
        </div>
      </div>
    );
  }

  // ==========================================
  // MASK FAYDA
  // ==========================================

  const maskFayda = (value) => {
    if (!value) return "Not provided";

    const clean = String(value).replace(/\s/g, "");

    if (clean.length <= 4) {
      return "****";
    }

    if (clean.length <= 8) {
      return `${clean.slice(0, 4)} ****`;
    }

    return `${clean.slice(0, 4)} **** ${clean.slice(-4)}`;
  };

  // ==========================================
  // INITIALS
  // ==========================================

  const initials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TN";

  return (
    <div className="profile-page">

      {/* PAGE HEADER */}

      <div className="profile-page-header">
        <h1>My Profile</h1>

        <p>
          Manage your personal information and tenant details.
        </p>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="profile-success">
          {success}
        </div>
      )}

      {/* ERROR */}

      {error && profile && (
        <div className="profile-error">
          {error}
        </div>
      )}

      {/* MAIN PROFILE CARD */}

      <div className="profile-card">

        {/* COVER */}

        <div className="profile-cover">

          <div className="profile-cover-content">

            <div className="profile-avatar">
              {initials}
            </div>

            <div>
              <h2 className="profile-name">
                {profile?.fullName || "Tenant"}
              </h2>

              <p className="profile-role">
                {profile?.role || "TENANT"}
              </p>
            </div>

          </div>

        </div>

        {/* VIEW MODE */}

        {!editing ? (
          <div className="profile-content">

            <div className="profile-section-header">

              <div>
                <h2 className="profile-section-title">
                  Personal Information
                </h2>

                <p className="profile-section-description">
                  Information used for your rental requests.
                </p>
              </div>

              <button
                type="button"
                onClick={handleEdit}
                className="profile-edit-btn"
              >
                <Edit3 size={17} />
                Edit Profile
              </button>

            </div>

            <div className="profile-info-grid">

              <InfoItem
                icon={<User size={20} />}
                label="Full Name"
                value={profile?.fullName}
              />

              <InfoItem
                icon={<Mail size={20} />}
                label="Email"
                value={profile?.email}
              />

              <InfoItem
                icon={<Phone size={20} />}
                label="Phone"
                value={profile?.phone}
              />

              <InfoItem
                icon={<CreditCard size={20} />}
                label="Fayda Number"
                value={maskFayda(profile?.faydaNumber)}
              />

              <InfoItem
                icon={<User size={20} />}
                label="Gender"
                value={profile?.gender}
              />

              <InfoItem
                icon={<Heart size={20} />}
                label="Marital Status"
                value={profile?.maritalStatus}
              />

              <InfoItem
                icon={<Users size={20} />}
                label="Family Number"
                value={
                  profile?.familyNumber !== null &&
                  profile?.familyNumber !== undefined
                    ? profile.familyNumber
                    : "Not provided"
                }
              />

            </div>

          </div>
        ) : (

          /* EDIT MODE */

          <form
            className="profile-content profile-form"
            onSubmit={handleSubmit}
          >

            <div className="profile-section-header">

              <div>
                <h2 className="profile-section-title">
                  Edit Profile
                </h2>

                <p className="profile-section-description">
                  Update your tenant information.
                </p>
              </div>

            </div>

            <div className="profile-form-grid">

              {/* FULL NAME */}

              <div className="profile-form-group">

                <label className="profile-form-label">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="profile-input"
                  placeholder="Enter your full name"
                />

              </div>

              {/* EMAIL */}

              <div className="profile-form-group">

                <label className="profile-form-label">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="profile-input"
                />

                <span className="profile-help-text">
                  Email cannot be changed here.
                </span>

              </div>

              {/* PHONE */}

              <div className="profile-form-group">

                <label className="profile-form-label">
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="09XXXXXXXX"
                  className="profile-input"
                />

              </div>

              {/* FAYDA */}

              <div className="profile-form-group">

                <label className="profile-form-label">
                  Fayda Number
                </label>

                <input
                  type="text"
                  name="faydaNumber"
                  value={form.faydaNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012"
                  className="profile-input"
                />

              </div>

              {/* GENDER */}

              <div className="profile-form-group">

                <label className="profile-form-label">
                  Gender
                </label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="profile-select"
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>
                </select>

              </div>

              {/* MARITAL STATUS */}

              <div className="profile-form-group">

                <label className="profile-form-label">
                  Marital Status
                </label>

                <select
                  name="maritalStatus"
                  value={form.maritalStatus}
                  onChange={handleChange}
                  className="profile-select"
                >
                  <option value="">
                    Select marital status
                  </option>

                  <option value="Single">
                    Single
                  </option>

                  <option value="Married">
                    Married
                  </option>
                </select>

              </div>

              {/* FAMILY NUMBER */}

              <div className="profile-form-group">

                <label className="profile-form-label">
                  Family Number
                </label>

                <input
                  type="number"
                  name="familyNumber"
                  value={form.familyNumber}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 4"
                  className="profile-input"
                />

              </div>

            </div>

            {/* ACTIONS */}

            <div className="profile-form-actions">

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="profile-cancel-btn"
              >
                <X size={18} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="profile-save-btn"
              >

                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="profile-spinner"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}

              </button>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}

// ==========================================
// INFORMATION ITEM
// ==========================================

function InfoItem({ icon, label, value }) {
  return (
    <div className="profile-info-item">

      <div className="profile-info-icon">
        {icon}
      </div>

      <div className="profile-info-text">

        <p className="profile-info-label">
          {label}
        </p>

        <p className="profile-info-value">
          {value || "Not provided"}
        </p>

      </div>

    </div>
  );
}