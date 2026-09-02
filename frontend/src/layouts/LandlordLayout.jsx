import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationsDropdown from "../components/NotificationsDropdown";

import {
  Building2,
  Plus,
  LogOut,
  LayoutDashboard,
  FileText,
  History,
  Menu,
  X,
  User,
  Home,
  MessageSquare,
  Settings as SettingsIcon,
} from "lucide-react";

export default function LandlordLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = user?.fullName || "Valued Landlord";

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const menuItems = [
    { id: "overview", label: "Portfolio Analytics", icon: <LayoutDashboard size={19} />, path: "/landlord/dashboard" },
    { id: "properties", label: "My Properties", icon: <Home size={19} />, path: "/landlord/properties" },
    { id: "requests", label: "Tenant Inquiries", icon: <FileText size={19} />, path: "/landlord/requests" },
    { id: "history", label: "Lease History", icon: <History size={19} />, path: "/landlord/history" },
    { id: "messages", label: "In-App Messages", icon: <MessageSquare size={19} />, path: "/landlord/messages" },
    { id: "settings", label: "Profile Settings", icon: <SettingsIcon size={19} />, path: "/landlord/settings" },
  ];

  const navigateTo = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 flex font-sans selection:bg-yellow-500 selection:text-[#022036]">
      
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= CONSTANT SIDEBAR ================= */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-[#022036] border-r border-yellow-500/20 p-6 z-50 transition-transform duration-300 flex flex-col justify-between flex-shrink-0 text-white shadow-md ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="overflow-y-auto pr-1 scrollbar-thin">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('/landlord/dashboard')}>
              <div className="w-10 h-10 rounded-2xl bg-yellow-500 text-[#022036] flex items-center justify-center font-extrabold shadow-md">
                <Building2 size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <strong className="text-base tracking-tight leading-tight">Landlord Portal</strong>
                <span className="text-[10px] text-yellow-400 tracking-wider uppercase font-extrabold">Teamwork IT</span>
              </div>
            </div>
            <button className="lg:hidden p-2 text-white/80 rounded-xl bg-white/10 cursor-pointer" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* USER CARD */}
          <div className="flex items-center gap-3.5 p-4 bg-white/5 border border-white/10 rounded-2xl mb-6 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-lg border border-yellow-500/30">
              <User size={24} />
            </div>
            <div className="flex flex-col min-w-0">
              <strong className="text-sm font-bold text-white truncate">{userName}</strong>
              <span className="text-xs text-yellow-400 font-medium">Verified Property Owner</span>
            </div>
          </div>

          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-3">PROPERTY MANAGEMENT</div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive ? "bg-yellow-500 text-[#022036] shadow-md font-extrabold" : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">{item.icon}<span>{item.label}</span></div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </aside>

      {/* ================= CONTENT & NAVBAR CONTAINER ================= */}
      <div className="flex-1 flex flex-1 flex-col h-full overflow-y-auto bg-white">
        
        {/* STICKY NAVBAR */}
        <header className="sticky top-0 z-30 bg-[#022036] border-b border-yellow-500/20 px-4 sm:px-8 py-3.5 flex-shrink-0 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-white/80 bg-white/10 rounded-xl border border-white/10 cursor-pointer" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="text-base font-bold text-white capitalize">
              {location.pathname.includes('properties') ? 'Portfolio Management' : location.pathname.includes('requests') ? 'Tenant Rental Inquiries' : location.pathname.includes('history') ? 'Lease History' : location.pathname.includes('messages') ? 'In-App Messages' : location.pathname.includes('settings') ? 'Account Settings' : 'Real Estate Portfolio & Yield Performance'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <NotificationsDropdown />
            <Link 
              to="/landlord/properties/new" 
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus size={15} />
              <span>New Listing</span>
            </Link>
          </div>
        </header>

        {/* OUTLET RENDER AREA */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}