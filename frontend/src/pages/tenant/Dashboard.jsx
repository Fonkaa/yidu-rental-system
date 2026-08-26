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

  });

  const [loadingProps, setLoadingProps] = useState(true);



  const userName = user?.fullName || "Valued Tenant";



  const t = {

    welcome: "Welcome back",

    findRent: "Find, rent, and manage your perfect home with ease.",

    searchPlaceholder: "Search location, city, or property...",

    allTypes: "All Types",

    search: "Search",

    availableProperties: "Available Properties",

    savedProperties: "Saved Properties",

    requests: "My Requests",

    activeLeases: "Active Leases",

    featuredProperties: "All Properties",

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

        });

      } catch (err) {

        console.error("Dashboard data fetch error:", err);

      } finally {

        setLoadingProps(false);

      }

    };



    fetchDashboardData();

  }, [user?.id]);



  return (

    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-8 bg-white">

     

      {/* HERO BANNER */}

      <section className="relative rounded-3xl bg-[#022036] border border-[#FFC107]/30 p-8 sm:p-12 overflow-hidden shadow-md text-white">

        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80')` }}></div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#022036] via-[#022036]/95 to-transparent"></div>



        <div className="relative z-10 max-w-2xl">

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/20 text-[#FFC107] text-xs font-bold mb-4 shadow-xs">

            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107] animate-ping"></span>

            Teamwork IT Solutions Platform

          </span>



          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">

            {t.welcome}, <span className="text-[#FFC107]">{userName}</span>!

          </h1>

          <p className="text-slate-300 text-sm leading-relaxed mb-8">

            {t.findRent}

          </p>



          {/* SEARCH BAR */}

          <div className="bg-white/10 backdrop-blur-2xl border border-white/15 p-2 rounded-2xl flex flex-col lg:flex-row gap-2 shadow-xl">

            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">

              <Search size={18} className="text-[#FFC107]" />

              <input

                type="text"

                placeholder={t.searchPlaceholder}

                className="w-full bg-transparent border-none text-white placeholder-white/40 text-xs focus:outline-none"

              />

            </div>



            <select defaultValue="" className="px-4 py-3 bg-[#022036] border border-white/10 rounded-xl text-white text-xs focus:outline-none cursor-pointer">

              <option value="" disabled>{t.allTypes}</option>

              <option value="Apartment">Apartment</option>

              <option value="Villa">Villa</option>

              <option value="House">House</option>

            </select>



            <button

              className="px-6 py-3 bg-[#FFC107] hover:bg-[#ffcd38] text-[#022036] font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"

              onClick={() => navigate("/properties")}

            >

              <Search size={15} />

              <span>{t.search}</span>

            </button>

          </div>

        </div>

      </section>



      {/* STATISTICS GRID */}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {[

          { label: t.availableProperties, count: statsCounts.available, icon: Building2, color: "text-sky-700", bg: "bg-sky-50 border-sky-100" },

          { label: t.savedProperties, count: statsCounts.saved, icon: Heart, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },

          { label: t.requests, count: statsCounts.requests, icon: Building2, color: "text-yellow-800", bg: "bg-yellow-50 border-yellow-200" },

          { label: t.activeLeases, count: statsCounts.leases, icon: Building2, color: "text-purple-700", bg: "bg-purple-50 border-purple-100" },

        ].map((stat, i) => {

          const Icon = stat.icon;

          return (

            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">

              <div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">{stat.label}</span>

                <strong className="text-xl font-extrabold text-[#022036] font-mono">{stat.count}</strong>

                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 font-bold">

                  <TrendingUp size={12} />

                  <span>15% {t.increase}</span>

                </div>

              </div>

              <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>

                <Icon size={20} />

              </div>

            </div>

          );

        })}

      </section>



      {/* ALL PROPERTIES SECTION */}

      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">

          <div>

            <h2 className="text-base font-bold text-[#022036] uppercase tracking-wider">{t.featuredProperties}</h2>

            <p className="text-xs text-slate-500 mt-0.5">{t.discoverHomes} (Scroll sideways to view all listings)</p>

          </div>

          <button

            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-[#022036] transition-all cursor-pointer flex items-center gap-1.5"

            onClick={() => navigate("/properties")}

          >

            <span>{t.viewAll}</span>

            <span>→</span>

          </button>

        </div>



        {loadingProps ? (

          <div className="flex justify-center items-center py-16">

            <Loader2 size={32} className="animate-spin text-[#FFC107]" />

          </div>

        ) : properties.length === 0 ? (

          <div className="text-center py-12 text-slate-400 text-xs">No properties found in the database.</div>

        ) : (

          <div className="relative group">

            <div className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-[#FFC107]/40 scrollbar-track-slate-100 snap-x">

              {properties.map((property) => {

                const statusVal = String(property.status || "").trim().toUpperCase();

                const isRented = statusVal === "RENTED" || statusVal === "OCCUPIED" || statusVal === "LEASED" || statusVal === "UNAVAILABLE";



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



                return (

                  <div key={property.id} className="min-w-[300px] sm:min-w-[340px] max-w-[340px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden group/card hover:border-[#FFC107]/50 transition-all shadow-xs flex flex-col snap-start flex-shrink-0">

                    <div className="relative h-48 overflow-hidden bg-slate-200">

                      <img

                        src={imgUrl}

                        alt={property.titleEn || property.title || "Property"}

                        loading="lazy"

                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"

                      />

                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-extrabold tracking-wider uppercase border shadow-xs ${isRented ? 'bg-red-500 text-white border-red-400' : 'bg-emerald-600 text-white border-emerald-500'}`}>

                        {isRented ? t.rented : t.available}

                      </span>

                      <button

                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-[#FFC107] transition-colors cursor-pointer"

                        onClick={() => navigate("/favorites")}

                      >

                        <Heart size={16} />

                      </button>

                    </div>



                    <div className="p-5 flex flex-col flex-1 justify-between">

                      <div>

                        <h3 className="font-bold text-[#022036] text-base mb-1 truncate">{property.titleEn || property.title || "Modern Property"}</h3>

                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">

                          <MapPin size={13} className="text-yellow-600" />

                          <span className="truncate">{property.location?.city || property.location || "Addis Ababa"}</span>

                        </div>

                        <div className="flex items-baseline gap-1 mb-4">

                          <strong className="text-xl font-extrabold text-[#022036] font-mono">{Number(property.price || 500).toLocaleString()}</strong>

                          <span className="text-xs text-slate-400">ETB {t.month}</span>

                        </div>

                      </div>



                      <div>

                        <div className="flex items-center justify-between text-xs text-slate-600 py-2.5 border-t border-b border-slate-200 mb-4 font-mono">

                          <span className="flex items-center gap-1"><BedDouble size={14} className="text-slate-400" /> {property.rooms || 2} {t.beds}</span>

                          <span className="flex items-center gap-1"><Maximize size={14} className="text-slate-400" /> {property.area || 100} m²</span>

                        </div>



                        <button

                          className="w-full py-2.5 bg-[#022036] hover:bg-[#FFC107] text-[#FFC107] hover:text-[#022036] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"

                          onClick={() => navigate(`/properties/${property.id}`)}

                        >

                          {t.viewDetails}

                        </button>

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          </div>

        )}

      </section>



      {/* BENEFITS SECTION */}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">

        {[

          { title: t.safeSecure, desc: t.safetyPriority, icon: BadgeCheck, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },

          { title: t.verifiedProperties, desc: t.listingsVerified, icon: ShieldCheck, color: "text-sky-700", bg: "bg-sky-50 border-sky-100" },

          { title: t.bestPrice, desc: t.affordable, icon: Building2, color: "text-yellow-800", bg: "bg-yellow-50 border-yellow-200" },

          { title: t.support, desc: t.hereForYou, icon: Headphones, color: "text-purple-700", bg: "bg-purple-50 border-purple-100" },

        ].map((benefit, i) => {

          const Icon = benefit.icon;

          return (

            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">

              <div className={`p-3.5 rounded-xl border ${benefit.bg} ${benefit.color}`}>

                <Icon size={20} />

              </div>

              <div>

                <strong className="text-xs font-bold text-[#022036] block mb-0.5">{benefit.title}</strong>

                <span className="text-[11px] text-slate-500 leading-tight block">{benefit.desc}</span>

              </div>

            </div>

          );

        })}

      </section>



    </div>

  );

} 

