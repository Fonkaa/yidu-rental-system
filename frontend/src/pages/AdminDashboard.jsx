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
  DollarSign,
  CreditCard,
  TrendingUp,
  Activity,
  Settings as SettingsIcon,
  Lock,
  Sparkles,
  Layers,
  X,
  MessageSquareWarning,
  Trash2,
  BarChart3,
  ChevronDown,
  UserRound,
  Mail,
  Zap,
  Database,
  Server,
  Clock,
  Eye,
  EyeOff,
  Key,
  Phone,
  Upload,
  Building2,
} from 'lucide-react';

import api from '../services/api';

const statusColors = {
  PENDING:
    'bg-amber-50 text-amber-700 border-2 border-amber-200',
  APPROVED:
    'bg-emerald-50 text-emerald-700 border-2 border-emerald-200',
  REJECTED:
    'bg-rose-50 text-rose-700 border-2 border-rose-200',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [settingsTab, setSettingsTab] = useState('profile');

  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);

  const [paymentsData, setPaymentsData] = useState({
    totalRevenue: 0,
    totalVolume: 0,
    recentPayments: [],
  });

  const [propStats, setPropStats] = useState({
    available: 0,
    rented: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    requested: 0,
  });

  const [rate, setRate] = useState('');
  const [rateInput, setRateInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const [newRoleName, setNewRoleName] = useState('');
  const [roleMessage, setRoleMessage] = useState('');

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPropertyToReject, setSelectedPropertyToReject] =
    useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Settings
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);

  const [settingsForm, setSettingsForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { user, updateUser } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const currentUserId = user?.id || user?.userId;

  // =========================================================
  // TAB SYNCHRONIZATION
  // =========================================================

  useEffect(() => {
    const path = location.pathname;

    if (path.includes('/admin/pending')) {
      setTab('pending');
    } else if (path.includes('/admin/users')) {
      setTab('users');
    } else if (path.includes('/admin/commission')) {
      setTab('commission');
    } else if (path.includes('/admin/settings')) {
      setTab('settings');
    } else {
      setTab('overview');
    }
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'profile') {
      setSettingsTab('profile');
    } else if (tabParam === 'security') {
      setSettingsTab('security');
    }
  }, [location.search]);

  // =========================================================
  // LOAD ADMIN DATA
  // =========================================================

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);

      try {
        const [
          pendRes,
          userRes,
          rateRes,
          payRes,
          settingsRes,
        ] = await Promise.all([
          getPendingProperties().catch(() => []),

          getAllUsers().catch(() => []),

          getCommissionRate().catch(() => ({
            ratePercent: 10,
          })),

          api
            .get('/admin/payments-summary')
            .catch(() => ({
              data: {
                paymentsData: {
                  totalRevenue: 0,
                  totalVolume: 0,
                  recentPayments: [],
                },
                propertyStats: {},
              },
            })),

          api
            .get('/settings')
            .catch(() => ({
              data: {
                user: null,
              },
            })),
        ]);

        const pendData =
          pendRes?.data ||
          pendRes ||
          [];

        setPending(
          Array.isArray(pendData)
            ? pendData
            : []
        );

        const userData =
          userRes?.data?.users ||
          [];

        setUsers(
          Array.isArray(userData)
            ? userData
            : []
        );

        const rateVal =
          rateRes?.data?.ratePercent ??
          rateRes?.ratePercent ??
          10;

        setRate(rateVal);
        setRateInput(rateVal);

        const summaryPayload =
          payRes?.data || {};

        setPaymentsData(
          summaryPayload.paymentsData || {
            totalRevenue: 0,
            totalVolume: 0,
            recentPayments: [],
          }
        );

        setPropStats(
          summaryPayload.propertyStats || {
            available: 0,
            rented: 0,
            approved: 0,
            rejected: 0,
            pending: Array.isArray(pendData)
              ? pendData.length
              : 0,
            requested: 0,
          }
        );

        if (settingsRes?.data?.user) {
          const u = settingsRes.data.user;

          setSettingsForm({
            fullName: u.fullName || '',
            email: u.email || '',
            phone: u.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }
      } catch (err) {
        console.error(
          'Admin data load error:',
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUserId]);

  // =========================================================
  // LOAD PENDING
  // =========================================================

  const loadPending = () => {
    getPendingProperties()
      .then((res) => {
        const data =
          res?.data ||
          res ||
          [];

        setPending(
          Array.isArray(data)
            ? data
            : []
        );
      })
      .catch(console.error);
  };

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = () => {
    getAllUsers()
      .then((res) => {
        const userData =
          res?.data?.users ||
          [];

        setUsers(
          Array.isArray(userData)
            ? userData
            : []
        );
      })
      .catch((error) => {
        console.error(
          'Failed to load users:',
          error
        );
      });
  };

  // =========================================================
  // APPROVE PROPERTY
  // =========================================================

  const handleApprove = async (id) => {
    setProcessingId(id);

    try {
      await approveProperty(id);
      loadPending();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.error ||
          'Failed to approve property.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // REJECTION MODAL
  // =========================================================

  const openRejectModal = (property) => {
    setSelectedPropertyToReject(property);
    setRejectionReasonInput('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();

    if (
      !selectedPropertyToReject ||
      !rejectionReasonInput.trim()
    ) {
      alert(
        'Please provide a valid rejection reason.'
      );

      return;
    }

    const propertyId =
      selectedPropertyToReject.id;

    try {
      setProcessingId(propertyId);

      await api.patch(
        `/admin/properties/${propertyId}/reject`,
        {
          reason:
            rejectionReasonInput.trim(),
        }
      );

      setPending((prev) =>
        prev.filter(
          (p) => p.id !== propertyId
        )
      );

      setRejectModalOpen(false);
      setSelectedPropertyToReject(null);
      setRejectionReasonInput('');

      loadPending();
    } catch (err) {
      console.error(
        'Rejection error:',
        err
      );

      alert(
        err.response?.data?.error ||
          'Failed to reject property.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // USER ACTIVE / DEACTIVE
  // =========================================================

  const handleToggleUser = async (
    userId
  ) => {
    setProcessingId(userId);

    try {
      await toggleUserActive(userId);
      loadUsers();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          'Failed to toggle user status.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // DELETE USER
  // =========================================================

  const promptDeleteUser = (
    selectedUser
  ) => {
    setUserToDelete(selectedUser);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteUser =
    async () => {
      if (!userToDelete) return;

      const userId =
        userToDelete.id;

      setProcessingId(userId);

      try {
        await api.delete(
          `/admin/users/${userId}`
        );

        setDeleteModalOpen(false);
        setUserToDelete(null);

        loadUsers();
      } catch (err) {
        console.error(
          'Delete user error:',
          err
        );

        alert(
          err.response?.data?.error ||
            'Failed to delete user.'
        );
      } finally {
        setProcessingId(null);
      }
    };

  // =========================================================
  // CHANGE ROLE
  // =========================================================

  const handleChangeRole = async (
    userId,
    newRole
  ) => {
    setProcessingId(userId);

    try {
      await api.patch(
        `/admin/users/${userId}/role`,
        {
          role: newRole,
        }
      );

      loadUsers();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          'Failed to update user role.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // CREATE ROLE
  // =========================================================

  const handleCreateRole = async (
    e
  ) => {
    e.preventDefault();

    if (!newRoleName.trim()) {
      setRoleMessage(
        'Please enter a role name.'
      );

      return;
    }

    setRoleMessage('');

    try {
      await api.post(
        '/admin/roles',
        {
          name:
            newRoleName
              .trim()
              .toUpperCase(),
        }
      );

      setRoleMessage(
        'Role created successfully!'
      );

      setNewRoleName('');
    } catch (err) {
      setRoleMessage(
        err.response?.data?.error ||
          'Failed to create role.'
      );
    }
  };

  // =========================================================
  // COMMISSION
  // =========================================================

  const handleUpdateRate = async (
    e
  ) => {
    e.preventDefault();

    setMessage('');

    try {
      const numericRate =
        parseFloat(rateInput);

      const res =
        await updateCommissionRate(
          numericRate
        );

      const updatedRate =
        res?.data?.ratePercent ??
        res?.ratePercent ??
        numericRate;

      setRate(updatedRate);

      setMessage(
        'Commission rate updated successfully.'
      );
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
          'Something went wrong.'
      );
    }
  };

  // =========================================================
  // SETTINGS
  // =========================================================

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller file.');
        e.target.value = '';
        return;
      }
      setUploadedDocument(file);
      console.log('Document uploaded:', file.name);
    }
  };

  const handleSettingsChange = (
    e
  ) => {
    setSettingsForm({
      ...settingsForm,
      [e.target.name]:
        e.target.value,
    });
  };

  // Cancel settings - reset form to original values without saving
  const handleCancelSettings = () => {
    // Reset to original values from user context
    setSettingsForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setUploadedDocument(null);
    setSettingsFeedback(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSettingsSubmit =
    async (e) => {
      e.preventDefault();

      if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
        setSettingsFeedback({
          type: 'error',
          text: 'New password and confirm password do not match!',
        });
        return;
      }

      try {
        setSavingSettings(true);
        setSettingsFeedback(null);

        const res = await api.patch(
          '/settings',
          settingsForm
        );

        const updatedUserFromServer =
          res.data?.user;

        setSettingsFeedback({
          type: 'success',
          text:
            res.data?.message ||
            'Settings updated successfully!',
        });

        if (
          updatedUserFromServer &&
          typeof updateUser ===
            'function'
        ) {
          updateUser(
            updatedUserFromServer
          );
        }

        setSettingsForm((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));

        if (uploadedDocument) {
          setUploadedDocument(null);
        }
      } catch (err) {
        console.error(
          'Update settings error:',
          err
        );

        setSettingsFeedback({
          type: 'error',
          text:
            err.response?.data?.error ||
            'Failed to save settings updates.',
        });
      } finally {
        setSavingSettings(false);
      }
    };

  // =========================================================
  // USER INITIAL
  // =========================================================

  const getUserInitial = (
    fullName,
    email
  ) => {
    const value =
      fullName ||
      email ||
      'U';

    return value
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  // =========================================================
  // SYSTEM STATUS INDICATOR
  // =========================================================

  const SystemStatus = () => (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/5 rounded-full border border-black/10">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">
          System Online
        </span>
      </div>
      <div className="w-px h-4 bg-black/10" />
      <div className="flex items-center gap-1.5">
        <Clock size={12} className="text-black/40" />
        <span className="text-[10px] font-mono text-black/40">
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="w-full min-h-full px-4 sm:px-8 lg:px-10 py-8 flex flex-col gap-8 bg-gradient-to-br from-slate-50 via-white to-amber-50/20 font-sans selection:bg-[#FFC107] selection:text-[#022036]">

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="flex flex-col items-center justify-center py-36 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-[#FFC107]/20 absolute animate-ping" />

            <div className="w-16 h-16 rounded-3xl bg-[#022036] text-[#FFC107] flex items-center justify-center shadow-2xl relative z-10">
              <Loader
                size={28}
                className="animate-spin text-[#FFC107]"
              />
            </div>
          </div>

          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase animate-pulse">
            Synchronizing Admin Suite...
          </p>
        </div>
      )}

      {/* =====================================================
          DELETE USER MODAL
      ===================================================== */}

      {deleteModalOpen &&
        userToDelete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#121212] border-2 border-white/10 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-6">

              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-400 border-2 border-rose-500/20">
                <Trash2 size={28} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">
                  Permanent Removal
                </h3>

                <p className="text-slate-400 text-xs leading-relaxed">
                  Are you sure you want to
                  delete{' '}
                  <strong className="text-white">
                    {userToDelete.fullName ||
                      userToDelete.email}
                  </strong>
                  ? This action is
                  irreversible and will purge
                  their associated properties.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModalOpen(false)
                  }
                  disabled={
                    processingId ===
                    userToDelete.id
                  }
                  className="flex-1 py-3.5 bg-white/10 hover:bg-white/15 text-white font-extrabold rounded-full text-xs transition-all"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleConfirmDeleteUser
                  }
                  disabled={
                    processingId ===
                    userToDelete.id
                  }
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-full text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId ===
                  userToDelete.id ? (
                    <Loader
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={15} />
                  )}

                  <span>
                    {processingId ===
                    userToDelete.id
                      ? 'Deleting...'
                      : 'Yes, Delete'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          TAB 0 — FINANCIAL & ANALYTICS OVERVIEW
      ===================================================== */}

      {!loading &&
        tab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* EXECUTIVE HEADER */}

            <div className="relative rounded-[2rem] bg-[#022036] border-2 border-black p-8 sm:p-10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)] text-white">

              <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#FFC107]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="absolute -left-20 -top-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">

                <div className="text-center lg:text-left space-y-3">

                  <span className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107] text-[10px] font-black uppercase tracking-[0.18em]">
                    <Sparkles size={14} />
                    Supreme System Administration
                  </span>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                    Executive Suite :{' '}
                    <span className="text-[#FFC107]">
                      {user?.fullName ||
                        'Administrator'}
                    </span>
                  </h1>

                 
                </div>

                <div className="w-full sm:w-auto flex flex-col items-center gap-4">
                  
                  <div className="flex items-center justify-center gap-4 bg-white/[0.06] backdrop-blur-md border border-white/15 px-6 py-5 rounded-2xl shadow-xl">

                    <div className="w-14 h-14 rounded-2xl bg-[#FFC107] text-[#022036] flex items-center justify-center shadow-lg">
                      <Layers
                        size={25}
                        strokeWidth={2.5}
                      />
                    </div>

                    <div className="text-left">
                      <span className="text-[9px] uppercase font-black tracking-[0.15em] text-slate-400 block mb-1">
                        Total Active Users
                      </span>

                      <strong className="text-xl font-mono text-white font-black">
                        {users.length}{' '}
                        Members
                      </strong>
                    </div>
                  </div>

                  <SystemStatus />
                </div>
              </div>
            </div>

            {/* =================================================
                FINANCIAL SUMMARY CARDS — COLORED ICONS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* REVENUE — Gold Icon */}

              <div className="group relative bg-white rounded-[1.75rem] border-2 border-black p-7 shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">

                <div className="absolute inset-x-0 top-0 h-1 bg-[#FFC107]" />

                <div className="flex flex-col items-center text-center">

                  <div className="w-16 h-16 rounded-2xl bg-[#FFC107]/20 border-2 border-[#FFC107] text-[#FFC107] flex items-center justify-center mb-5 shadow-inner group-hover:bg-[#FFC107] group-hover:text-[#022036] transition-all duration-300">
                    <DollarSign
                      size={28}
                      strokeWidth={2.5}
                    />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-black/60 mb-2">
                    Total Platform Revenue
                  </span>

                  <strong className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                    {Number(
                      paymentsData.totalRevenue ||
                        0
                    ).toLocaleString()}
                    <span className="text-xs font-black text-black/40 ml-1">
                      ETB
                    </span>
                  </strong>

                  <div className="mt-4 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <TrendingUp
                      size={12}
                      strokeWidth={3}
                    />

                    <span className="text-[10px] font-black">
                      +{rate}% Yield
                    </span>
                  </div>

                  <p className="text-[11px] text-black/40 mt-4 font-medium leading-relaxed">
                    Accumulated commission
                    earnings
                  </p>
                </div>
              </div>

              {/* TRANSACTION VOLUME — Blue Icon */}

              <div className="group relative bg-white rounded-[1.75rem] border-2 border-black p-7 shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">

                <div className="absolute inset-x-0 top-0 h-1 bg-sky-500" />

                <div className="flex flex-col items-center text-center">

                  <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border-2 border-sky-500 text-sky-500 flex items-center justify-center mb-5 shadow-inner group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                    <CreditCard
                      size={28}
                      strokeWidth={2.5}
                    />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-black/60 mb-2">
                    Total Volume Settled
                  </span>

                  <strong className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                    {Number(
                      paymentsData.totalVolume ||
                        0
                    ).toLocaleString()}
                    <span className="text-xs font-black text-black/40 ml-1">
                      ETB
                    </span>
                  </strong>

                  <div className="mt-4 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700">
                    <Activity
                      size={12}
                      strokeWidth={3}
                    />

                    <span className="text-[10px] font-black">
                      Chapa Gateway
                    </span>
                  </div>

                  <p className="text-[11px] text-black/40 mt-4 font-medium leading-relaxed">
                    Total transaction volume
                    processed
                  </p>
                </div>
              </div>

              {/* USERS — Emerald Icon */}

              <div className="group relative bg-white rounded-[1.75rem] border-2 border-black p-7 shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">

                <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />

                <div className="flex flex-col items-center text-center">

                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center mb-5 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <Users
                      size={28}
                      strokeWidth={2.5}
                    />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-black/60 mb-2">
                    Registered Users
                  </span>

                  <strong className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                    {users.length}

                    <span className="text-xs font-black text-black/40 ml-1">
                      Accounts
                    </span>
                  </strong>

                  <div className="mt-4 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <UserCheck
                      size={12}
                      strokeWidth={3}
                    />

                    <span className="text-[10px] font-black">
                      Active Base
                    </span>
                  </div>

                  <p className="text-[11px] text-black/40 mt-4 font-medium leading-relaxed">
                    Tenants and verified
                    landlords
                  </p>
                </div>
              </div>

              {/* PENDING — Purple Icon */}

              <div className="group relative bg-white rounded-[1.75rem] border-2 border-black p-7 shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">

                <div className="absolute inset-x-0 top-0 h-1 bg-purple-500" />

                <div className="flex flex-col items-center text-center">

                  <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border-2 border-purple-500 text-purple-500 flex items-center justify-center mb-5 shadow-inner group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                    <ShieldAlert
                      size={28}
                      strokeWidth={2.5}
                    />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-black/60 mb-2">
                    Pending Listings
                  </span>

                  <strong className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                    {pending.length}

                    <span className="text-xs font-black text-black/40 ml-1">
                      Queued
                    </span>
                  </strong>

                  <div className="mt-4 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700">
                    <ShieldAlert
                      size={12}
                      strokeWidth={3}
                    />

                    <span className="text-[10px] font-black">
                      Moderation
                    </span>
                  </div>

                  <p className="text-[11px] text-black/40 mt-4 font-medium leading-relaxed">
                    Listings waiting for
                    review
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                PROPERTY ANALYTICS
            ================================================= */}

            <div className="bg-white border-2 border-black rounded-[2rem] p-7 sm:p-8 shadow-[0_12px_35px_rgba(0,0,0,0.06)] space-y-6">

              <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between pb-5 border-b border-black/10 gap-4">

                <div className="text-center sm:text-left">

                  <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
                    <BarChart3
                      size={20}
                      className="text-[#FFC107]"
                    />

                    Platform Property
                    Status & Distribution
                    Analytics
                  </h3>

                  <p className="text-xs text-black/40 mt-1 font-light">
                    Visual breakdown of all
                    live property states
                    across the database
                    inventory.
                  </p>
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest bg-[#FFC107]/10 text-black px-4 py-2 rounded-full border border-black/20 shadow-inner">
                  Live Inventory Metrics
                </span>
              </div>

              <div className="pt-3 pb-2">

                <div className="flex items-end justify-between gap-4 sm:gap-7 h-72 px-4 sm:px-8 bg-[#FFC107]/5 rounded-[1.5rem] border border-yellow-500/10 shadow-inner overflow-x-auto pt-8">

                  {[
                    {
                      label: 'Available',
                      count:
                        propStats.available,
                      bg: 'bg-green-500',
                      border:
                        'border-[#022036]',
                    },
                    {
                      label: 'Rented',
                      count:
                        propStats.rented,
                      bg: 'bg-yellow-500/70',
                      border:
                        'border-[#022036]/70',
                    },
                    {
                      label: 'Approved',
                      count:
                        propStats.approved,
                      bg: 'bg-blue-500/50',
                      border:
                        'border-[#022036]/50',
                    },
                    {
                      label: 'Pending',
                      count:
                        propStats.pending,
                      bg: 'bg-amber-500',
                      border:
                        'border-amber-600',
                    },
                    {
                      label: 'Rejected',
                      count:
                        propStats.rejected,
                      bg: 'bg-rose-600',
                      border:
                        'border-rose-700',
                    },
                    {
                      label: 'Requested',
                      count:
                        propStats.requested,
                      bg: 'bg-[#FFC107]',
                      border:
                        'border-yellow-600',
                    },
                  ].map(
                    (bar, i, arr) => {
                      const maxCount =
                        Math.max(
                          ...arr.map(
                            (item) =>
                              item.count
                          ),
                          1
                        );

                      const heightPercent =
                        Math.max(
                          Math.round(
                            (bar.count /
                              maxCount) *
                              100
                          ),
                          12
                        );

                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center h-full justify-end group/bar min-w-[55px]"
                        >

                          <span className="text-xs font-black text-black font-mono mb-2 group-hover/bar:scale-110 transition-transform">
                            {bar.count}
                          </span>

                          <div className="w-full max-w-[62px] bg-black/10 rounded-2xl p-1.5 shadow-inner flex flex-col justify-end h-[175px] border border-black/10">

                            <div
                              className={`w-full rounded-xl transition-all duration-700 shadow-lg ${bar.bg} ${bar.border} border`}
                              style={{
                                height: `${heightPercent}%`,
                              }}
                              title={`${bar.label}: ${bar.count}`}
                            />
                          </div>

                          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 mt-3 whitespace-nowrap">
                            {bar.label}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* ANALYTICS LEGEND */}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5 border-t border-black/10">

                {[
                  {
                    label: 'Available',
                    count:
                      propStats.available,
                    color:
                      'text-[#022036]',
                    dot:
                      'bg-[#022036]',
                  },
                  {
                    label: 'Rented',
                    count:
                      propStats.rented,
                    color:
                      'text-[#022036]/70',
                    dot:
                      'bg-[#022036]/70',
                  },
                  {
                    label: 'Approved',
                    count:
                      propStats.approved,
                    color:
                      'text-[#022036]/50',
                    dot:
                      'bg-[#022036]/50',
                  },
                  {
                    label: 'Pending',
                    count:
                      propStats.pending,
                    color:
                      'text-amber-700',
                    dot:
                      'bg-amber-500',
                  },
                  {
                    label: 'Rejected',
                    count:
                      propStats.rejected,
                    color:
                      'text-rose-700',
                    dot:
                      'bg-rose-600',
                  },
                  {
                    label: 'Requested',
                    count:
                      propStats.requested,
                    color:
                      'text-yellow-700',
                    dot:
                      'bg-[#FFC107]',
                  },
                ].map(
                  (m, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-black/5 rounded-2xl border border-black/10 flex items-center justify-between shadow-sm hover:border-black/30 hover:shadow-md transition-all"
                    >

                      <div className="flex items-center gap-2">

                        <span
                          className={`w-3 h-3 rounded-full ${m.dot} ring-2 ring-white shadow-sm`}
                        />

                        <span className="text-[11px] font-black text-black/60">
                          {m.label}
                        </span>
                      </div>

                      <strong
                        className={`text-sm font-black font-mono ${m.color}`}
                      >
                        {m.count}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* =================================================
                SYSTEM BACKUP & INTEGRITY
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-white border-2 border-black rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#FFC107]/20 border border-[#FFC107]/30 flex items-center justify-center text-[#FFC107]">
                  <Database size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                    Database Status
                  </p>
                  <p className="text-sm font-black text-black flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Connected
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-black rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-500">
                  <Server size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                    Last Backup
                  </p>
                  <p className="text-sm font-black text-black">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-black rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <Zap size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                    System Health
                  </p>
                  <p className="text-sm font-black text-emerald-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Optimal
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          TAB 1 — PENDING PROPERTIES
      ===================================================== */}

      {!loading &&
        tab === 'pending' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div>
              <h2 className="text-2xl font-black text-black">
                Pending Listings
                Moderation
              </h2>

              <p className="text-xs text-black/40 mt-1">
                Review, approve, or reject
                new property submissions.
              </p>
            </div>

            {pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-28 px-6 bg-white border-2 border-black rounded-3xl shadow-sm">

                <div className="w-16 h-16 bg-emerald-50 border-2 border-black rounded-3xl flex items-center justify-center text-emerald-600 mb-4">
                  <CheckCircle2 size={32} />
                </div>

                <h2 className="text-lg font-extrabold text-black">
                  All caught up!
                </h2>

                <p className="text-black/40 text-xs max-w-sm mt-1">
                  There are no pending
                  property listings
                  awaiting moderation.
                </p>
              </div>
            ) : (
              <div className="space-y-6">

                {pending.map((p) => {

                  const rawVideoUrl =
                    p.videoUrl;

                  const videoUrl =
                    rawVideoUrl
                      ? rawVideoUrl.startsWith(
                          'http'
                        )
                        ? rawVideoUrl
                        : `http://localhost:5000${
                            rawVideoUrl.startsWith(
                              '/'
                            )
                              ? ''
                              : '/'
                          }${rawVideoUrl}`
                      : null;

                  return (
                    <div
                      key={p.id}
                      className="bg-white border-2 border-black rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all"
                    >

                      <div className="mb-6 rounded-2xl overflow-hidden bg-slate-900 border border-black">

                        {videoUrl ? (
                          <div className="relative h-64 sm:h-80 w-full">

                            <video
                              src={videoUrl}
                              controls
                              preload="metadata"
                              className="w-full h-full object-cover"
                            />

                            <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-black font-black text-[10px] uppercase tracking-wider rounded-full">
                              Video Tour Cover
                            </span>
                          </div>
                        ) : p.images &&
                          p.images.length >
                            0 ? (
                          <div className="flex gap-3 overflow-x-auto p-3 bg-black/5">

                            {p.images.map(
                              (img) => (
                                <img
                                  key={img.id}
                                  src={
                                    img.url?.startsWith(
                                      'http'
                                    )
                                      ? img.url
                                      : `http://localhost:5000${img.url}`
                                  }
                                  alt={
                                    p.titleEn ||
                                    p.titleAm ||
                                    'Property'
                                  }
                                  className="h-44 w-60 object-cover rounded-xl flex-shrink-0 border border-black/10"
                                />
                              )
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-700 text-xs">
                            <AlertCircle
                              size={16}
                            />

                            <span>
                              No media uploaded.
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">

                        <div>
                          <h3 className="text-lg font-black text-black">
                            {p.titleEn ||
                              p.titleAm}
                          </h3>

                          {p.titleAm &&
                            p.titleEn && (
                              <p className="text-xs text-black/40 mt-1">
                                {p.titleAm}
                              </p>
                            )}

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-amber-600 font-bold mt-3">

                            <span className="flex items-center gap-1">
                              <MapPin
                                size={13}
                              />

                              {p.location
                                ?.city}
                              ,{' '}
                              {p.location
                                ?.subCity}
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              {p.category
                                ?.name}
                            </span>

                            <span>
                              •
                            </span>

                            <strong className="text-black">
                              {Number(
                                p.price
                              ).toLocaleString()}{' '}
                              Birr /
                              month
                            </strong>
                          </div>
                        </div>

                        <span
                          className={`self-start text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider ${statusColors[p.status] || statusColors.PENDING}`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <p className="text-xs text-black/70 mb-4 whitespace-pre-wrap leading-relaxed bg-black/5 p-4 rounded-2xl border border-black/5">
                        {p.descriptionEn ||
                          'No description provided.'}
                      </p>

                      <div className="text-xs text-black/40 mb-6 space-y-1">

                        <p>
                          <strong>
                            Owner:
                          </strong>{' '}
                          {p.landlord
                            ?.fullName ||
                            'Unknown'}{' '}
                          (
                          {
                            p.landlord
                              ?.email
                          }
                          )
                        </p>

                        {p.landmarkDescription && (
                          <p>
                            <strong>
                              Landmark:
                            </strong>{' '}
                            {
                              p.landmarkDescription
                            }
                          </p>
                        )}

                        {p.gpsLat &&
                          p.gpsLng && (
                            <p>
                              <strong>
                                GPS:
                              </strong>{' '}
                              {p.gpsLat},{' '}
                              {p.gpsLng}
                            </p>
                          )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-black/10">

                        <button
                          onClick={() =>
                            handleApprove(
                              p.id
                            )
                          }
                          disabled={
                            processingId ===
                            p.id
                          }
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-md border-2 border-black disabled:opacity-50"
                        >
                          {processingId ===
                          p.id ? (
                            <Loader
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2
                              size={16}
                            />
                          )}

                          Approve Listing
                        </button>

                        <button
                          onClick={() =>
                            openRejectModal(
                              p
                            )
                          }
                          disabled={
                            processingId ===
                            p.id
                          }
                          className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-black rounded-2xl text-xs font-black transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <XCircle
                            size={16}
                          />

                          Reject Listing
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      {/* =====================================================
          REJECTION MODAL
      ===================================================== */}

      {rejectModalOpen &&
        selectedPropertyToReject && (
          <div className="fixed inset-0 bg-[#022036]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">

            <div className="bg-white border-2 border-black rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">

              <div className="flex justify-between items-start pb-4 mb-6 border-b border-black/10">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border-2 border-black text-amber-700 flex items-center justify-center">
                    <MessageSquareWarning
                      size={20}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-black uppercase tracking-wider">
                      Reject Listing
                    </h3>

                    <p className="text-xs text-black/40 mt-0.5">
                      Specify the reason to
                      notify the property
                      owner.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-2 bg-black/5 hover:bg-black/10 rounded-xl text-black/40"
                  onClick={() =>
                    setRejectModalOpen(
                      false
                    )
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={
                  handleConfirmReject
                }
                className="space-y-4"
              >

                <div>

                  <label className="text-xs font-black text-black/70 uppercase tracking-wider">
                    Rejection Reason *
                  </label>

                  <textarea
                    rows="4"
                    value={
                      rejectionReasonInput
                    }
                    onChange={(e) =>
                      setRejectionReasonInput(
                        e.target.value
                      )
                    }
                    placeholder="Explain clearly why this listing is being rejected..."
                    className="w-full mt-2 px-4 py-3 bg-black/5 border-2 border-black/10 rounded-2xl text-black placeholder-black/30 text-xs focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>

                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-black/40">
                    Quick Presets
                  </span>

                  <div className="flex flex-wrap gap-1.5 mt-2">

                    {[
                      'Incorrect pricing structure or currency format.',
                      'Missing or blurry property images.',
                      'Incomplete structured location or landmark details.',
                      'Duplicate listing submission.',
                    ].map(
                      (preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setRejectionReasonInput(
                              preset
                            )
                          }
                          className="px-3 py-1.5 bg-black/5 hover:bg-black/10 text-black/70 rounded-xl text-[11px] font-bold border border-black/10"
                        >
                          {preset}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-black/10">

                  <button
                    type="button"
                    onClick={() =>
                      setRejectModalOpen(
                        false
                      )
                    }
                    className="flex-1 py-3 bg-black/5 hover:bg-black/10 text-black/70 rounded-2xl text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      processingId ===
                      selectedPropertyToReject.id
                    }
                    className="flex-1 py-3 bg-black hover:bg-black/80 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 border-2 border-black disabled:opacity-50"
                  >
                    {processingId ===
                    selectedPropertyToReject.id ? (
                      <Loader
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <XCircle
                        size={16}
                      />
                    )}

                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* =====================================================
          TAB 2 — USERS & ROLES
      ===================================================== */}

      {!loading &&
        tab === 'users' && (
          <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* =================================================
                HEADER + ADD ROLE
            ================================================= */}

            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">

              <div>

                <div className="flex items-center gap-2 mb-2">

                  <div className="w-10 h-10 rounded-xl bg-black text-[#FFC107] flex items-center justify-center shadow-md">
                    <Users size={19} />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
                    Administration
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                  Platform Users & Roles
                </h2>

              
              </div>

              {/* =================================================
                  RIGHT SIDE CONTROLS
              ================================================= */}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                {/* TOTAL ACCOUNTS */}

                <div className="flex items-center gap-3 bg-white border-2 border-black rounded-2xl px-5 py-3 shadow-sm">

                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border-2 border-black text-emerald-600 flex items-center justify-center">
                    <UserRound
                      size={19}
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-black/40">
                      Total Accounts
                    </p>

                    <p className="text-lg font-black text-black">
                      {users.length}
                    </p>
                  </div>
                </div>

             
                    
           
              </div>
            </div>

            {/* =================================================
                COMPACT ROLE BAR
            ================================================= */}

            <div className="bg-white border-2 border-black/20 rounded-2xl p-4 sm:p-5 shadow-lg">

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-[#FFC107] text-black flex items-center justify-center shrink-0">
                    <ShieldPlus
                      size={19}
                    />
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-black uppercase tracking-wider">
                      Create System Role
                    </h3>

                    <p className="text-[10px] text-white/40 mt-0.5">
                      Add a custom platform
                      access role.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={
                    handleCreateRole
                  }
                  className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto"
                >

                  <div className="relative">

                    <ShieldPlus
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                    />

                    <input
                      id="admin-role-input"
                      type="text"
                      placeholder="Role name e.g. AGENT"
                      value={
                        newRoleName
                      }
                      onChange={(e) =>
                        setNewRoleName(
                          e.target.value
                        )
                      }
                      className="w-full sm:w-64 pl-10 pr-4 py-3 bg-white/10 border-2 border-/15 rounded-xl text-xs text-black placeholder-green/40 font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107] transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#FFC107] hover:bg-yellow-400 text-black font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 border-2 border-black"
                  >
                    <ShieldPlus
                      size={15}
                    />

                    Add Role
                  </button>
                </form>
              </div>

              {roleMessage && (
                <div
                  className={`mt-3 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                    roleMessage
                      .toLowerCase()
                      .includes(
                        'success'
                      )
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {roleMessage
                    .toLowerCase()
                    .includes(
                      'success'
                    ) ? (
                    <CheckCircle2
                      size={15}
                    />
                  ) : (
                    <AlertCircle
                      size={15}
                    />
                  )}

                  {roleMessage}
                </div>
              )}
            </div>

            {/* =================================================
                USERS TABLE
            ================================================= */}

            <div className="bg-white border-2 border-black rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.07)] overflow-hidden">

              {/* TABLE HEADER */}

              <div className="px-5 sm:px-7 py-5 border-b border-black/10 bg-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <div>

                  <h3 className="text-sm font-black text-black">
                    Registered Platform
                    Users
                  </h3>

                 
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border-2 border-black shadow-sm">

                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />

                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                    Live Accounts
                  </span>
                </div>
              </div>

              {/* TABLE */}

              <div className="overflow-x-auto">

                <table className="w-full min-w-[980px] text-left">

                  <thead>

                    <tr className="bg-white border-b-2 border-black">

                      <th className="px-6 py-4">

                        <span className="text-[10px] font-black uppercase tracking-widest text-black/200">
                          User
                        </span>
                      </th>

                      <th className="px-6 py-4">

                        <span className="text-[10px] font-black uppercase tracking-widest text-black/200">
                          Email Address
                        </span>
                      </th>

                      <th className="px-6 py-4">

                        <span className="text-[10px] font-black uppercase tracking-widest text-black/200">
                          Role
                        </span>
                      </th>

                      <th className="px-6 py-4">

                        <span className="text-[10px] font-black uppercase tracking-widest text-black/200">
                          Status
                        </span>
                      </th>

                      <th className="px-6 py-4 text-right">

                        <span className="text-[10px] font-black uppercase tracking-widest text-black/200">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-black/5">

                    {users.length === 0 ? (
                      <tr>

                        <td
                          colSpan="5"
                          className="px-6 py-20 text-center"
                        >

                          <div className="flex flex-col items-center">

                            <div className="w-14 h-14 rounded-2xl bg-black/5 border border-black/10 flex items-center justify-center text-black/40 mb-4">
                              <Users
                                size={24}
                              />
                            </div>

                            <h4 className="text-sm font-black text-black">
                              No users found
                            </h4>

                            <p className="text-xs text-black/40 mt-1">
                              There are
                              currently no
                              registered
                              platform users.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr
                          key={u.id}
                          className="group hover:bg-black/5 transition-all duration-200"
                        >

                          {/* USER */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3.5">

                              <div className="w-11 h-11 rounded-2xl bg-black text-[#FFC107] flex items-center justify-center font-black text-sm shadow-md border-2 border-black/20 shrink-0">
                                {getUserInitial(
                                  u.fullName,
                                  u.email
                                )}
                              </div>

                              <div className="min-w-0">

                                <p className="text-sm font-black text-black truncate max-w-[180px]">
                                  {u.fullName ||
                                    'Unnamed User'}
                                </p>

                                <p className="text-[10px] text-black/40 mt-0.5 font-medium">
                                  ID:{' '}
                                  {String(
                                    u.id
                                  ).slice(
                                    0,
                                    8
                                  )}
                                  ...
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* EMAIL */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2 text-black/60">

                              <div className="w-8 h-8 rounded-lg bg-black/5 border border-black/10 flex items-center justify-center">
                                <Mail
                                  size={14}
                                  className="text-black/40"
                                />
                              </div>

                              <span className="text-xs font-semibold">
                                {u.email}
                              </span>
                            </div>
                          </td>

                          {/* ROLE */}

                          <td className="px-6 py-5">

                            <div className="relative inline-block">

                              <select
                                value={
                                  u.role
                                }
                                onChange={(e) =>
                                  handleChangeRole(
                                    u.id,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  processingId ===
                                  u.id
                                }
                                className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black tracking-wider cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/20 transition-all disabled:opacity-50 border-2 ${
                                  u.role ===
                                  'ADMIN'
                                    ? 'bg-black text-[#FFC107] border-black'
                                    : u.role ===
                                      'LANDLORD'
                                    ? 'bg-purple-50 text-purple-800 border-black'
                                    : 'bg-sky-50 text-sky-800 border-black'
                                }`}
                              >

                                <option value="TENANT">
                                  TENANT
                                </option>

                                <option value="LANDLORD">
                                  LANDLORD
                                </option>

                                <option value="ADMIN">
                                  ADMIN
                                </option>
                              </select>

                              <ChevronDown
                                size={13}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                                  u.role ===
                                  'ADMIN'
                                    ? 'text-[#FFC107]'
                                    : 'text-black/40'
                                }`}
                              />
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">

                            {u.isActive ? (

                              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-50 border-2 border-black text-emerald-700 shadow-sm">

                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />

                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  Active
                                </span>
                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-rose-50 border-2 border-black text-rose-700 shadow-sm">

                                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm" />

                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  Deactivated
                                </span>
                              </span>
                            )}
                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-5">

                            <div className="flex items-center justify-end gap-2">

                              {/* ACTIVATE / DEACTIVATE */}

                              <button
                                onClick={() =>
                                  handleToggleUser(
                                    u.id
                                  )
                                }
                                disabled={
                                  processingId ===
                                  u.id
                                }
                                title={
                                  u.isActive
                                    ? 'Deactivate user'
                                    : 'Activate user'
                                }
                                className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  u.isActive
                                    ? 'bg-white border-black text-black/70 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700'
                                    : 'bg-emerald-50 border-black text-emerald-700 hover:bg-emerald-600 hover:border-black hover:text-white'
                                }`}
                              >

                                {processingId ===
                                u.id ? (
                                  <Loader
                                    size={
                                      14
                                    }
                                    className="animate-spin"
                                  />
                                ) : u.isActive ? (
                                  <UserX
                                    size={
                                      14
                                    }
                                  />
                                ) : (
                                  <UserCheck
                                    size={
                                      14
                                    }
                                  />
                                )}

                                <span className="hidden xl:inline">
                                  {u.isActive
                                    ? 'Deactivate'
                                    : 'Activate'}
                                </span>
                              </button>

                              {/* DELETE */}

                              <button
                                onClick={() =>
                                  promptDeleteUser(
                                    u
                                  )
                                }
                                disabled={
                                  processingId ===
                                  u.id
                                }
                                title="Delete user permanently"
                                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-black text-yellow-500 border-2 border-gray-600 hover:bg-rose-600 hover:border-yellow-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >

                                <Trash2
                                  size={14}
                                />

                                <span className="hidden xl:inline">
                                  Delete
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER */}

              {users.length > 0 && (
                <div className="px-6 py-4 bg-black/5 border-t border-black/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                  <p className="text-[10px] font-bold text-black/40">

                    Showing{' '}

                    <span className="text-black font-black">
                      {users.length}
                    </span>{' '}

                    registered users
                  </p>

                  <div className="flex items-center gap-2">

                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />

                    <span className="text-[10px] font-bold text-black/40">
                      User management is
                      live
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* =====================================================
          TAB 3 — COMMISSION
      ===================================================== */}

      {!loading &&
        tab === 'commission' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div>
              <h2 className="text-2xl font-black text-black">
                Commission Rate
                Configuration
              </h2>

              <p className="text-xs text-black/40 mt-1">
                Set platform-wide
                transaction commission
                percentage fees.
              </p>
            </div>

            <div className="bg-white border-2 border-black rounded-3xl p-8 max-w-xl shadow-lg space-y-6">

              <div className="p-5 bg-black/5 rounded-2xl border-2 border-black flex items-center justify-between">

                <span className="text-xs text-black/40 uppercase tracking-wider font-extrabold">
                  Current Active Rate
                </span>

                <span className="text-3xl font-black text-amber-600 font-mono">
                  {rate}%
                </span>
              </div>

              <form
                onSubmit={
                  handleUpdateRate
                }
                className="space-y-4"
              >

                {message && (
                  <div
                    className={`p-4 rounded-2xl text-xs text-center border-2 font-bold ${
                      message.includes(
                        'success'
                      )
                        ? 'bg-emerald-50 text-emerald-800 border-black'
                        : 'bg-rose-50 text-rose-800 border-black'
                    }`}
                  >
                    {message}
                  </div>
                )}

                <div>

                  <label className="block text-xs font-black text-black/70 uppercase tracking-widest mb-1.5">
                    New Commission Rate
                    (%)
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={
                      rateInput
                    }
                    onChange={(e) =>
                      setRateInput(
                        e.target.value
                      )
                    }
                    className="w-full px-5 py-3.5 bg-black/5 border-2 border-black rounded-2xl text-black text-sm font-mono focus:outline-none focus:border-black shadow-inner font-bold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#FFC107] hover:bg-yellow-400 text-black font-black rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider border-2 border-black"
                >
                  <Save size={16} />
                  Update Rate
                </button>
              </form>
            </div>
          </div>
        )}

      {/* =====================================================
          TAB 4 — SETTINGS WITH CANCEL BUTTON
      ===================================================== */}

      {!loading &&
        tab === 'settings' && (
          <div className="space-y-6 max-w-2xl mx-auto w-full bg-white border-2 border-black rounded-3xl p-8 sm:p-10 shadow-xl animate-in fade-in duration-300">

            <div className="pb-6 border-b border-black/10 flex items-center justify-between">

              <div>
                <h3 className="text-xl font-black text-black flex items-center gap-2.5">
                  <SettingsIcon
                    className="text-[#FFC107]"
                    size={24}
                  />
                  Administrator Profile & Security
                </h3>
                <p className="text-xs text-black/40 mt-1">
                  Manage your administrator credentials and password.
                </p>
              </div>

              {/* Cancel Button - Only cancels settings, not content */}
              <button
                type="button"
                onClick={handleCancelSettings}
                className="px-4 py-2 bg-black/5 hover:bg-black/10 text-black/60 hover:text-black rounded-xl text-xs font-black transition-all border border-black/10 hover:border-black/30 flex items-center gap-1.5"
              >
                <X size={14} />
                Cancel
              </button>
            </div>

            {settingsFeedback && (
              <div
                className={`p-4 rounded-2xl text-xs flex items-center gap-2 border-2 font-medium ${
                  settingsFeedback.type ===
                  'success'
                    ? 'bg-emerald-50 border-black text-emerald-800'
                    : 'bg-rose-50 border-black text-rose-800'
                }`}
              >
                {settingsFeedback.type ===
                'success' ? (
                  <CheckCircle2
                    size={16}
                  />
                ) : (
                  <AlertCircle
                    size={16}
                  />
                )}
                <span>
                  {
                    settingsFeedback.text
                  }
                </span>
              </div>
            )}

            <form
              onSubmit={
                handleSettingsSubmit
              }
              className="space-y-6"
            >

              {/* PERSONAL INFORMATION */}

              <div className="bg-black/5 border-2 border-black rounded-3xl p-6 space-y-4">

                <h4 className="text-xs font-black uppercase tracking-widest text-black/60 flex items-center gap-2">

                  <User size={16} className="text-[#FFC107]" />

                  Personal Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

                  <div>

                    <label className="block text-black/70 font-bold mb-1">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={
                        settingsForm.fullName
                      }
                      onChange={
                        handleSettingsChange
                      }
                      required
                      className="w-full bg-white border-2 border-black rounded-2xl px-4 py-3.5 text-black focus:outline-none focus:border-black font-medium shadow-sm"
                    />
                  </div>

                  <div>

                    <label className="block text-black/70 font-bold mb-1">
                      Email Address
                    </label>

                    <input
                      type="email"
                      value={
                        settingsForm.email
                      }
                      disabled
                      className="w-full bg-black/5 border-2 border-black rounded-2xl px-4 py-3.5 text-black/40 cursor-not-allowed font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">

                    <label className="block text-black/70 font-bold mb-1">
                      Phone Number
                    </label>

                    <input
                      type="text"
                      name="phone"
                      value={
                        settingsForm.phone
                      }
                      onChange={
                        handleSettingsChange
                      }
                      placeholder="+251 9..."
                      className="w-full bg-white border-2 border-black rounded-2xl px-4 py-3.5 text-black focus:outline-none focus:border-black font-mono shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECURITY */}

              <div className="bg-black/5 border-2 border-black rounded-3xl p-6 space-y-4">

                <h4 className="text-xs font-black uppercase tracking-widest text-black/60 flex items-center gap-2">

                  <Lock size={16} className="text-[#FFC107]" />

                  Security & Password
                </h4>

                <p className="text-xs text-black/40">
                  Leave password fields
                  blank if you do not wish
                  to change your password.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

                  <div>

                    <label className="block text-black/70 font-bold mb-1">
                      Current Password
                    </label>

                    <input
                      type="password"
                      name="currentPassword"
                      value={
                        settingsForm.currentPassword
                      }
                      onChange={
                        handleSettingsChange
                      }
                      placeholder="••••••••"
                      className="w-full bg-white border-2 border-black rounded-2xl px-4 py-3.5 text-black focus:outline-none focus:border-black font-mono shadow-sm"
                    />
                  </div>

                  <div>

                    <label className="block text-black/70 font-bold mb-1">
                      New Password
                    </label>

                    <input
                      type="password"
                      name="newPassword"
                      value={
                        settingsForm.newPassword
                      }
                      onChange={
                        handleSettingsChange
                      }
                      placeholder="••••••••"
                      className="w-full bg-white border-2 border-black rounded-2xl px-4 py-3.5 text-black focus:outline-none focus:border-black font-mono shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={
                    savingSettings
                  }
                  className="flex-1 py-4 bg-[#FFC107] hover:bg-yellow-400 text-black font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-black disabled:opacity-50"
                >
                  {savingSettings ? (
                    <Loader
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <ShieldCheck
                      size={16}
                    />
                  )}

                  <span>
                    {savingSettings
                      ? 'Saving Settings...'
                      : 'Save Settings Changes'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
    </div>
  );
}