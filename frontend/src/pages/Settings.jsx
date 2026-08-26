import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  ShieldCheck, 
  Building2, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
    gender: "",
    maritalStatus: "",
    familyNumber: "",
    currentPassword: "",
    newPassword: "",
  });

  const role = user?.role || "TENANT";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/settings");
      const u = res.data?.user || {};
      setFormData({
        fullName: u.fullName || "",
        email: u.email || "",
        phone: u.phone || "",
        idNumber: u.idNumber || u.faydaNumber || "",
        gender: u.gender || "",
        maritalStatus: u.maritalStatus || "",
        familyNumber: u.familyNumber ?? "",
        currentPassword: "",
        newPassword: "",
      });
    } catch (err) {
      console.error("Fetch settings error:", err);
      setFeedback({ type: "error", text: "Failed to load profile settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);

      const res = await api.patch("/settings", formData);
      const updatedUserFromServer = res.data?.user;

      setFeedback({ type: "success", text: res.data?.message || "Settings updated successfully!" });
      
      // --- REAL-TIME STATE SYNC (Updates Sidebar & Top Navbar instantly) ---
      if (updatedUserFromServer && typeof updateUser === 'function') {
        updateUser(updatedUserFromServer);
      }

      // Clear password fields after save
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (err) {
      console.error("Update settings error:", err);
      setFeedback({ type: "error", text: err.response?.data?.error || "Failed to save updates." });
    } finally {
      setSaving(false);
    }
  };

  const getDashboardPath = () => {
    if (role === "LANDLORD") return "/landlord/dashboard";
    if (role === "ADMIN") return "/admin/dashboard";
    return "/dashboard";
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-white text-slate-800 flex flex-col items-center justify-center gap-4 font-sans">
        <Loader2 size={40} className="animate-spin text-yellow-500" />
        <p className="text-xs text-slate-400 font-semibold">Loading your profile settings...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-50 text-slate-900 py-10 px-4 sm:px-8 relative overflow-y-auto font-sans selection:bg-yellow-500 selection:text-[#022036]">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto space-y-6 relative z-10 pb-20">
        
        {/* BACK BUTTON */}
        <Link
          to={getDashboardPath()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 bg-white border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        {/* HEADER */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#022036] flex items-center gap-2.5">
              <SettingsIcon className="text-yellow-600" size={26} /> Account & Role Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-light">
              Manage your personal preferences, security, and role-specific configurations ({role}).
            </p>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-yellow-100 text-yellow-900 text-xs font-extrabold uppercase tracking-wider border border-yellow-200 shadow-xs">
            {role}
          </span>
        </div>

        {feedback && (
          <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 border font-semibold ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-yellow-700 flex items-center gap-2">
              <User size={18} /> Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+251 9..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              {/* TENANT-SPECIFIC FIELD */}
              {role === "TENANT" && (
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Fayda / National ID Number</label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="Enter ID number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>
              )}
            </div>

            {/* TENANT EXTENDED DETAILS */}
            {role === "TENANT" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:border-yellow-500 cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:border-yellow-500 cursor-pointer"
                  >
                    <option value="">Select Status</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Family Members</label>
                  <input
                    type="number"
                    name="familyNumber"
                    value={formData.familyNumber}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: ROLE-SPECIFIC EXTRA SETTINGS */}
          {role === "LANDLORD" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-yellow-700 flex items-center gap-2">
                <Building2 size={18} /> Landlord Payout Preferences
              </h2>
              <p className="text-xs text-slate-500 font-light">
                Configure your verified bank account or mobile wallet destination for automatic rent disbursements.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between shadow-xs">
                <div>
                  <strong className="text-slate-900 block mb-0.5 font-bold">Primary Settlement Account</strong>
                  <span className="text-slate-500 font-mono">Commercial Bank of Ethiopia (CBE) • ****4821</span>
                </div>
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-extrabold text-[10px] uppercase">Verified</span>
              </div>
            </div>
          )}

          {role === "ADMIN" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-yellow-700 flex items-center gap-2">
                <ShieldCheck size={18} /> Platform Configuration
              </h2>
              <p className="text-xs text-slate-500 font-light">
                Global platform settings and active commission fee parameters.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Platform Commission Rate</span>
                  <strong className="text-yellow-600 text-base font-mono font-black">10% (Active)</strong>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Gateway Integration</span>
                  <strong className="text-emerald-700 text-base font-extrabold">Chapa Live API</strong>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: SECURITY & PASSWORD CHANGE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-yellow-700 flex items-center gap-2">
              <Lock size={18} /> Security & Password
            </h2>
            <p className="text-xs text-slate-500 font-light">Leave password fields blank if you do not wish to change your password.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-black rounded-2xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            <span>{saving ? "Saving Changes..." : "Save Settings Changes"}</span>
          </button>

        </form>
      </div>
    </div>
  );
}