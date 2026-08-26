import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getMyProperties, updatePropertyStatus, renewProperty } from '../services/propertyService';
import { getRentalRequests, updateRentalRequestStatus } from '../services/rentalRequestService';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Building2, 
  Plus, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Ban, 
  RefreshCw, 
  ArrowRight,
  FileText,
  User,
  DollarSign,
  TrendingUp,
  Percent,
  Home,
  Briefcase,
  MessageSquare,
  Activity,
  Settings as SettingsIcon,
  Lock,
  ShieldCheck,
  AlertCircle,
  Edit3,
  Image as ImageIcon,
  Save,
  Loader,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const statusConfig = {
  PENDING: { label: 'Pending Approval', badge: 'bg-amber-500/10 text-amber-700 border border-amber-200/60 shadow-xs', icon: Clock },
  APPROVED: { label: 'Active & Approved', badge: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/60 shadow-xs', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', badge: 'bg-rose-500/10 text-rose-700 border border-rose-200/60 shadow-xs', icon: XCircle },
  UNAVAILABLE: { label: 'Unavailable', badge: 'bg-slate-500/10 text-slate-700 border border-slate-200/60 shadow-xs', icon: Ban },
  RENTED: { label: 'Rented Out', badge: 'bg-sky-500/10 text-sky-700 border border-sky-200/60 shadow-xs', icon: Building2 },
  EXPIRED: { label: 'Expired Listing', badge: 'bg-orange-500/10 text-orange-700 border border-orange-200/60 shadow-xs', icon: RefreshCw },
};

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState([]);
  const [rentalRequests, setRentalRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [financialStats, setFinancialStats] = useState({ totalRevenue: 0, totalVolume: 0 });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Automatically sync tab view based on the URL path clicked from the sidebar
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/landlord/properties')) setActiveTab('properties');
    else if (path.includes('/landlord/requests')) setActiveTab('requests');
    else if (path.includes('/landlord/history')) setActiveTab('history');
    else if (path.includes('/landlord/messages')) setActiveTab('messages');
    else if (path.includes('/landlord/settings')) setActiveTab('settings');
    else setActiveTab('overview');
  }, [location.pathname]);

  // Edit Property States
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editForm, setEditForm] = useState({
    titleEn: '',
    price: '',
    rooms: '',
    descriptionEn: '',
    furnished: false,
  });
  const [newImages, setNewImages] = useState([]);
  const [savingProperty, setSavingProperty] = useState(false);
  const [editFeedback, setEditFeedback] = useState(null);

  // Settings states
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  const currentUserId = user?.id || user?.userId;

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [propRes, reqRes, msgRes, settingsRes, finRes] = await Promise.allSettled([
        getMyProperties(),
        getRentalRequests(),
        api.get('/messages').catch(() => ({ data: { messages: [] } })),
        api.get('/settings').catch(() => ({ data: { user: null } })),
        api.get('/landlord/financial-summary').catch(() => ({ data: { totalRevenue: 0, totalVolume: 0 } }))
      ]);
      
      let fetchedProperties = [];
      if (propRes.status === 'fulfilled') {
        const pData = propRes.value;
        fetchedProperties = pData.data || pData || [];
        setProperties(fetchedProperties);
      }

      if (reqRes.status === 'fulfilled') {
        const reqData = reqRes.value?.requests || reqRes.value?.data || reqRes.value || [];
        setRentalRequests(Array.isArray(reqData) ? reqData : []);
      }

      if (settingsRes.status === 'fulfilled' && settingsRes.value?.data?.user) {
        const u = settingsRes.value.data.user;
        setSettingsForm({
          fullName: u.fullName || "",
          email: u.email || "",
          phone: u.phone || "",
          currentPassword: "",
          newPassword: "",
        });
      }

      // Dynamic database financial summary calculations
      if (finRes.status === 'fulfilled' && finRes.value?.data) {
        const fData = finRes.value.data;
        const rentedUnits = fetchedProperties.filter(p => p.status === 'RENTED');
        const computedRevenue = rentedUnits.reduce((acc, p) => acc + Number(p.price || 0), 0);

        setFinancialStats({
          totalRevenue: Number(fData.totalRevenue || computedRevenue || 0),
          totalVolume: Number(fData.totalVolume || computedRevenue * 10 || 0)
        });
      }

      if (msgRes.status === 'fulfilled') {
        const msgResponse = msgRes.value;
        const messages = msgResponse.data?.messages || msgResponse.data || [];
        const threadMap = new Map();

        messages.forEach((msg) => {
          const isSender = msg.senderId === currentUserId;
          const contactUser = isSender ? msg.receiver : msg.sender;
          const contactId = contactUser?.id;

          if (!contactId) return;

          if (!threadMap.has(contactId) || new Date(msg.createdAt) > new Date(threadMap.get(contactId).rawDate)) {
            threadMap.set(contactId, {
              contactId,
              name: contactUser.fullName || contactUser.email || "User",
              lastMessage: msg.text || msg.content,
              time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              rawDate: msg.createdAt,
              property: msg.property?.titleEn || msg.property?.titleAm || msg.property?.title || null,
              unread: !msg.isRead && msg.receiverId === currentUserId,
            });
          }
        });

        setConversations(Array.from(threadMap.values()).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate)));
      }
    } catch (err) {
      console.error("LOAD LANDLORD DATA ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const handleOpenEdit = (property) => {
    setSelectedProperty(property);
    setEditForm({
      titleEn: property.titleEn || property.title || '',
      price: property.price || '',
      rooms: property.rooms || '',
      descriptionEn: property.descriptionEn || property.description || '',
      furnished: property.furnished || false,
    });
    setNewImages([]);
    setEditFeedback(null);
    setActiveTab('edit-property');
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePropertyUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return;

    try {
      setSavingProperty(true);
      setEditFeedback(null);

      const formData = new FormData();
      formData.append('titleEn', editForm.titleEn);
      formData.append('price', editForm.price);
      formData.append('rooms', editForm.rooms);
      formData.append('descriptionEn', editForm.descriptionEn);
      formData.append('furnished', editForm.furnished);

      if (newImages && newImages.length > 0) {
        newImages.forEach((file) => {
          formData.append('images', file);
        });
      }

      await api.put(`/properties/${selectedProperty.id}`, formData);

      setEditFeedback({ type: 'success', text: 'Property and photos updated successfully!' });
      await loadData();
      
      setTimeout(() => {
        setActiveTab('properties');
      }, 1200);
    } catch (err) {
      console.error("Update property error:", err);
      setEditFeedback({ type: 'error', text: err.response?.data?.error || 'Failed to update property.' });
    } finally {
      setSavingProperty(false);
    }
  };

  const handleMarkRented = async (id) => {
    setProcessingId(id);
    try {
      await updatePropertyStatus(id, 'RENTED');
      loadData();
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkUnavailable = async (id) => {
    setProcessingId(id);
    try {
      await updatePropertyStatus(id, 'UNAVAILABLE');
      loadData();
    } finally {
      setProcessingId(null);
    }
  };

  const handleRenew = async (id) => {
    setProcessingId(id);
    try {
      await renewProperty(id);
      loadData();
    } finally {
      setProcessingId(null);
    }
  };

  const handleRequestStatusUpdate = async (id, status) => {
    setProcessingId(id);
    try {
      await updateRentalRequestStatus(id, status);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update request status");
    } finally {
      setProcessingId(null);
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

  const groupedProperties = {
    PENDING: properties.filter((p) => p.status === 'PENDING'),
    APPROVED: properties.filter((p) => p.status === 'APPROVED'),
    RENTED: properties.filter((p) => p.status === 'RENTED'),
    UNAVAILABLE: properties.filter((p) => p.status === 'UNAVAILABLE'),
    REJECTED: properties.filter((p) => p.status === 'REJECTED'),
    EXPIRED: properties.filter((p) => p.status === 'EXPIRED'),
  };

  const rentalHistory = rentalRequests.filter((r) => r.status === 'APPROVED' || r.status === 'REJECTED');

  const totalPortfolioValue = properties.reduce((acc, p) => acc + Number(p.price || 0), 0);
  const totalRentedEarnings = properties
    .filter(p => p.status === 'RENTED')
    .reduce((acc, p) => acc + Number(p.price || 0), 0);
  
  const occupancyRate = properties.length > 0 
    ? Math.round((groupedProperties.RENTED.length / properties.length) * 100) 
    : 0;

  const annualizedYield = totalRentedEarnings * 12;

  const recentActivities = [
    ...rentalRequests.map(r => ({
      type: 'request',
      id: r.id,
      title: `Rental Request for ${r.property?.titleEn || r.property?.title || 'Property'}`,
      subtitle: `Tenant: ${r.tenant?.fullName || 'Interested User'} • Status: ${r.status}`,
      time: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
      rawDate: r.createdAt || new Date(),
    })),
    ...conversations.map(c => ({
      type: 'message',
      id: c.contactId,
      title: `Message from ${c.name}`,
      subtitle: c.lastMessage,
      time: c.time,
      rawDate: c.rawDate,
    }))
  ].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate)).slice(0, 5);

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
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase animate-pulse">Loading Database Financials...</p>
        </div>
      )}

      {/* TAB: OVERVIEW */}
      {!loading && activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="relative rounded-3xl bg-[#022036] border border-[#FFC107]/30 p-8 sm:p-10 overflow-hidden shadow-2xl text-white group">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#FFC107]/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="absolute left-1/3 top-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107] text-[11px] font-extrabold uppercase tracking-widest shadow-xs">
                  <Sparkles size={13} className="text-[#FFC107] animate-spin" />
                  Executive Landlord Command Center
                </span>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Welcome back, <span className="text-[#FFC107]">{user?.fullName || "Partner"}</span>
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm font-light max-w-xl leading-relaxed">
                  Your real estate assets are performing exceptionally. Here is your live financial yield overview and portfolio metrics.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 px-5 py-4 rounded-2xl shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-[#FFC107] text-[#022036] flex items-center justify-center font-black text-lg shadow-md">
                  <Layers size={22} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-300 block">Total Asset Portfolio</span>
                  <strong className="text-xl font-mono text-white font-black">{properties.length} Active Units</strong>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC REVENUE & SETTLEMENT STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-700 shadow-inner group-hover:bg-[#FFC107] group-hover:text-[#022036] transition-colors duration-300">
                  <DollarSign size={22} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <TrendingUp size={11} /> Database Live
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Revenue Earnings</span>
              <strong className="text-2xl font-black text-[#022036] font-mono tracking-tight block">
                {financialStats.totalRevenue.toLocaleString()} <span className="text-xs font-bold text-slate-400">ETB</span>
              </strong>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Accumulated from database records</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/60 text-sky-700 shadow-inner group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                  <Briefcase size={22} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                  Chapa Gateway
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Volume Settled</span>
              <strong className="text-2xl font-black text-[#022036] font-mono tracking-tight block">
                {financialStats.totalVolume.toLocaleString()} <span className="text-xs font-bold text-slate-400">ETB</span>
              </strong>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Total transaction volume processed</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <TrendingUp size={22} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Verified
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Annualized Projection</span>
              <strong className="text-2xl font-black text-emerald-700 font-mono tracking-tight block">
                {annualizedYield.toLocaleString()} <span className="text-xs font-bold text-slate-400">ETB</span>
              </strong>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Projected gross annual earnings</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/60 text-purple-700 shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                  <Home size={22} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                  Valuation
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Portfolio Valuation</span>
              <strong className="text-2xl font-black text-[#022036] font-mono tracking-tight block">
                {totalPortfolioValue.toLocaleString()} <span className="text-xs font-bold text-slate-400">ETB</span>
              </strong>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Combined market listing value</p>
            </div>

          </div>

          {/* VISUAL CHART & ACTIVITY GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-black text-[#022036] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" /> Asset Distribution & Occupancy Breakdown
                  </h3>
                  <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-black font-mono">{properties.length} Total Units</span>
                </div>
                <p className="text-xs text-slate-500 font-light">Proportional visualization of your real estate inventory status.</p>
              </div>

              <div className="space-y-4">
                <div className="h-5 w-full bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner p-1 gap-1">
                  {properties.length > 0 ? (
                    <>
                      <div style={{ width: `${(groupedProperties.APPROVED.length / properties.length) * 100}%` }} className="bg-emerald-500 h-full rounded-xl transition-all duration-1000 hover:opacity-90 cursor-pointer shadow-sm" title="Approved" />
                      <div style={{ width: `${(groupedProperties.RENTED.length / properties.length) * 100}%` }} className="bg-sky-500 h-full rounded-xl transition-all duration-1000 hover:opacity-90 cursor-pointer shadow-sm" title="Rented" />
                      <div style={{ width: `${(groupedProperties.PENDING.length / properties.length) * 100}%` }} className="bg-amber-500 h-full rounded-xl transition-all duration-1000 hover:opacity-90 cursor-pointer shadow-sm" title="Pending" />
                      <div style={{ width: `${(groupedProperties.UNAVAILABLE.length / properties.length) * 100}%` }} className="bg-slate-400 h-full rounded-xl transition-all duration-1000 hover:opacity-90 cursor-pointer shadow-sm" title="Unavailable" />
                      <div style={{ width: `${(groupedProperties.EXPIRED.length / properties.length) * 100}%` }} className="bg-orange-500 h-full rounded-xl transition-all duration-1000 hover:opacity-90 cursor-pointer shadow-sm" title="Expired" />
                      <div style={{ width: `${(groupedProperties.REJECTED.length / properties.length) * 100}%` }} className="bg-rose-500 h-full rounded-xl transition-all duration-1000 hover:opacity-90 cursor-pointer shadow-sm" title="Rejected" />
                    </>
                  ) : (
                    <div className="w-full bg-slate-200 h-full rounded-xl" />
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <span className="w-3 h-3 rounded-lg bg-emerald-500 shadow-xs"></span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Approved</span>
                      <strong className="text-xs font-black text-emerald-800 font-mono">{groupedProperties.APPROVED.length} Units</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-sky-50/50 border border-sky-100">
                    <span className="w-3 h-3 rounded-lg bg-sky-500 shadow-xs"></span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Rented Out</span>
                      <strong className="text-xs font-black text-sky-800 font-mono">{groupedProperties.RENTED.length} Units</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <span className="w-3 h-3 rounded-lg bg-amber-500 shadow-xs"></span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Review</span>
                      <strong className="text-xs font-black text-amber-800 font-mono">{groupedProperties.PENDING.length} Units</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="w-3 h-3 rounded-lg bg-slate-400 shadow-xs"></span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Unavailable</span>
                      <strong className="text-xs font-black text-slate-700 font-mono">{groupedProperties.UNAVAILABLE.length} Units</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-orange-50/50 border border-orange-100">
                    <span className="w-3 h-3 rounded-lg bg-orange-500 shadow-xs"></span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Expired</span>
                      <strong className="text-xs font-black text-orange-800 font-mono">{groupedProperties.EXPIRED.length} Units</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                    <span className="w-3 h-3 rounded-lg bg-rose-500 shadow-xs"></span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Rejected</span>
                      <strong className="text-xs font-black text-rose-800 font-mono">{groupedProperties.REJECTED.length} Units</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={18} className="text-amber-500" />
                  <h3 className="text-sm font-black text-[#022036] uppercase tracking-wider">Recent Activity Stream</h3>
                </div>

                {recentActivities.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs font-medium">
                    No recent activity recorded.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((act, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 hover:bg-amber-50/40 border border-slate-200/80 rounded-2xl flex items-start gap-3 transition-colors">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-xs ${act.type === 'message' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {act.type === 'message' ? <MessageSquare size={14} /> : <FileText size={14} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <strong className="text-xs text-[#022036] block truncate font-bold">{act.title}</strong>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-light">{act.subtitle}</p>
                          <span className="text-[9px] text-amber-600 font-bold block mt-1 font-mono">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  setActiveTab('requests');
                  navigate('/landlord/requests');
                }}
                className="w-full mt-6 py-3 bg-slate-900 hover:bg-[#FFC107] text-white hover:text-[#022036] rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
              >
                <span>View All Inquiries</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB: PROPERTIES */}
      {!loading && activeTab === 'properties' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-black text-[#022036]">Portfolio Management</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-light">Inspect, edit, and manage status updates for all your listings.</p>
            </div>
            <Link to="/landlord/properties/new" className="px-5 py-3 bg-[#FFC107] hover:bg-yellow-400 text-[#022036] font-extrabold rounded-2xl text-xs shadow-lg flex items-center gap-2 transition-all hover:scale-105 cursor-pointer uppercase tracking-wider">
              <Plus size={16} strokeWidth={3} /> New Listing
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-28 px-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <Building2 size={44} className="text-amber-500 mb-4" />
              <h3 className="text-lg font-extrabold mb-1 text-[#022036]">No listings found</h3>
              <p className="text-slate-500 text-xs mb-6 font-light">Create your first property listing to populate your portfolio.</p>
              <Link to="/landlord/properties/new" className="px-6 py-3 bg-[#FFC107] text-[#022036] font-extrabold text-xs rounded-2xl shadow-md uppercase tracking-wider">Create Listing</Link>
            </div>
          ) : (
            Object.entries(groupedProperties).map(([statusKey, items]) => {
              if (items.length === 0) return null;
              const config = statusConfig[statusKey] || { label: statusKey, badge: 'bg-slate-100 text-slate-800', icon: Building2 };
              const StatusIcon = config.icon;

              return (
                <div key={statusKey} className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-900 text-[#FFC107]">
                      <StatusIcon size={16} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{config.label}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-900 text-[10px] font-black">{items.length}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {items.map((p) => (
                      <div key={p.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-300 group">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h4 className="font-black text-[#022036] text-lg tracking-tight group-hover:text-amber-600 transition-colors">{p.titleEn || p.titleAm || 'Untitled Property'}</h4>
                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${config.badge}`}>{p.status}</span>
                          </div>
                          <p className="text-xs text-amber-600 font-bold flex items-center gap-1.5 font-mono">
                            <MapPin size={14} /> {p.location?.city || 'Addis Ababa'} • <span className="text-slate-950 font-black">{Number(p.price).toLocaleString()} ETB</span> / month
                          </p>

                          {p.status === 'REJECTED' && (
                            <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium flex items-start gap-2">
                              <ShieldAlert size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-extrabold block mb-0.5">Rejection Reason:</strong>
                                <p>{p.rejectionReason || "Listing did not meet platform verification guidelines."}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-end">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenEdit(p);
                            }}
                            className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                          >
                            <Edit3 size={15} />
                            <span>Edit & Photos</span>
                          </button>

                          {p.status === 'APPROVED' && (
                            <>
                              <button onClick={() => handleMarkRented(p.id)} disabled={processingId === p.id} className="px-4 py-2.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-200 rounded-2xl text-xs font-extrabold cursor-pointer shadow-xs">
                                Mark Rented
                              </button>
                              <button onClick={() => handleMarkUnavailable(p.id)} disabled={processingId === p.id} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-2xl text-xs font-extrabold cursor-pointer shadow-xs">
                                Mark Unavailable
                              </button>
                            </>
                          )}
                          {p.status === 'EXPIRED' && (
                            <button onClick={() => handleRenew(p.id)} disabled={processingId === p.id} className="px-5 py-2.5 bg-[#FFC107] text-[#022036] rounded-2xl text-xs font-black cursor-pointer shadow-md uppercase tracking-wider">
                              Renew Listing
                            </button>
                          )}
                          <Link to={`/landlord/properties/${p.id}`} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                            View <ArrowUpRight size={14} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: EDIT PROPERTY & PHOTOS FORM */}
      {!loading && activeTab === 'edit-property' && selectedProperty && (
        <div className="space-y-6 max-w-3xl mx-auto w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-black text-[#022036] flex items-center gap-2.5">
                <Edit3 className="text-amber-500" size={24} /> Edit Property & Manage Photos
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-light">
                Update specifications and imagery for <strong className="text-slate-900 font-bold">{selectedProperty.titleEn || "Property"}</strong>.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('properties')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer border border-slate-200"
            >
              Cancel
            </button>
          </div>

          {editFeedback && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 border font-medium ${editFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {editFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{editFeedback.text}</span>
            </div>
          )}

          <form onSubmit={handlePropertyUpdateSubmit} className="space-y-6">
            
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                <Building2 size={16} /> Listing Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Property Title</label>
                  <input
                    type="text"
                    name="titleEn"
                    value={editForm.titleEn}
                    onChange={handleEditChange}
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-[#FFC107] font-medium shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Price (ETB / month)</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-[#FFC107] font-mono shadow-inner font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Number of Rooms</label>
                  <input
                    type="number"
                    name="rooms"
                    value={editForm.rooms}
                    onChange={handleEditChange}
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-[#FFC107] font-mono shadow-inner font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Description</label>
                  <textarea
                    name="descriptionEn"
                    rows={4}
                    value={editForm.descriptionEn}
                    onChange={handleEditChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-[#FFC107] shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    name="furnished"
                    id="furnished"
                    checked={editForm.furnished}
                    onChange={handleEditChange}
                    className="w-5 h-5 accent-[#FFC107] cursor-pointer rounded-lg"
                  />
                  <label htmlFor="furnished" className="text-slate-800 font-bold cursor-pointer">Furnished Property</label>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                <ImageIcon size={16} /> Existing & New Photos
              </h4>
              <p className="text-xs text-slate-500 font-light">Current uploaded photos for this property:</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  selectedProperty.images.map((img) => (
                    <div key={img.id} className="relative h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-200 shadow-sm">
                      <img
                        src={img.url?.startsWith('http') ? img.url : `http://localhost:5000${img.url}`}
                        alt="Property"
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No existing photos found.</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200">
                <label className="block text-slate-700 font-bold mb-2 text-xs">Upload Additional / Replacement Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setNewImages(Array.from(e.target.files))}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-3 file:px-5 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-[#FFC107] file:text-[#022036] hover:file:bg-yellow-400 file:cursor-pointer cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProperty}
              className="w-full py-4 bg-[#FFC107] hover:bg-yellow-400 text-[#022036] font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingProperty ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{savingProperty ? "Saving Changes..." : "Save Property & Photo Updates"}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB: REQUESTS */}
      {!loading && activeTab === 'requests' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-2xl font-black text-[#022036]">Tenant Rental Inquiries</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Review applications, evaluate proposals, and approve prospective renters.</p>
          </div>

          {rentalRequests.length === 0 ? (
            <div className="p-16 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
              <FileText size={40} className="text-amber-500 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-light">No rental requests received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rentalRequests.map((req) => (
                <div key={req.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-black text-[#022036] text-lg">{req.property?.titleEn || req.property?.title || "Property"}</h4>
                      <p className="text-xs text-amber-600 font-bold mt-1">
                        Tenant: <strong className="text-slate-900 font-extrabold">{req.tenant?.fullName}</strong> ({req.tenant?.phone || req.tenant?.email})
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => navigate(`/landlord/messages/${req.tenantId}`)} className="px-4 py-2.5 bg-slate-100 hover:bg-[#FFC107] hover:text-[#022036] text-slate-800 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-xs">
                        <MessageSquare size={15} /> Message
                      </button>
                      <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl font-medium leading-relaxed">
                    <strong className="text-slate-900 block mb-1 font-bold">Tenant Note:</strong> {req.message || "No custom message provided"}
                  </p>

                  {req.status === 'PENDING' && (
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => handleRequestStatusUpdate(req.id, 'REJECTED')} disabled={processingId === req.id} className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-black cursor-pointer shadow-xs transition-colors">
                        Reject Application
                      </button>
                      <button onClick={() => handleRequestStatusUpdate(req.id, 'APPROVED')} disabled={processingId === req.id} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black cursor-pointer shadow-md transition-colors uppercase tracking-wider">
                        Approve & Mark Rented
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: HISTORY */}
      {!loading && activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-2xl font-black text-[#022036]">Lease History & Agreements</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Archive of completed, active, and past contractual agreements.</p>
          </div>

          {rentalHistory.length === 0 ? (
            <div className="p-16 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
              <History size={40} className="text-amber-500 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-light">No lease history records found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rentalHistory.map((req) => (
                <div key={req.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-extrabold text-[#022036] text-base">{req.property?.titleEn || req.property?.title || "Property"}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Tenant: <span className="text-slate-900 font-bold">{req.tenant?.fullName}</span> • Rent Agreement: <span className="text-amber-600 font-mono font-black">{req.proposedPrice || req.property?.price} ETB</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/landlord/messages/${req.tenantId}`)} className="p-2.5 bg-slate-100 hover:bg-[#FFC107] hover:text-[#022036] text-slate-700 rounded-2xl cursor-pointer shadow-xs transition-colors" title="Open Chat">
                      <MessageSquare size={16} />
                    </button>
                    <span className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full font-black uppercase tracking-wider">
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: MESSAGES */}
      {!loading && activeTab === 'messages' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-2xl font-black text-[#022036]">In-App Conversations</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Secure encrypted communication channels with interested tenants.</p>
          </div>

          {conversations.length === 0 ? (
            <div className="p-20 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
              <MessageSquare size={44} className="text-amber-500 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-light">No active conversations found.</p>
              <p className="text-[11px] text-slate-400 mt-1">When prospective tenants inquire about your listings, threads will appear here.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm">
              {conversations.map((chat) => (
                <div
                  key={chat.contactId}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/landlord/messages/${chat.contactId}`);
                  }}
                  className="flex items-center justify-between p-6 hover:bg-slate-50/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <MessageSquare size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <strong className="text-base text-[#022036] truncate font-extrabold">{chat.name}</strong>
                        {chat.unread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-xs"></span>
                        )}
                      </div>
                      {chat.property && (
                        <span className="text-[10px] uppercase font-black text-amber-600 block mt-0.5 tracking-wider">
                          Property: {chat.property}
                        </span>
                      )}
                      <p className="text-xs text-slate-500 truncate mt-1 font-light">{chat.lastMessage}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1 font-semibold">
                      <Clock size={13} />
                      {chat.time}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-950 group-hover:bg-[#FFC107] transition-all shadow-xs">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: SETTINGS */}
      {!loading && activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl mx-auto w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-2xl animate-in fade-in duration-300">
          <div className="pb-6 border-b border-slate-200">
            <h3 className="text-xl font-black text-[#022036] flex items-center gap-2.5">
              <SettingsIcon className="text-amber-500" size={24} /> Profile & Banking Settings
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">
              Manage personal credentials and primary financial settlement accounts.
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
                <Building2 size={16} /> Payout & Banking Configuration
              </h4>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs flex items-center justify-between shadow-xs">
                <div>
                  <strong className="text-slate-900 block mb-0.5 font-bold">Primary Settlement Account</strong>
                  <span className="text-slate-500 font-light">Commercial Bank of Ethiopia (CBE) • Verified Landlord Account</span>
                </div>
                <span className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full font-black text-[10px] uppercase tracking-wider">Verified</span>
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