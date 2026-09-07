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
  UserCircle,
  Briefcase,
  Calendar,
  MapPin,
  Shield,
  CheckCircle,
  AlertCircle,
  Camera,
} from "lucide-react";

import {
  getMyProfile,
  updateMyProfile,
} from "../../services/profileService";

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
          familyNumber: user.familyNumber !== null && user.familyNumber !== undefined ? String(user.familyNumber) : "",
        });
      } catch (err) {
        console.error("LOAD PROFILE ERROR:", err);
        setError(err.response?.data?.error || err.message || "Failed to load profile");
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
      familyNumber: profile.familyNumber !== null && profile.familyNumber !== undefined ? String(profile.familyNumber) : "",
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
        familyNumber: form.familyNumber === "" ? null : Number(form.familyNumber),
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
        familyNumber: updatedUser.familyNumber !== null && updatedUser.familyNumber !== undefined ? String(updatedUser.familyNumber) : "",
      });
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
      setError(err.response?.data?.error || err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // MASK FAYDA
  // ==========================================

  const maskFayda = (value) => {
    if (!value) return "Not provided";
    const clean = String(value).replace(/\s/g, "");
    if (clean.length <= 4) return "****";
    if (clean.length <= 8) return `${clean.slice(0, 4)} ****`;
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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#FFC107]/20 absolute animate-ping" />
          <div className="w-16 h-16 rounded-2xl bg-[#022036] text-[#FFC107] flex items-center justify-center shadow-lg relative z-10">
            <Loader2 size={28} className="animate-spin" />
          </div>
        </div>
        <p className="text-xs font-bold text-[#022036]/50 mt-4 uppercase tracking-widest animate-pulse">
          Loading Profile...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !profile) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl text-rose-700 max-w-2xl mx-auto">
          <AlertCircle size={22} className="flex-shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-amber-50/20">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#022036] text-[#FFC107] flex items-center justify-center shadow-md border-2 border-[#FFC107]/20">
            <UserCircle size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#022036] tracking-tight">
              My Profile
            </h1>
            <p className="text-xs text-[#022036]/50 font-medium">
              Manage your personal information and tenant details
            </p>
          </div>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={handleEdit}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FFC107] hover:bg-yellow-400 text-[#022036] font-black text-xs rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-[#e5ac00]"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700">
          <CheckCircle size={18} className="flex-shrink-0" />
          <span className="text-xs font-bold">{success}</span>
        </div>
      )}

      {error && profile && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border-2 border-rose-200 rounded-xl text-rose-700">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      {/* =====================================================
          PROFILE CARD
      ===================================================== */}

      <div className="bg-white border-2 border-black/20 rounded-2xl overflow-hidden shadow-sm">

        {/* COVER / HEADER */}
        <div className="relative bg-gradient-to-r from-[#022036] to-[#0a3a5c] px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#FFC107]/5 rounded-full blur-2xl" />
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-sky-500/5 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-[#FFC107] text-[#022036] flex items-center justify-center font-black text-2xl shadow-lg border-4 border-white/20">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-[#FFC107] hover:bg-yellow-400 rounded-full border-2 border-white shadow-md transition-all">
                <Camera size={12} className="text-[#022036]" />
              </button>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-black text-white">
                {profile?.fullName || "Tenant"}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFC107]/20 border border-[#FFC107]/30 rounded-full text-[10px] font-black text-[#FFC107] uppercase tracking-wider">
                  <Briefcase size={12} />
                  {profile?.role || "TENANT"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                  <Shield size={12} />
                  Verified
                </span>
              </div>
            </div>

            {!editing && (
              <div className="flex items-center gap-4 text-white/60 text-xs">
                <div className="text-center">
                  <p className="text-lg font-black text-white">0</p>
                  <p className="text-[9px] uppercase tracking-wider">Properties</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-lg font-black text-white">0</p>
                  <p className="text-[9px] uppercase tracking-wider">Requests</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-lg font-black text-white">0</p>
                  <p className="text-[9px] uppercase tracking-wider">Leases</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            VIEW MODE
        ===================================================== */}

        {!editing ? (
          <div className="p-6 sm:p-8">

            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black/10">
              <div>
                <h3 className="text-sm font-black text-[#022036] uppercase tracking-wider">
                  Personal Information
                </h3>
                <p className="text-[10px] text-[#022036]/40 mt-0.5">
                  Information used for your rental requests
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              <InfoItem
                icon={<User size={18} />}
                label="Full Name"
                value={profile?.fullName}
                color="text-sky-600"
                bg="bg-sky-50 border-sky-200"
              />

              <InfoItem
                icon={<Mail size={18} />}
                label="Email"
                value={profile?.email}
                color="text-emerald-600"
                bg="bg-emerald-50 border-emerald-200"
              />

              <InfoItem
                icon={<Phone size={18} />}
                label="Phone"
                value={profile?.phone}
                color="text-purple-600"
                bg="bg-purple-50 border-purple-200"
              />

              <InfoItem
                icon={<CreditCard size={18} />}
                label="Fayda Number"
                value={maskFayda(profile?.faydaNumber)}
                color="text-amber-600"
                bg="bg-amber-50 border-amber-200"
              />

              <InfoItem
                icon={<User size={18} />}
                label="Gender"
                value={profile?.gender || "Not specified"}
                color="text-rose-600"
                bg="bg-rose-50 border-rose-200"
              />

              <InfoItem
                icon={<Heart size={18} />}
                label="Marital Status"
                value={profile?.maritalStatus || "Not specified"}
                color="text-indigo-600"
                bg="bg-indigo-50 border-indigo-200"
              />

              <InfoItem
                icon={<Users size={18} />}
                label="Family Number"
                value={profile?.familyNumber !== null && profile?.familyNumber !== undefined ? profile.familyNumber : "Not provided"}
                color="text-teal-600"
                bg="bg-teal-50 border-teal-200"
              />

              <InfoItem
                icon={<Calendar size={18} />}
                label="Member Since"
                value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                color="text-orange-600"
                bg="bg-orange-50 border-orange-200"
              />

              <InfoItem
                icon={<MapPin size={18} />}
                label="Location"
                value="Addis Ababa, Ethiopia"
                color="text-cyan-600"
                bg="bg-cyan-50 border-cyan-200"
              />

            </div>
          </div>
        ) : (

          /* =====================================================
              EDIT MODE
          ===================================================== */

          <form className="p-6 sm:p-8" onSubmit={handleSubmit}>

            <div className="mb-6 pb-4 border-b-2 border-black/10">
              <h3 className="text-sm font-black text-[#022036] uppercase tracking-wider">
                Edit Profile
              </h3>
              <p className="text-[10px] text-[#022036]/40 mt-0.5">
                Update your tenant information
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* FULL NAME */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#022036]/70 uppercase tracking-wider">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-black/20 rounded-xl text-sm text-[#022036] focus:outline-none focus:border-[#FFC107] transition-all font-medium"
                  placeholder="Enter your full name"
                />
              </div>

              {/* EMAIL - Disabled */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#022036]/70 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-4 py-3 bg-black/5 border-2 border-black/10 rounded-xl text-sm text-[#022036]/50 cursor-not-allowed font-medium"
                />
                <p className="text-[9px] text-[#022036]/40 font-medium">
                  Email cannot be changed here
                </p>
              </div>

              {/* PHONE */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#022036]/70 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-black/20 rounded-xl text-sm text-[#022036] focus:outline-none focus:border-[#FFC107] transition-all font-medium"
                  placeholder="09XXXXXXXX"
                />
              </div>

              {/* FAYDA NUMBER */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#022036]/70 uppercase tracking-wider">
                  Fayda Number
                </label>
                <input
                  type="text"
                  name="faydaNumber"
                  value={form.faydaNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-black/20 rounded-xl text-sm text-[#022036] focus:outline-none focus:border-[#FFC107] transition-all font-medium"
                  placeholder="1234 5678 9012"
                />
              </div>

              {/* GENDER */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#022036]/70 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-black/20 rounded-xl text-sm text-[#022036] focus:outline-none focus:border-[#FFC107] transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* MARITAL STATUS */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#022036]/70 uppercase tracking-wider">
                  Marital Status
                </label>
                <select
                  name="maritalStatus"
                  value={form.maritalStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-black/20 rounded-xl text-sm text-[#022036] focus:outline-none focus:border-[#FFC107] transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="">Select marital status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              {/* FAMILY NUMBER */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#022036]/70 uppercase tracking-wider">
                  Family Number
                </label>
                <input
                  type="number"
                  name="familyNumber"
                  value={form.familyNumber}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-white border-2 border-black/20 rounded-xl text-sm text-[#022036] focus:outline-none focus:border-[#FFC107] transition-all font-medium"
                  placeholder="e.g. 4"
                />
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t-2 border-black/10">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-3 bg-black/5 hover:bg-black/10 text-[#022036] font-black text-xs rounded-xl transition-all border-2 border-black/10 hover:border-black/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <X size={16} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none px-8 py-3 bg-[#FFC107] hover:bg-yellow-400 text-[#022036] font-black text-xs rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-[#e5ac00] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>

      {/* =====================================================
          QUICK STATS
      ===================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFC107]/10 text-[#FFC107] flex items-center justify-center">
            <Shield size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Account Status</p>
            <p className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Verification</p>
            <p className="text-[10px] font-black text-emerald-600">Verified</p>
          </div>
        </div>

        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <User size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Role</p>
            <p className="text-[10px] font-black text-[#022036]">{profile?.role || "Tenant"}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Calendar size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Joined</p>
            <p className="text-[10px] font-black text-[#022036]">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

// ==========================================
// INFORMATION ITEM COMPONENT
// ==========================================

function InfoItem({ icon, label, value, color, bg }) {
  return (
    <div className="group bg-white border-2 border-black/10 hover:border-black/30 rounded-xl p-4 transition-all duration-300 flex items-start gap-3">
      <div className={`p-2.5 rounded-xl border-2 ${bg} ${color} shrink-0 group-hover:bg-[#022036] group-hover:text-[#FFC107] group-hover:border-[#022036] transition-all duration-300`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-black/40 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-black text-[#022036] truncate">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}