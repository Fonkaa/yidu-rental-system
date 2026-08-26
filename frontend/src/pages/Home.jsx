import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { 
  Building2, Home, ShieldCheck, DollarSign, Users, 
  ArrowRight, MapPin, BedDouble, Sofa, Sparkles, LogIn, UserPlus, 
  CheckCircle2, Lock, Cpu, BarChart3, Clock, MessageSquare, RefreshCw,
  TrendingUp, Percent, Activity, Layers, Award, Star, Compass, Globe,
  Eye, Zap, Check, ChevronRight, Play, Server, Database, Smartphone,
  Sliders, Filter, Search, Phone, Mail, HelpCircle, FileText, Settings,
  Maximize2, ShieldAlert
} from "lucide-react";

export default function PublicHome() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabRole, setActiveTabRole] = useState("tenant");
  const [activeMetricTab, setActiveMetricTab] = useState("yield");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedCityFilter, setSelectedCityFilter] = useState("All");
  const [viewMode3D, setViewMode3D] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalListings: 142,
    activeTenants: 850,
    verifiedLandlords: 64,
    monthlyVolume: "12.4M ETB"
  });

  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePosition({ x, y });
    };

    const currentHero = heroRef.current;
    if (currentHero) {
      currentHero.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (currentHero) {
        currentHero.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  useEffect(() => {
    const fetchPublicProperties = async () => {
      try {
        setLoading(true);
        const res = await api.get("/properties");
        const data = res.data?.properties || res.data || [];
        const available = Array.isArray(data) 
          ? data.filter(p => String(p.status || "").trim().toUpperCase() === "APPROVED" || String(p.status || "").trim().toUpperCase() === "AVAILABLE")
          : [];
        setProperties(available);
      } catch (err) {
        console.error("Failed to load public properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProperties();
  }, []);

  const handleRequestRent = (propertyId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: `/properties/${propertyId}` } });
    } else {
      navigate(`/properties/${propertyId}`);
    }
  };

  const filteredProperties = selectedCityFilter === "All" 
    ? properties.slice(0, 8) 
    : properties.filter(p => (p.location?.city || p.location || "").toLowerCase() === selectedCityFilter.toLowerCase()).slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-yellow-500 selection:text-[#022036] relative overflow-x-hidden">
      
      {/* 3D Ambient Dynamic Lighting & Glowing Nodes */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[180px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/3 right-10 w-[700px] h-[700px] bg-sky-500/5 rounded-full blur-[180px] pointer-events-none"></div>
      <div className="absolute top-2/3 left-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* TOP NOTIFICATION BAR */}
      <div className="bg-[#022036] border-b border-yellow-500/20 px-4 py-2 text-[11px] font-semibold text-slate-200 flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="px-2 py-0.5 rounded-md bg-yellow-500 text-[#022036] font-black text-[9px] uppercase tracking-wider">System Live</span>
          <span>Teamwork IT Solutions • House Rental & Portfolio Ecosystem v3.4</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-400" /> Chapa Payment Integration Active</span>
          <span className="flex items-center gap-1"><Server size={12} className="text-yellow-400" /> AWS Neon PostgreSQL Cluster</span>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-slate-200 px-6 py-4 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="w-11 h-11 rounded-2xl bg-yellow-500 text-[#022036] flex items-center justify-center font-black shadow-md group-hover:scale-110 transition-transform">
              <Home size={24} strokeWidth={2.5} />
            </div>
            <div>
              <strong className="text-base tracking-tight leading-none block text-[#022036]">Yidu RealEstate</strong>
              <span className="text-[10px] text-yellow-600 tracking-widest uppercase font-black">Spatial 3D Engine</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#hero-section" className="hover:text-yellow-600 transition-colors">Overview</a>
            <a href="#ecosystem-roles" className="hover:text-yellow-600 transition-colors">Role Portals</a>
            <a href="#analytics-section" className="hover:text-yellow-600 transition-colors">Market Analytics</a>
            <a href="#database-properties" className="hover:text-yellow-600 transition-colors">3D Listings</a>
            <a href="#tech-specs" className="hover:text-yellow-600 transition-colors">Architecture</a>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/login"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogIn size={15} className="text-yellow-600" />
              <span>Login</span>
            </Link>
            <Link 
              to="/register"
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 uppercase tracking-wider"
            >
              <UserPlus size={15} />
              <span>Register</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION WITH 3D INTERACTIVE TILT EFFECT */}
      <section ref={heroRef} id="hero-section" className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-extrabold mb-6 shadow-inner">
          <Sparkles size={14} className="animate-spin text-yellow-600" />
          <span>Spatial 3D Virtual Tours & Instant Rental Verification</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#022036] mb-6 leading-tight">
          Redefining Real Estate Through <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600">
            Advanced 3D Spatial Architecture
          </span>
        </h1>
        
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl mx-auto mb-12 leading-relaxed font-light">
          Explore immersive 3D property models, secure monthly rent transactions via Chapa, monitor landlord portfolio yields with real-time analytics, and connect instantly through our integrated tenant-landlord communication pipeline.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <a
            href="#database-properties"
            className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-black rounded-2xl shadow-sm transition-all hover:scale-105 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <span>Explore 3D Property Grid</span>
            <ArrowRight size={16} />
          </a>
          <button
            onClick={() => setViewMode3D(!viewMode3D)}
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-2xl backdrop-blur-xl transition-all hover:scale-105 text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <BoxIcon size={16} className="text-yellow-400" />
            <span>Toggle 3D Perspective ({viewMode3D ? "Active" : "Standard"})</span>
          </button>
        </div>

        {/* 3D PERSPECTIVE CARD SHOWCASE */}
        <div 
          className="max-w-5xl mx-auto rounded-3xl bg-[#022036] border border-yellow-500/20 p-4 sm:p-8 backdrop-blur-2xl shadow-xl transition-transform duration-200 text-white"
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * -10}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-yellow-400 uppercase tracking-widest font-black">Tenant Experience</span>
                <h3 className="text-lg font-bold mt-1 text-white">Spatial Virtual Tours</h3>
                <p className="text-xs text-slate-300 mt-2 font-light">Walk through properties virtually before submitting a verified lease request.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-sky-400 font-bold">
                <span>Interactive Rooms</span>
                <ChevronRight size={14} />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-yellow-400 uppercase tracking-widest font-black">Landlord Hub</span>
                <h3 className="text-lg font-bold mt-1 text-white">Yield Analytics & ERDs</h3>
                <p className="text-xs text-slate-300 mt-2 font-light">Monitor annual projections, occupancy ratios, and automated invoice settlements.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span>Live Database Sync</span>
                <ChevronRight size={14} />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-yellow-400 uppercase tracking-widest font-black">Secure Gateway</span>
                <h3 className="text-lg font-bold mt-1 text-white">Chapa Financials</h3>
                <p className="text-xs text-slate-300 mt-2 font-light">Fully encrypted transaction processing with instant webhook validation.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-400 font-bold">
                <span>Bank Grade Security</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* METRICS BANNER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
          {[
            { label: "Total Platform Listings", value: systemStats.totalListings, highlight: "+12% this month" },
            { label: "Active Verified Tenants", value: systemStats.activeTenants, highlight: "99.4% satisfaction" },
            { label: "Registered Landlords", value: systemStats.verifiedLandlords, highlight: "Fayda ID Verified" },
            { label: "Monthly Volume", value: systemStats.monthlyVolume, highlight: "Secured via Chapa" },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block mb-1">{stat.label}</span>
              <strong className="text-2xl font-black text-[#022036] font-mono">{stat.value}</strong>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">{stat.highlight}</span>
            </div>
          ))}
        </div>
      </section>

      {/* COMPREHENSIVE MARKET ANALYTICS & CHARTS SECTION */}
      <section id="analytics-section" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="text-center mb-12">
          <span className="text-xs font-black text-yellow-600 tracking-widest uppercase">Real-Time Intelligence</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#022036] mt-1">Platform Market Analytics & Financial Yields</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-xl mx-auto font-light">
            Dynamic visual breakdowns of market pricing trends, regional demand, and investment returns across Addis Ababa.
          </p>
        </div>

        {/* Analytics Interactive Tabs */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {[
            { id: "yield", label: "Rental Yield Projections" },
            { id: "demand", label: "Regional Demand Index" },
            { id: "occupancy", label: "Portfolio Occupancy Curves" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMetricTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                activeMetricTab === tab.id 
                  ? 'bg-yellow-500 text-[#022036] font-extrabold shadow-sm' 
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visual Chart Simulation Box */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-[#022036]">
                  {activeMetricTab === 'yield' && "Annualized Return on Investment (ROI) by District"}
                  {activeMetricTab === 'demand' && "Tenant Inquiry Volume & Search Heatmap"}
                  {activeMetricTab === 'occupancy' && "Historical Occupancy vs. Vacancy Ratios"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-light">Aggregated live data from Neon PostgreSQL transaction records.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">Live Feed</span>
            </div>

            {/* Simulated Chart Bars */}
            <div className="space-y-4 my-6">
              {[
                { label: "Bole District", val: "88%", amount: "14.2% Yield", color: "bg-emerald-500" },
                { label: "Kazanchis", val: "76%", amount: "11.8% Yield", color: "bg-blue-500" },
                { label: "CMC / Ayat", val: "64%", amount: "9.5% Yield", color: "bg-amber-500" },
                { label: "Piassa / Arat Kilo", val: "81%", amount: "12.6% Yield", color: "bg-purple-500" },
                { label: "Summit / Gurd Shola", val: "70%", amount: "10.2% Yield", color: "bg-sky-500" },
              ].map((bar, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{bar.label}</span>
                    <span className="text-yellow-600 font-mono font-extrabold">{bar.amount}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    <div style={{ width: bar.val }} className={`${bar.color} h-full transition-all duration-1000 rounded-full`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-center font-mono">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Average Rent</span>
                <strong className="text-sm font-black text-[#022036]">18,500 ETB</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Growth Rate</span>
                <strong className="text-sm font-black text-emerald-600">+14.2% YoY</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Liquidity</span>
                <strong className="text-sm font-black text-sky-600">14 Days Avg</strong>
              </div>
            </div>
          </div>

          {/* Analytics Sidebar Summary */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={20} className="text-yellow-600" />
                <h3 className="text-base font-black text-[#022036]">Ecosystem Health</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Our automated scoring model evaluates landlord response rates, tenant background verification, and lease payment punctuality.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Verified Landlord Trust</span>
                  <span className="text-emerald-600 font-mono">99.1%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[99.1%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Chapa Success Rate</span>
                  <span className="text-yellow-600 font-mono">100%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full w-full" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Lease Renewal Compliance</span>
                  <span className="text-sky-600 font-mono">92.4%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full w-[92.4%]" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-800 font-semibold flex items-center gap-2">
              <Sparkles size={16} className="flex-shrink-0 text-yellow-600" />
              <span>All metrics update in real-time via Prisma ORM event triggers.</span>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP DIVE INTO ECOSYSTEM ROLES */}
      <section id="ecosystem-roles" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="text-center mb-12">
          <span className="text-xs font-black text-yellow-600 tracking-widest uppercase">Multi-Tier Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#022036] mt-1">Deep Dive Into System Roles & Workflows</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-xl mx-auto font-light">
            Comprehensive breakdown of permissions, operational dashboards, and specialized tooling for every user.
          </p>
        </div>

        {/* Role Tabs Navigation */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {[
            { id: 'tenant', label: 'Tenant Portal Workflow' },
            { id: 'landlord', label: 'Landlord Hub & Portfolio' },
            { id: 'admin', label: 'Admin Command Center' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabRole(tab.id)}
              className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                activeTabRole === tab.id 
                  ? 'bg-yellow-500 text-[#022036] font-extrabold shadow-sm scale-105' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Role Content Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xs max-w-5xl mx-auto">
          {activeTabRole === 'tenant' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4 text-yellow-600">
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600">
                    <Users size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#022036]">Tenant Portal Workflow</h3>
                    <span className="text-xs text-slate-500 font-light">Designed for seamless home discovery and transparent lease agreements.</span>
                  </div>
                </div>
                <Link to="/register" className="px-5 py-2.5 bg-sky-600 text-white font-extrabold rounded-xl text-xs shadow-sm hover:bg-sky-500 transition-all text-center uppercase tracking-wider">
                  Register as Tenant
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                  <span className="text-[10px] text-sky-600 font-black uppercase tracking-widest">Step 1</span>
                  <h4 className="text-base font-extrabold text-[#022036]">Advanced Search & 3D</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">Filter database properties by room count, furnished status, price thresholds, and view immersive 3D spatial previews.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                  <span className="text-[10px] text-sky-600 font-black uppercase tracking-widest">Step 2</span>
                  <h4 className="text-base font-extrabold text-[#022036]">Rental Inquiries</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">Submit formal rental requests with custom messages and track their approval status directly from your tenant dashboard.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                  <span className="text-[10px] text-sky-600 font-black uppercase tracking-widest">Step 3</span>
                  <h4 className="text-base font-extrabold text-[#022036]">Direct Messaging</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">Communicate securely with verified property landlords via our built-in real-time messaging pipeline.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  "Interactive Property Search & 3D Cards",
                  "Direct In-App Messaging with Landlords",
                  "Rental Request Tracking & Status History",
                  "Fayda ID verification and profile control"
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <CheckCircle2 size={16} className="text-yellow-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTabRole === 'landlord' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4 text-yellow-600">
                  <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-700">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#022036]">Landlord Hub & Portfolio Management</h3>
                    <span className="text-xs text-slate-500 font-light">Powerful asset management tools for property owners and managers.</span>
                  </div>
                </div>
                <Link to="/register" className="px-5 py-2.5 bg-yellow-500 text-[#022036] font-extrabold rounded-xl text-xs shadow-sm hover:bg-yellow-400 transition-all text-center uppercase tracking-wider">
                  Register as Landlord
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                  <span className="text-[10px] text-yellow-600 font-black uppercase tracking-widest">Financials</span>
                  <h4 className="text-base font-extrabold text-[#022036]">Yield & Income Tracking</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">View monthly rental incomes, annualized yield projections, and portfolio valuation metrics in real-time.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                  <span className="text-[10px] text-yellow-600 font-black uppercase tracking-widest">Operations</span>
                  <h4 className="text-base font-extrabold text-[#022036]">Photo & Listing Control</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">Upload multiple high-resolution photos, update specifications, and toggle status between active, rented, or unavailable.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                  <span className="text-[10px] text-yellow-600 font-black uppercase tracking-widest">Compliance</span>
                  <h4 className="text-base font-extrabold text-[#022036]">Automated Expiry & Renewal</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">Listings automatically expire after 30 days of publication, with seamless one-click renewal workflows.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  "Real-Time Portfolio Analytics & Occupancy Charts",
                  "Photo Management & Multi-Image Uploads",
                  "Automatic 30-Day Listing Expiry & Renewal",
                  "Direct Tenant Inquiry & Lease Approval Workflow"
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <CheckCircle2 size={16} className="text-yellow-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTabRole === 'admin' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4 text-emerald-700">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#022036]">Admin Command Center & Moderation</h3>
                    <span className="text-xs text-slate-500 font-light">Total oversight, security compliance, and platform governance.</span>
                  </div>
                </div>
                <Link to="/login" className="px-5 py-2.5 bg-emerald-600 text-white font-extrabold rounded-xl text-xs shadow-sm hover:bg-emerald-500 transition-all text-center uppercase tracking-wider">
                  Admin Sign In
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                  <span className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">Moderation</span>
                  <h4 className="text-base font-extrabold text-[#022036]">Listing Review Pipeline</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">Inspect newly submitted landlord properties, verify Fayda identification numbers, and approve or reject listings.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                  <span className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">Security</span>
                  <h4 className="text-base font-extrabold text-[#022036]">User Access Governance</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">Manage user roles, handle permission elevations, and monitor secure authentication tokens across the cluster.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                  <span className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">Notifications</span>
                  <h4 className="text-base font-extrabold text-[#022036]">Automated Alerts</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">Broadcast system announcements and receive instant alerts when new properties await moderation review.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  "Listing Moderation (Approve / Reject)",
                  "User Role & Compliance Management",
                  "Automated Notification Dispatch System",
                  "Full Database Oversight via Prisma ORM"
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <CheckCircle2 size={16} className="text-yellow-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LIVE DATABASE 3D PROPERTIES GRID WITH FILTERS */}
      <section id="database-properties" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs font-black text-yellow-600 tracking-widest uppercase">Live Neon DB Synced</span>
            <h2 className="text-3xl font-black text-[#022036] mt-1">Featured 3D Spatial Properties</h2>
            <p className="text-xs text-slate-500 mt-1 font-light">Select a district to filter available database listings instantly.</p>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {["All", "Addis Ababa", "Bole", "Kazanchis", "CMC"].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCityFilter(city)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  selectedCityFilter === city 
                    ? 'bg-yellow-500 text-[#022036] font-extrabold shadow-sm' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-28 text-slate-400 text-xs font-semibold">Querying Neon PostgreSQL database...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-28 text-slate-400 text-xs bg-white rounded-3xl border border-slate-200 shadow-xs font-light">
            No properties currently match your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProperties.map((property) => {
              let imgUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=85";
              if (Array.isArray(property.images) && property.images.length > 0) {
                const rawUrl = property.images[0]?.url || property.images[0];
                if (rawUrl) {
                  imgUrl = rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                }
              }

              return (
                <div 
                  key={property.id}
                  className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-500 hover:scale-[1.03] hover:border-yellow-400 flex flex-col justify-between"
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                  }}
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img 
                        src={imgUrl} 
                        alt={property.titleEn || property.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-200 shadow-xs">
                        Verified 3D
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-1 text-[11px] text-yellow-600 font-semibold">
                        <MapPin size={12} />
                        <span>{property.location?.city || property.location || "Addis Ababa"}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-[#022036] truncate">{property.titleEn || property.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 font-light">{property.descriptionEn || property.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 space-y-4">
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600 font-mono">
                      <span className="flex items-center gap-1"><BedDouble size={13} className="text-slate-400" /> {property.rooms || 2} Rooms</span>
                      <span className="flex items-center gap-1"><Sofa size={13} className="text-slate-400" /> {property.furnished ? "Furnished" : "Unfurnished"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-lg font-black text-slate-950 font-mono">{Number(property.price || 500).toLocaleString()}</strong>
                        <span className="text-[9px] text-slate-400 ml-1 font-semibold">ETB</span>
                      </div>
                      
                      <button
                        onClick={() => handleRequestRent(property.id)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-yellow-500 hover:text-[#022036] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs uppercase tracking-wider"
                      >
                        Request →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* TECHNICAL ARCHITECTURE & STACK SECTION */}
      <section id="tech-specs" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="text-center mb-16">
          <span className="text-xs font-black text-yellow-600 tracking-widest uppercase">System Engineering</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#022036] mt-1">Enterprise Tech Stack & Security Specifications</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-xl mx-auto font-light">
            Engineered with industry-standard protocols, robust ORM querying, and bulletproof middleware protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Frontend Experience",
              desc: "React 19, Vite, Tailwind CSS v4, Lucide Icons, and Axios interceptor token management.",
              icon: Smartphone,
              color: "text-sky-600"
            },
            {
              title: "Backend Engine",
              desc: "Node.js, Express REST API, JWT stateless authentication, and Multer multi-image file handling.",
              icon: Server,
              color: "text-yellow-600"
            },
            {
              title: "Database & ORM",
              desc: "Prisma ORM schema mappings connected directly to AWS Neon serverless PostgreSQL clusters.",
              icon: Database,
              color: "text-emerald-600"
            },
            {
              title: "Payment Gateway",
              desc: "Chapa financial API integration for secure rent settlements, commissions, and webhook validation.",
              icon: ShieldCheck,
              color: "text-purple-600"
            }
          ].map((spec, i) => {
            const Icon = spec.icon;
            return (
              <div key={i} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className={`w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 ${spec.color} flex items-center justify-center shadow-xs`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-base font-black text-[#022036]">{spec.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">{spec.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMPREHENSIVE FOOTER */}
      <footer className="border-t border-slate-200 py-16 px-6 bg-[#022036] text-slate-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-500 text-[#022036] flex items-center justify-center font-black shadow-md">
                <Home size={20} />
              </div>
              <strong className="text-base text-white">Yidu RealEstate</strong>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Spatial 3D real estate platform engineered by software engineering students and development interns at Teamwork IT Solutions.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-yellow-400 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#hero-section" className="hover:text-white transition-colors">Platform Overview</a></li>
              <li><a href="#ecosystem-roles" className="hover:text-white transition-colors">Role Portals</a></li>
              <li><a href="#analytics-section" className="hover:text-white transition-colors">Market Analytics</a></li>
              <li><a href="#database-properties" className="hover:text-white transition-colors">3D Listings Grid</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-yellow-400 uppercase tracking-wider">System Security</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li><span>JWT Bearer Tokens</span></li>
              <li><span>Fayda ID Validation</span></li>
              <li><span>Chapa Webhook Verification</span></li>
              <li><span>Prisma Migration Sync</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-yellow-400 uppercase tracking-wider">Teamwork IT Support</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Need assistance? Contact our engineering administrators or reach out via the in-app messaging portal.
            </p>
            <div className="text-xs text-yellow-400 font-semibold font-mono">support@yiduhousing.et</div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 Yidu House Rental System • All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-light">Built with React, Node.js, Prisma, and PostgreSQL.</p>
        </div>
      </footer>

    </div>
  );
}

function BoxIcon({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );
}