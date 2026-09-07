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
  ShieldCheck,
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
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 flex font-sans selection:bg-[#FFC107] selection:text-[#022036]">
      
      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-[#022036] border-r border-[#FFC107]/20 p-6 z-50 transition-transform duration-300 flex flex-col justify-between flex-shrink-0 text-white shadow-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#FFC107]/30 scrollbar-track-transparent">
          
          {/* LOGO */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('/landlord/dashboard')}>
              <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-[#022036] flex items-center justify-center font-extrabold shadow-lg shadow-[#FFC107]/20">
                <Building2 size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <strong className="text-base tracking-tight leading-tight">Landlord Portal</strong>
                <span className="text-[10px] text-[#FFC107] tracking-wider uppercase font-extrabold">Teamwork IT</span>
              </div>
            </div>
            <button className="lg:hidden p-2 text-white/80 rounded-xl bg-white/10 hover:bg-white/20 transition" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* USER CARD */}
          <div className="flex items-center gap-3.5 p-4 bg-white/5 border border-[#FFC107]/20 rounded-2xl mb-6 shadow-inner hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#FFC107]/20 text-[#FFC107] flex items-center justify-center font-bold text-lg border border-[#FFC107]/30 shadow-sm">
              <User size={24} />
            </div>
            <div className="flex flex-col min-w-0">
              <strong className="text-sm font-bold text-white truncate">{userName}</strong>
              <span className="text-xs text-[#FFC107] font-medium">Verified Property Owner</span>
            </div>
          </div>

          {/* SECTION TITLE */}
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107]"></span>
            Property Management
          </div>

          {/* NAVIGATION */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-[#FFC107] text-[#022036] shadow-lg shadow-[#FFC107]/20 font-extrabold" 
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-[#022036]" : "text-[#FFC107]"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#022036]"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="pt-4 border-t border-[#FFC107]/10">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-rose-500/10"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-slate-500">
            <ShieldCheck size={12} className="text-[#FFC107]" />
            <span>Secure Session • v2.0</span>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
        
        {/* STICKY NAVBAR */}
        <header className="sticky top-0 z-30 bg-[#022036] border-b border-[#FFC107]/20 px-4 sm:px-8 py-3.5 flex-shrink-0 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-white/80 bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 transition" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="text-base font-bold text-white capitalize tracking-wide">
              {location.pathname.includes('properties') ? 'Portfolio Management' : 
               location.pathname.includes('requests') ? 'Tenant Rental Inquiries' : 
               location.pathname.includes('history') ? 'Lease History' : 
               location.pathname.includes('messages') ? 'In-App Messages' : 
               location.pathname.includes('settings') ? 'Account Settings' : 
               'Real Estate Portfolio & Yield Performance'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <NotificationsDropdown />
            <Link 
              to="/landlord/properties/new" 
              className="px-4 py-2 bg-[#FFC107] hover:bg-yellow-400 text-[#022036] font-extrabold rounded-xl text-xs shadow-lg shadow-[#FFC107]/20 flex items-center gap-1.5 transition-all hover:scale-105 border border-[#FFC107]/30"
            >
              <Plus size={15} strokeWidth={3} />
              <span>New Listing</span>
            </Link>
          </div>
        </header>

        {/* OUTLET */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}