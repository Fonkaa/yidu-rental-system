import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getAllUsers,
  toggleUserActive,
  getCommissionRate,
  updateCommissionRate,
} from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Users, 
  Percent, 
  Loader, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  UserCheck, 
  UserX, 
  Save, 
  ShieldCheck,
  AlertCircle,
  User,
  ShieldPlus,
  LayoutDashboard,
  DollarSign,
  CreditCard,
  TrendingUp,
  Activity,
  Settings as SettingsIcon,
  Lock,
  Sparkles,
  Layers,
  ShieldAlert as AlertIcon,
  X,
  MessageSquareWarning,
  Trash2,
  BarChart3
} from 'lucide-react';
import api from '../services/api';

const statusColors = {
  PENDING: 'bg-amber-500/10 text-amber-700 border border-amber-200/60 shadow-xs',
  APPROVED: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/60 shadow-xs',
  REJECTED: 'bg-rose-500/10 text-rose-700 border border-rose-200/60 shadow-xs',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview'); // 'overview' | 'pending' | 'users' | 'commission' | 'settings'
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentsData, setPaymentsData] = useState({ totalRevenue: 0, totalVolume: 0, recentPayments: [] });
  const [propStats, setPropStats] = useState({ available: 0, rented: 0, approved: 0, rejected: 0, pending: 0, requested: 0 });
  const [rate, setRate] = useState('');
  const [rateInput, setRateInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const [newRoleName, setNewRoleName] = useState('');
  const [roleMessage, setRoleMessage] = useState('');

  // Modern Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPropertyToReject, setSelectedPropertyToReject] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Spotify-Style Custom Delete Alert Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Settings tab state
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserId = user?.id || user?.userId;

  // Automatically sync tab view based on the URL path clicked from the admin sidebar layout
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/pending')) setTab('pending');
    else if (path.includes('/admin/users')) setTab('users');
    else if (path.includes('/admin/commission')) setTab('commission');
    else if (path.includes('/admin/settings')) setTab('settings');
    else setTab('overview');
  }, [location.pathname]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [pendRes, userRes, rateRes, payRes, settingsRes] = await Promise.all([
          getPendingProperties().catch(() => []),
          getAllUsers().catch(() => []),
          getCommissionRate().catch(() => ({ ratePercent: 10 })),
          api.get('/admin/payments-summary').catch(() => ({ data: { paymentsData: { totalRevenue: 0, totalVolume: 0, recentPayments: [] }, propertyStats: {} } })),
          api.get('/settings').catch(() => ({ data: { user: null } }))
        ]);

        const pendData = pendRes.data || pendRes || [];
        setPending(Array.isArray(pendData) ? pendData : []);
        
        const userData = userRes.data || userRes || [];
        setUsers(Array.isArray(userData) ? userData : []);
        
        const rateVal = rateRes.data?.ratePercent ?? rateRes.ratePercent ?? 10;
        setRate(rateVal);
        setRateInput(rateVal);

        const summaryPayload = payRes.data || {};
        setPaymentsData(summaryPayload.paymentsData || { totalRevenue: 0, totalVolume: 0, recentPayments: [] });
        setPropStats(summaryPayload.propertyStats || { available: 0, rented: 0, approved: 0, rejected: 0, pending: pendData.length || 0, requested: 0 });

        if (settingsRes.value?.data?.user || settingsRes.data?.user) {
          const u = settingsRes.data?.user || settingsRes.value.data.user;
          setSettingsForm({
            fullName: u.fullName || "",
            email: u.email || "",
            phone: u.phone || "",
            currentPassword: "",
            newPassword: "",
          });
        }
      } catch (err) {
        console.error("Admin data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUserId]);

  const loadPending = () => {
    getPendingProperties().then((res) => setPending(res.data || res || [])).catch(console.error);
  };

  const loadUsers = () => {
    getAllUsers().then((res) => setUsers(res.data || res || [])).catch(console.error);
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveProperty(id);
      loadPending();
    } finally {
      setProcessingId(null);
    }
  };

  // Open modern rejection modal
  const openRejectModal = (p) => {
    setSelectedPropertyToReject(p);
    setRejectionReasonInput('');
    setRejectModalOpen(true);
  };

  // Confirm modern rejection modal submission
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedPropertyToReject || !rejectionReasonInput.trim()) {
      alert("Please provide a valid rejection reason.");
      return;
    }

    const propertyId = selectedPropertyToReject.id;
    try {
      setProcessingId(propertyId);
      await api.patch(`/admin/properties/${propertyId}/reject`, { reason: rejectionReasonInput.trim() });
      
      setPending(prev => prev.filter(p => p.id !== propertyId));
      setRejectModalOpen(false);
      setSelectedPropertyToReject(null);
      setRejectionReasonInput('');
      loadPending();
    } catch (err) {
      console.error("Rejection error:", err);
      alert(err.response?.data?.error || "Failed to reject property.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleUser = async (userId) => {
    setProcessingId(userId);
    try {
      await toggleUserActive(userId);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to toggle user status.");
    } finally {
      setProcessingId(null);
    }
  };

  const promptDeleteUser = (u) => {
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const userId = userToDelete.id;

    setProcessingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      alert(err.response?.data?.error || "Failed to delete user.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    setProcessingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setRoleMessage('');
    try {
      await api.post('/admin/roles', { name: newRoleName });
      setRoleMessage('Role created successfully!');
      setNewRoleName('');
    } catch (err) {
      setRoleMessage(err.response?.data?.error || 'Failed to create role');
    }
  };

  const handleUpdateRate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await updateCommissionRate(parseFloat(rateInput));
      const updatedRate = res.data?.ratePercent ?? res.ratePercent ?? rateInput;
      setRate(updatedRate);
      setMessage('Commission rate updated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleSettingsChange = (e) => {
    setSettingsForm({ ...settingsForm, [e.target.name]: e.target.value });
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setSettingsFeedback(null);

      const res = await api.patch('/settings', settingsForm);
      const updatedUserFromServer = res.data?.user;

      setSettingsFeedback({ type: "success", text: res.data?.message || "Settings updated successfully!" });
      
      if (updatedUserFromServer && typeof updateUser === 'function') {
        updateUser(updatedUserFromServer);
      }

      setSettingsForm(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (err) {
      console.error("Update settings error:", err);
      setSettingsFeedback({ type: "error", text: err.response?.data?.error || "Failed to save settings updates." });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="w-full min-h-full px-4 sm:px-10 py-10 flex flex-col gap-8 bg-gradient-to-br from-slate-50 via-white to-amber-50/20 font-sans selection:bg-[#FFC107] selection:text-[#022036]">

      {loading && (
        <div className="flex flex-col items-center justify-center py-36 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-[#FFC107]/20 absolute animate-ping"></div>
            <div className="w-16 h-16 rounded-3xl bg-[#022036] text-[#FFC107] flex items-center justify-center shadow-2xl relative z-10">
              <Loader size={28} className="animate-spin text-[#FFC107]" />
            </div>
          </div>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase animate-pulse">Synchronizing Admin Suite...</p>
        </div>
      )}

      {/* SPOTIFY-STYLE DARK IMMERSIVE DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-md w-full p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-center space-y-6 relative">
            <div className="w-16 h-16 bg-[#1db954]/10 rounded-full flex items-center justify-center mx-auto text-[#1db954] border border-[#1db954]/20 shadow-inner">
              <Trash2 size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">Permanent Removal</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Are you sure you want to delete <strong className="text-white font-bold">{userToDelete.fullName}</strong>? This action is irreversible and will purge their associated properties from the platform.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={processingId === userToDelete.id}
                className="flex-1 py-3.5 bg-white/10 hover:bg-white/15 text-white font-extrabold rounded-full text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={processingId === userToDelete.id}
                className="flex-1 py-3.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-black rounded-full text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
              >
                {processingId === userToDelete.id ? <Loader size={15} className="animate-spin text-black" /> : null}
                <span>{processingId === userToDelete.id ? "Deleting..." : "Yes, Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 0: FINANCIAL & ANALYTICS OVERVIEW */}
      {!loading && tab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative rounded-3xl bg-[#022036] border border-[#FFC107]/30 p-8 sm:p-10 overflow-hidden shadow-2xl text-white group">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#FFC107]/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="absolute left-1/3 top-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107] text-[11px] font-extrabold uppercase tracking-widest shadow-xs">
                  <Sparkles size={13} className="text-[#FFC107] animate-spin" />
                  Supreme System Administration
                </span>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Executive Suite, <span className="text-[#FFC107]">{user?.fullName || "Administrator"}</span>
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm font-light max-w-xl leading-relaxed">
                  Platform operations are running smoothly. Live financial metrics, payment settlements, and user compliance are tracked below.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 px-5 py-4 rounded-2xl shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-[#FFC107] text-[#022036] flex items-center justify-center font-black text-lg shadow-md">
                  <Layers size={22} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-300 block">Total Active Users</span>
                  <strong className="text-xl font-mono text-white font-black">{users.length} Members</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-700 shadow-inner group-hover:bg-[#FFC107] group-hover:text-[#022036] transition-colors duration-300">
                  <DollarSign size={22} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <TrendingUp size={11} /> +{rate}% Yield
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Platform Revenue</span>
              <strong className="text-2xl font-black text-[#022036] font-mono tracking-tight block">
                {Number(paymentsData.totalRevenue || 0).toLocaleString()} <span className="text-xs font-bold text-slate-400">ETB</span>
              </strong>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Accumulated commission earnings</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/60 text-sky-700 shadow-inner group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                  <CreditCard size={22} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                  Chapa Gateway
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Volume Settled</span>
              <strong className="text-2xl font-black text-[#022036] font-mono tracking-tight block">
                {Number(paymentsData.totalVolume || 0).toLocaleString()} <span className="text-xs font-bold text-slate-400">ETB</span>
              </strong>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Total transaction volume processed</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <Users size={22} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Active Base
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Registered Users</span>
              <strong className="text-2xl font-black text-[#022036] font-mono tracking-tight block">
                {users.length} <span className="text-xs font-bold text-slate-400">Accounts</span>
              </strong>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Tenants and verified landlords</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/60 text-purple-700 shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                  <ShieldAlert size={22} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                  Moderation
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Pending Listings</span>
              <strong className="text-2xl font-black text-[#022036] font-mono tracking-tight block">
                {pending.length} <span className="text-xs font-bold text-slate-400">Queued</span>
              </strong>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Listings waiting for review</p>
            </div>
          </div>

          {/* AMAZING DYNAMIC VISUAL BAR ANALYTICS CHART */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-black text-[#022036] uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={20} className="text-[#FFC107]" /> Platform Property Status & Distribution Analytics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-light">Visual breakdown of all live property states across the database inventory.</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200/60 shadow-inner">
                Live Inventory Metrics
              </span>
            </div>

            {/* DYNAMIC VERTICAL STACK / BAR CHART SHOWCASE */}
            <div className="pt-4 pb-2">
              <div className="flex items-end justify-between gap-3 sm:gap-6 h-64 px-2 sm:px-6 bg-slate-50/80 rounded-3xl border border-slate-200/70 shadow-inner overflow-x-auto pt-8">
                {(() => {
                  const chartItems = [
                    { label: 'Available', count: propStats.available, bg: 'bg-sky-500', hoverBg: 'hover:bg-sky-400', border: 'border-sky-400' },
                    { label: 'Rented', count: propStats.rented, bg: 'bg-purple-500', hoverBg: 'hover:bg-purple-400', border: 'border-purple-400' },
                    { label: 'Approved', count: propStats.approved, bg: 'bg-emerald-500', hoverBg: 'hover:bg-emerald-400', border: 'border-emerald-400' },
                    { label: 'Pending', count: propStats.pending, bg: 'bg-amber-500', hoverBg: 'hover:bg-amber-400', border: 'border-amber-400' },
                    { label: 'Rejected', count: propStats.rejected, bg: 'bg-rose-500', hoverBg: 'hover:bg-rose-400', border: 'border-rose-400' },
                    { label: 'Requested', count: propStats.requested, bg: 'bg-[#FFC107]', hoverBg: 'hover:bg-yellow-400', border: 'border-yellow-400' },
                  ];
                  const maxCount = Math.max(...chartItems.map(i => i.count), 1);

                  return chartItems.map((bar, i) => {
                    const heightPercent = Math.max(Math.round((bar.count / maxCount) * 100), 12);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group/bar min-w-[45px]">
                        <span className="text-[11px] font-black text-slate-700 font-mono mb-2 group-hover/bar:scale-110 transition-transform">
                          {bar.count}
                        </span>
                        <div className="w-full max-w-[56px] bg-slate-200/80 rounded-2xl p-1 shadow-inner flex flex-col justify-end h-[160px]">
                          <div
                            className={`w-full rounded-xl transition-all duration-700 shadow-md ${bar.bg} ${bar.hoverBg} ${bar.border} border-t`}
                            style={{ height: `${heightPercent}%` }}
                            title={`${bar.label}: ${bar.count}`}
                          ></div>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mt-3 whitespace-nowrap group-hover/bar:text-[#022036] transition-colors">
                          {bar.label}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-100">
              {[
                { label: 'Available', count: propStats.available, color: 'text-sky-600', dot: 'bg-sky-500' },
                { label: 'Rented', count: propStats.rented, color: 'text-purple-600', dot: 'bg-purple-500' },
                { label: 'Approved', count: propStats.approved, color: 'text-emerald-600', dot: 'bg-emerald-500' },
                { label: 'Pending', count: propStats.pending, color: 'text-amber-600', dot: 'bg-amber-500' },
                { label: 'Rejected', count: propStats.rejected, color: 'text-rose-600', dot: 'bg-rose-500' },
                { label: 'Requested', count: propStats.requested, color: 'text-yellow-600', dot: 'bg-[#FFC107]' },
              ].map((m, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${m.dot}`}></span>
                    <span className="text-[11px] font-bold text-slate-600">{m.label}</span>
                  </div>
                  <strong className={`text-xs font-black font-mono ${m.color}`}>{m.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PENDING PROPERTIES */}
      {!loading && tab === 'pending' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-2xl font-black text-[#022036]">Pending Listings Moderation</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Review, approve, or reject new property submissions before they go live.</p>
          </div>

          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-28 px-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-center text-amber-600 mb-4 shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-lg font-extrabold mb-1 text-[#022036]">All caught up!</h2>
              <p className="text-slate-500 text-xs max-w-sm leading-relaxed font-light">
                There are no pending property listings awaiting moderation right now.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pending.map((p) => {
                const rawVideoUrl = p.videoUrl;
                const videoUrl = rawVideoUrl
                  ? rawVideoUrl.startsWith('http') ? rawVideoUrl : `http://localhost:5000${rawVideoUrl.startsWith('/') ? '' : '/'}${rawVideoUrl}`
                  : null;

                return (
                  <div 
                    key={p.id} 
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
                  >
                    {/* COVER PAGE MEDIA SHOWCASE (VIDEO PRIORITIZED) */}
                    <div className="mb-6 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                      {videoUrl ? (
                        <div className="relative h-64 sm:h-80 w-full">
                          <video
                            src={videoUrl}
                            controls
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-black font-black text-[10px] uppercase tracking-wider rounded-full shadow-md">
                            Video Tour Cover
                          </span>
                        </div>
                      ) : p.images && p.images.length > 0 ? (
                        <div className="flex gap-3 overflow-x-auto p-3 pb-2 bg-slate-50">
                          {p.images.map((img) => (
                            <img
                              key={img.id}
                              src={img.url?.startsWith('http') ? img.url : `http://localhost:5000${img.url}`}
                              alt={p.titleEn || p.titleAm}
                              loading="lazy"
                              className="h-44 w-60 object-cover rounded-xl flex-shrink-0 border border-slate-200 shadow-xs bg-slate-100"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-700 text-xs font-medium">
                          <AlertCircle size={16} />
                          <span>Warning: No media (photos or video) uploaded for this listing.</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-black text-[#022036] mb-1">{p.titleEn || p.titleAm}</h3>
                        {p.titleAm && p.titleEn && <p className="text-xs text-slate-400 mb-2">{p.titleAm}</p>}
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-amber-600 font-bold mb-3 font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {p.location?.city}, {p.location?.subCity}
                          </span>
                          <span>•</span>
                          <span>{p.category?.name}</span>
                          <span>•</span>
                          <strong className="text-slate-950 font-black">{Number(p.price).toLocaleString()} Birr / month</strong>
                        </div>
                      </div>

                      <span className={`self-start text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider ${statusColors[p.status]}`}>
                        {p.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mb-4 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80 font-medium">
                      {p.descriptionEn || 'No description provided.'}
                    </p>

                    <div className="text-xs text-slate-500 mb-6 space-y-1 font-mono font-medium">
                      <p><strong>Owner:</strong> {p.landlord?.fullName} ({p.landlord?.email})</p>
                      {p.landmarkDescription && <p><strong>Landmark:</strong> {p.landmarkDescription}</p>}
                      {p.gpsLat && p.gpsLng && <p><strong>GPS Coordinates:</strong> {p.gpsLat}, {p.gpsLng}</p>}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                      <button 
                        onClick={() => handleApprove(p.id)}
                        disabled={processingId === p.id}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md uppercase tracking-wider"
                      >
                        {processingId === p.id ? <Loader size={15} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        <span>Approve Listing</span>
                      </button>
                      
                      <button 
                        onClick={() => openRejectModal(p)}
                        disabled={processingId === p.id}
                        className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-black transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs uppercase tracking-wider"
                      >
                        {processingId === p.id ? <Loader size={15} className="animate-spin" /> : <XCircle size={16} />}
                        <span>Reject Listing</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODERN SYSTEM COLOR MATCHED REJECTION MODAL */}
      {rejectModalOpen && selectedPropertyToReject && (
        <div className="fixed inset-0 bg-[#022036]/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                  <MessageSquareWarning size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#022036] uppercase tracking-wider">Reject Listing</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-light">Specify the reason to notify the property owner.</p>
                </div>
              </div>
              <button
                type="button"
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-950 cursor-pointer transition-all"
                onClick={() => setRejectModalOpen(false)}
                disabled={processingId === selectedPropertyToReject.id}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Rejection Reason *
                </label>
                <textarea
                  rows="4"
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Explain clearly why this listing is being rejected (e.g., incorrect pricing format or unclear photos)..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-[#FFC107] font-medium shadow-inner"
                  required
                />
              </div>

              {/* Quick Preset Rejection Chips Matching System Palette */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Incorrect pricing structure or currency format.",
                    "Missing or blurry property images.",
                    "Incomplete structured location or landmark details.",
                    "Duplicate listing submission."
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReasonInput(preset)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-amber-50 hover:border-amber-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer border border-slate-200/90 shadow-xs"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                  onClick={() => setRejectModalOpen(false)}
                  disabled={processingId === selectedPropertyToReject.id}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#022036] hover:bg-[#032d4d] text-[#FFC107] font-black rounded-2xl text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                  disabled={processingId === selectedPropertyToReject.id}
                >
                  {processingId === selectedPropertyToReject.id ? <Loader size={16} className="animate-spin text-[#FFC107]" /> : <XCircle size={16} />}
                  <span>{processingId === selectedPropertyToReject.id ? "Rejecting..." : "Confirm Rejection"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & ROLE MANAGEMENT */}
      {!loading && tab === 'users' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-2xl font-black text-[#022036]">User Compliance & Role Assignment</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Manage platform accounts, role hierarchies, account states, and complete user removals.</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm max-w-xl space-y-3">
            <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
              <ShieldPlus size={16} /> Create New System Role
            </h3>
            <form onSubmit={handleCreateRole} className="flex gap-3">
              <input
                type="text"
                placeholder="Role Name (e.g., AGENT)"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#FFC107] shadow-inner"
                required
              />
              <button type="submit" className="px-6 py-3 bg-[#FFC107] text-[#022036] font-black text-xs rounded-2xl cursor-pointer hover:bg-yellow-400 transition-all shadow-md uppercase tracking-wider">
                Add Role
              </button>
            </form>
            {roleMessage && <p className="text-xs text-emerald-700 font-bold">{roleMessage}</p>}
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Role Assignment</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-extrabold text-[#022036]">{u.fullName}</td>
                      <td className="px-6 py-4 text-slate-600 font-light">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          disabled={processingId === u.id}
                          className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-amber-800 font-black cursor-pointer focus:outline-none"
                        >
                          <option value="TENANT">TENANT</option>
                          <option value="LANDLORD">LANDLORD</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider ${u.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleToggleUser(u.id)}
                          disabled={processingId === u.id}
                          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs uppercase tracking-wider ${
                            u.isActive 
                              ? 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200' 
                              : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200'
                          }`}
                        >
                          {processingId === u.id ? <Loader size={14} className="animate-spin" /> : u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                          <span>{u.isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        <button 
                          onClick={() => promptDeleteUser(u)}
                          disabled={processingId === u.id}
                          className="px-3 py-2 bg-slate-900 hover:bg-rose-600 text-white border border-slate-800 rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1 shadow-xs uppercase tracking-wider"
                          title="Permanently Delete User"
                        >
                          {processingId === u.id ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMISSION RATE SETTINGS */}
      {!loading && tab === 'commission' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-2xl font-black text-[#022036]">Commission Rate Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Set platform-wide transaction commission percentage fees.</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 max-w-xl shadow-sm space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-extrabold">Current Active Rate</span>
              <span className="text-3xl font-black text-amber-600 font-mono">{rate}%</span>
            </div>

            <form onSubmit={handleUpdateRate} className="space-y-4">
              {message && (
                <div className={`p-4 rounded-2xl text-xs text-center border font-bold ${message.includes('success') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                  {message}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5">New Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-mono focus:outline-none focus:border-[#FFC107] shadow-inner font-bold"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-[#FFC107] hover:bg-yellow-400 text-[#022036] font-black rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                <Save size={16} />
                <span>Update Rate</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN PROFILE & SECURITY SETTINGS */}
      {!loading && tab === 'settings' && (
        <div className="space-y-6 max-w-2xl mx-auto w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-2xl animate-in fade-in duration-300">
          <div className="pb-6 border-b border-slate-200">
            <h3 className="text-xl font-black text-[#022036] flex items-center gap-2.5">
              <SettingsIcon className="text-amber-500" size={24} /> Administrator Profile & Security
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">
              Manage your administrator credentials and password. Changes take effect live instantly.
            </p>
          </div>

          {settingsFeedback && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 border font-medium ${settingsFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {settingsFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{settingsFeedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                <User size={16} /> Personal Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={settingsForm.fullName}
                    onChange={handleSettingsChange}
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-[#FFC107] font-medium shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address (Read-only)</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-400 cursor-not-allowed font-medium shadow-inner"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={settingsForm.phone}
                    onChange={handleSettingsChange}
                    placeholder="+251 9..."
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-[#FFC107] font-mono shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                <Lock size={16} /> Security & Password
              </h4>
              <p className="text-xs text-slate-500 font-light">Leave password fields blank if you do not wish to change your password.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={settingsForm.currentPassword}
                    onChange={handleSettingsChange}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-[#FFC107] font-mono shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={settingsForm.newPassword}
                    onChange={handleSettingsChange}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-[#FFC107] font-mono shadow-inner"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-4 bg-[#FFC107] hover:bg-yellow-400 text-[#022036] font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingSettings ? <Loader size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>{savingSettings ? "Saving Settings..." : "Save Settings Changes"}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}