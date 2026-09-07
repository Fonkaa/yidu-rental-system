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
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  CreditCard,
  KeyRound,
  ShieldAlert,
  Activity,
  Fingerprint,
  Zap,
  Globe2
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setFeedback(null);

      const res = await api.patch("/settings", {
        fullName: formData.fullName,
        phone: formData.phone,
        idNumber: formData.idNumber,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        familyNumber: formData.familyNumber,
      });

      const updatedUserFromServer = res.data?.user;
      setFeedback({ type: "success", text: "Profile credentials updated successfully!" });
      
      if (updatedUserFromServer && typeof updateUser === 'function') {
        updateUser(updatedUserFromServer);
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setFeedback({ type: "error", text: err.response?.data?.error || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingPassword(true);
      setFeedback(null);

      if (!formData.currentPassword || !formData.newPassword) {
        setFeedback({ type: "error", text: "Please enter both current and new passwords." });
        setSavingPassword(false);
        return;
      }

      await api.patch("/settings", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setFeedback({ type: "success", text: "Password security credentials rotated successfully!" });
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (err) {
      console.error("Update password error:", err);
      setFeedback({ type: "error", text: err.response?.data?.error || "Failed to update password." });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center gap-3 font-sans">
        <Loader2 size={32} className="animate-spin text-amber-500" />
        <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Loading Executive Profile...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white text-slate-900 overflow-hidden font-sans selection:bg-amber-400 selection:text-[#022036] flex flex-col">
      
      {/* Luxury Compact Header Bar */}
      <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#022036] text-amber-400 flex items-center justify-center font-black shadow-sm">
            <Sparkles size={14} />
          </div>
          <div>
            <h1 className="text-xs font-black text-[#022036] tracking-tight">Executive Settings Suite</h1>
            <p className="text-[10px] text-slate-500 font-light">Independent Profile & Cryptographic Security • {role}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
            <Zap size={10} className="fill-emerald-500 text-emerald-500" /> System Online
          </span>
          <span className="px-3 py-1 bg-[#022036] text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
            {role} Clearance
          </span>
        </div>
      </div>

      {/* Main Non-Scrollable Side-by-Side Viewport Canvas */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden bg-slate-50/30 justify-center max-w-6xl mx-auto w-full">

        {feedback && (
          <div className={`p-2.5 rounded-2xl text-[11px] flex items-center gap-2 font-semibold flex-shrink-0 mb-3 shadow-xs border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={14} className="flex-shrink-0" /> : <AlertCircle size={14} className="flex-shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* SIDE-BY-SIDE BALANCED & FILLED LAYOUT CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full max-h-[calc(100vh-130px)]">
          
          {/* LEFT COLUMN: PERSONAL INFO & ELITE TELEMETRY */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between overflow-hidden">
            <form onSubmit={handleProfileSubmit} className="flex flex-col h-full justify-between space-y-4">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-[#022036] text-amber-400 flex items-center justify-center shadow-inner">
                    <User size={14} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-[#022036]">Personal Identity & Credentials</h2>
                    <p className="text-[10px] text-slate-400 font-light">Verified cryptographic user records</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Full Legal Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Email (Secured)</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-400 text-xs cursor-not-allowed font-medium shadow-inner"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+251 9..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-mono shadow-inner"
                    />
                  </div>

                  {role === "TENANT" && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Fayda ID Number</label>
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleChange}
                        placeholder="16-digit ID"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-mono shadow-inner"
                      />
                    </div>
                  )}
                </div>

                {role === "TENANT" ? (
                  <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500 cursor-pointer font-semibold shadow-inner">
                        <option value="">Select</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Status</label>
                      <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500 cursor-pointer font-semibold shadow-inner">
                        <option value="">Select</option>
                        <option value="SINGLE">Single</option>
                        <option value="MARRIED">Married</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Family</label>
                      <input type="number" name="familyNumber" value={formData.familyNumber} onChange={handleChange} min="1"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs font-mono focus:outline-none focus:border-amber-500 shadow-inner" />
                    </div>
                  </div>
                ) : role === "LANDLORD" ? (
                  <div className="p-4 bg-[#022036] text-white rounded-2xl border border-yellow-500/20 text-xs flex items-center justify-between shadow-md">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-amber-400 font-extrabold block">Settlement Rail</span>
                      <strong className="text-white text-xs block font-bold">CBE Verified Account • ****4821</strong>
                    </div>
                    <span className="px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full font-black text-[9px] uppercase">Active</span>
                  </div>
                ) : (
                  <div className="p-4 bg-[#022036] text-white rounded-2xl border border-yellow-500/20 text-xs flex items-center justify-between shadow-md">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-amber-400 font-extrabold block">Gateway Protocol</span>
                      <strong className="text-white text-xs block font-bold">Chapa Enterprise API (10% Fee)</strong>
                    </div>
                    <span className="px-3.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full font-black text-[9px] uppercase">Live</span>
                  </div>
                )}

                {/* LUXURY FILLED TELEMETRY PANEL TO ELIMINATE WHITE SPACE */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Fingerprint size={16} />
                    </div>
                    <div>
                      <strong className="text-xs text-[#022036] block font-extrabold">KYC Verified</strong>
                      <span className="text-[10px] text-slate-500 font-light">Fayda ID Linked</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-700 flex items-center justify-center flex-shrink-0">
                      <Globe2 size={16} />
                    </div>
                    <div>
                      <strong className="text-xs text-[#022036] block font-extrabold">Addis Ababa</strong>
                      <span className="text-[10px] text-slate-500 font-light">Primary Node</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* EXECUTE PROFILE UPDATE BUTTON */}
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3.5 bg-[#022036] hover:bg-slate-800 text-amber-400 font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                <span>{savingProfile ? "Updating Profile..." : "Save Profile Credentials"}</span>
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: CRYPTOGRAPHIC SECURITY & TELEMETRY */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between overflow-hidden">
            <form onSubmit={handlePasswordSubmit} className="flex flex-col h-full justify-between space-y-4">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-[#022036] text-amber-400 flex items-center justify-center shadow-inner">
                    <KeyRound size={14} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-[#022036]">Cryptographic Security</h2>
                    <p className="text-[10px] text-slate-400 font-light">Access keys & rotation protocols</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                  Modify your access keys securely. Both current and new passwords are required to execute cryptographic key rotation.
                </p>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-mono shadow-inner"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-mono shadow-inner"
                    />
                  </div>
                </div>

                {/* LUXURY FILLED LOWER TELEMETRY PANEL */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <ShieldAlert size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <strong className="text-xs text-slate-900 block font-extrabold">Active Session Guard</strong>
                    <p className="text-[10px] text-slate-500 font-light">Key rotation automatically invalidates stale tokens across other browsers.</p>
                  </div>
                </div>
              </div>

              {/* EXECUTE PASSWORD UPDATE BUTTON */}
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingPassword ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                <span>{savingPassword ? "Rotating Keys..." : "Update Password Security"}</span>
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}