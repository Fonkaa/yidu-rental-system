import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import {
  Building2,
  Heart,
  Search,
  MapPin,
  TrendingUp,
  BedDouble,
  Maximize,
  ShieldCheck,
  Loader2,
  BadgeCheck,
  Headphones,
  MessageSquare,
  Home,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  User,
  Settings,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ChevronLeft,
  UserCircle,
  Briefcase,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [statsCounts, setStatsCounts] = useState({
    available: 0,
    saved: 0,
    requests: 0,
    leases: 0,
    messages: 0,
  });
  const [loadingProps, setLoadingProps] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("");

  const userName = user?.fullName || "Valued Tenant";

  const t = {
    welcome: "Welcome back",
    findRent: "Find, rent, and manage your perfect home with ease.",
    searchPlaceholder: "Search location, city, or property...",
    allTypes: "All Types",
    search: "Search",
    availableProperties: "Available Properties",
    savedProperties: "Favorites",
    requests: "My Requests",
    activeLeases: "My Leases",
    featuredProperties: "Featured Properties",
    viewAll: "View All",
    rented: "Rented",
    available: "Available",
    viewDetails: "View Details",
    beds: "Beds",
    month: "/ month",
    safeSecure: "Safe & Secure",
    safetyPriority: "Your safety is our priority",
    verifiedProperties: "Verified Properties",
    listingsVerified: "All listings are verified",
    bestPrice: "Best Price",
    affordable: "Affordable for you",
    support: "24/7 Support",
    hereForYou: "We are here for you",
    increase: "from last month",
    discoverHomes: "Discover homes that match your needs",
    messages: "Messages",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    dashboard: "Dashboard",
    favorites: "Favorites",
    myLeases: "My Leases",
    myRequests: "My Requests",
    searchProperties: "Search Properties",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingProps(true);
        const res = await api.get("/dashboard");
        const data = res.data || {};
        const propData = data.properties || [];

        setProperties(Array.isArray(propData) ? propData : []);

        const availableCount = (Array.isArray(propData) ? propData : []).filter(
          (p) => String(p.status || "").trim().toUpperCase() === "APPROVED" || String(p.status || "").trim().toUpperCase() === "AVAILABLE"
        ).length;

        setStatsCounts({
          available: availableCount || propData.length,
          saved: data.stats?.saved || 0,
          requests: data.stats?.requests || 0,
          leases: data.stats?.leases || 0,
          messages: data.stats?.messages || 0,
        });
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoadingProps(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const handleMessageOwner = (landlordId, propertyId) => {
    if (!landlordId) {
      alert("Owner contact information is unavailable for this listing.");
      return;
    }
    navigate(`/messages/${landlordId}`, { state: { propertyId } });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/properties?search=${searchQuery}&type=${searchType}`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-amber-50/20">

      {/* =====================================================
          WELCOME BANNER - MINIMIZED
      ===================================================== */}

      <section className="relative rounded-2xl bg-[#022036] border-2 border-black p-5 sm:p-6 overflow-hidden shadow-lg text-white">

        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#FFC107]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-3">

          <div className="text-center lg:text-left">
            <span className="inline-flex items-center justify-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107] text-[7px] font-black uppercase tracking-[0.18em] mb-1.5">
              <Sparkles size={10} />
              Teamwork IT Solutions
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {t.welcome} : <span className="text-[#FFC107]">{userName}</span>
            </h1>
           
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-lg shadow-xl">
              <div className="w-6 h-6 rounded-lg bg-[#FFC107] text-[#022036] flex items-center justify-center shadow-md">
                <Home size={12} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[6px] uppercase font-black tracking-[0.15em] text-slate-400 block">
                  Available
                </span>
                <strong className="text-xs font-mono text-white font-black">
                  {statsCounts.available}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-lg shadow-xl">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-md">
                <Bell size={12} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[6px] uppercase font-black tracking-[0.15em] text-slate-400 block">
                  Messages
                </span>
                <strong className="text-xs font-mono text-white font-black">
                  {statsCounts.messages}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH BAR - MINIMIZED */}
        <form onSubmit={handleSearch} className="relative z-10 mt-3">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/15 p-1 rounded-xl flex flex-col sm:flex-row gap-1 shadow-xl">

            <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/10">
              <Search size={12} className="text-[#FFC107]" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-white placeholder-white/40 text-[10px] focus:outline-none font-medium"
              />
            </div>

            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-2.5 py-1 bg-[#022036] border border-white/10 rounded-lg text-white text-[10px] focus:outline-none cursor-pointer font-bold"
            >
              <option value="">{t.allTypes}</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="House">House</option>
              <option value="Condo">Condo</option>
              <option value="Studio">Studio</option>
            </select>

            <button
              type="submit"
              className="px-3 py-1 bg-[#FFC107] hover:bg-[#ffcd38] text-[#022036] font-black text-[10px] rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1 border-2 border-[#e5ac00]"
            >
              <Search size={11} />
              <span>{t.search}</span>
            </button>
          </div>
        </form>
      </section>

      {/* =====================================================
          STATISTICS GRID - 5 CARDS
      ===================================================== */}

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

        {[
          { label: t.availableProperties, count: statsCounts.available, icon: Home, color: "text-green-700", bg: "bg-green-50 border-green-200", path: "/properties" },
          { label: t.favorites, count: statsCounts.saved, icon: Heart, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", path: "/favorites" },
          { label: t.myRequests, count: statsCounts.requests, icon: FileText, color: "text-yellow-800", bg: "bg-yellow-50 border-yellow-200", path: "/rental-requests" },
          { label: t.messages, count: statsCounts.messages, icon: MessageSquare, color: "text-purple-700", bg: "bg-purple-50 border-purple-200", path: "/messages" },
          { label: t.myLeases, count: statsCounts.leases, icon: Building2, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", path: "/leases" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              onClick={() => navigate(stat.path)}
              className="group relative bg-white rounded-[1.5rem] border-2 border-black/20 p-3.5 shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-yellow-500 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[7px] font-black uppercase tracking-[0.12em] text-black/50 block mb-0.5">{stat.label}</span>
                  <strong className="text-lg sm:text-xl font-black text-[#022036] font-mono tracking-tight">{stat.count}</strong>
                </div>
                <div className={`p-2 rounded-xl border-2 border-black/20 ${stat.bg} ${stat.color} group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300`}>
                  <Icon size={14} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* =====================================================
          ALL PROPERTIES SECTION
      ===================================================== */}

      <section className="bg-white border-2 border-black rounded-2xl p-5 sm:p-6 shadow-lg">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b-2 border-black/10 gap-2">

          <div>
            <h2 className="text-sm font-black text-[#022036] uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-black" />
              {t.featuredProperties}
            </h2>
            <p className="text-[9px] text-black/40 mt-0.5 font-light">
              {t.discoverHomes}
            </p>
          </div>

          <button
            className="px-3 py-1.5 bg-black/5 hover:bg-black border-2 border-black/20 hover:border-black rounded-xl text-[9px] font-black text-[#022036] transition-all cursor-pointer flex items-center gap-1.5 group"
            onClick={() => navigate("/properties")}
          >
            <span>{t.viewAll}</span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loadingProps ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 size={24} className="animate-spin text-[#FFC107]" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-black/5 border-2 border-black/10 flex items-center justify-center mx-auto mb-2">
              <Home size={20} className="text-black/40" />
            </div>
            <p className="text-sm font-black text-[#022036]">No properties found</p>
            <p className="text-[10px] text-black/40 mt-1">There are currently no properties available.</p>
          </div>
        ) : (
          <div className="relative group">
            <div className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-slate-100 snap-x">

              {properties.slice(0, 10).map((property) => {
                const statusVal = String(property.status || "").trim().toUpperCase();
                const isRented = statusVal === "RENTED" || statusVal === "OCCUPIED" || statusVal === "LEASED" || statusVal === "UNAVAILABLE";
                const landlordId = property.landlordId || property.landlord?.id;

                let imgUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=85";
                if (Array.isArray(property.images) && property.images.length > 0) {
                  const rawUrl = property.images[0]?.url || property.images[0];
                  if (rawUrl) {
                    imgUrl = rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                  }
                } else if (property.image) {
                  imgUrl = property.image.startsWith('http') ? property.image : `http://localhost:5000${property.image.startsWith('/') ? '' : '/'}${property.image}`;
                } else if (property.imageUrl) {
                  imgUrl = property.imageUrl.startsWith('http') ? property.imageUrl : `http://localhost:5000${property.imageUrl.startsWith('/') ? '' : '/'}${property.imageUrl}`;
                }

                const rawVideoUrl = property.videoUrl;
                const videoUrl = rawVideoUrl
                  ? rawVideoUrl.startsWith('http') ? rawVideoUrl : `http://localhost:5000${rawVideoUrl.startsWith('/') ? '' : '/'}${rawVideoUrl}`
                  : null;

                return (
                  <div key={property.id} className="min-w-[240px] sm:min-w-[260px] max-w-[260px] bg-white border-2 border-black/20 rounded-2xl overflow-hidden group/card hover:border-black transition-all shadow-sm hover:shadow-lg flex flex-col snap-start flex-shrink-0">

                    <div className="relative h-32 overflow-hidden bg-slate-900">
                      {videoUrl ? (
                        <video
                          src={videoUrl}
                          controls
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={imgUrl}
                          alt={property.titleEn || property.title || "Property"}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        />
                      )}
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full backdrop-blur-md text-[7px] font-black tracking-wider uppercase border shadow-xs ${
                        isRented 
                          ? 'bg-red-500 text-white border-red-400' 
                          : 'bg-emerald-600 text-white border-emerald-500'
                      }`}>
                        {isRented ? t.rented : videoUrl ? "Video Tour" : t.available}
                      </span>
                      <button
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-[#FFC107] transition-colors cursor-pointer border border-white/10"
                        onClick={() => navigate("/favorites")}
                      >
                        <Heart size={12} />
                      </button>
                      {!isRented && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[6px] font-black text-white border border-white/10">
                          <Clock size={8} />
                          <span>Just Listed</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex flex-col flex-1 justify-between">

                      <div>
                        <h3 className="font-black text-[#022036] text-[11px] mb-0.5 truncate">
                          {property.titleEn || property.title || "Modern Property"}
                        </h3>
                        <div className="flex items-center gap-1 text-[8px] text-black/50 mb-1">
                          <MapPin size={9} className="text-[#FFC107]" />
                          <span className="truncate">{property.location?.city || property.location || "Addis Ababa"}</span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-2">
                          <strong className="text-sm font-black text-[#022036] font-mono">
                            {Number(property.price || 500).toLocaleString()}
                          </strong>
                          <span className="text-[8px] text-black/40">ETB {t.month}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[8px] text-black/60 py-1.5 border-t-2 border-b-2 border-black/10 mb-2 font-mono">
                          <span className="flex items-center gap-1">
                            <BedDouble size={10} className="text-black/40" /> 
                            {property.rooms || 2} {t.beds}
                          </span>
                          <span className="flex items-center gap-1">
                            <Maximize size={10} className="text-black/40" /> 
                            {property.area || 100} m²
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMessageOwner(landlordId, property.id)}
                            className="p-1.5 bg-black/5 hover:bg-black text-[#022036] hover:text-white rounded-lg transition-all cursor-pointer shadow-xs font-bold flex items-center justify-center border-2 border-black/20 hover:border-black"
                            title="Message Property Owner"
                          >
                            <MessageSquare size={11} />
                          </button>

                          <button
                            className="flex-1 py-1.5 bg-[#022036] hover:bg-black text-[#FFC107] hover:text-white rounded-lg text-[8px] font-black transition-all cursor-pointer shadow-xs border-2 border-[#022036] hover:border-black"
                            onClick={() => navigate(`/properties/${property.id}`)}
                          >
                            {t.viewDetails}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          BENEFITS SECTION
      ===================================================== */}

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {[
          { title: t.safeSecure, desc: t.safetyPriority, icon: ShieldCheck, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { title: t.verifiedProperties, desc: t.listingsVerified, icon: BadgeCheck, color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
          { title: t.bestPrice, desc: t.affordable, icon: Home, color: "text-yellow-800", bg: "bg-yellow-50 border-yellow-200" },
          { title: t.support, desc: t.hereForYou, icon: Headphones, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
        ].map((benefit, i) => {
          const Icon = benefit.icon;
          return (
            <div key={i} className="group bg-white rounded-[1.5rem] border-2 border-black/20 p-3 shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-black transition-all duration-300 flex items-center gap-2.5 overflow-hidden relative">

              <div className="absolute inset-x-0 top-0 h-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className={`p-2 rounded-xl border-2 border-black/20 ${benefit.bg} ${benefit.color} group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300 shrink-0`}>
                <Icon size={14} strokeWidth={2.5} />
              </div>

              <div>
                <strong className="text-[9px] font-black text-[#022036] block mb-0.5">{benefit.title}</strong>
                <span className="text-[8px] text-black/50 leading-tight block font-light">{benefit.desc}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t-2 border-black/10 pb-1">

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[7px] font-black text-black/60 uppercase tracking-widest">
              System Online
            </span>
          </div>
          <div className="w-px h-2.5 bg-black/10" />
          <div className="flex items-center gap-1">
            <Clock size={9} className="text-black/40" />
            <span className="text-[7px] font-mono text-black/40">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[7px] text-black/30 font-mono">
          <span>© {new Date().getFullYear()} Teamwork IT Solutions</span>
          <span className="w-px h-2.5 bg-black/10" />
          <span>v2.0.1</span>
        </div>
      </div>

    </div>
  );
}