import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
  Heart,
  MessageSquare,
  FileText,
  Settings,
  X,
  User,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function TenantSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userName = user?.fullName || "Valued Tenant";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home size={19} />,
      path: "/dashboard",
    },
    {
      id: "properties",
      label: "Search Properties",
      icon: <Building2 size={19} />,
      path: "/properties",
    },
    {
      id: "favorites",
      label: "My Favorites",
      icon: <Heart size={19} />,
      path: "/favorites",
    },
    {
      id: "requests",
      label: "My Requests",
      icon: <FileText size={19} />,
      path: "/rental-requests",
    },
    {
      id: "leases",
      label: "My Leases",
      icon: <CalendarDays size={19} />,
      path: "/leases",
    },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare size={19} />,
      path: "/messages",
    },
    {
      id: "profile",
      label: "Profile Settings",
      icon: <Settings size={19} />,
      path: "/settings",
    },
  ];

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0
          h-full
          w-72
          bg-[#022036]
          border-r border-yellow-500/20
          p-6
          z-50
          flex flex-col
          justify-between
          flex-shrink-0
          text-white
          shadow-md
          transition-transform duration-300

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="overflow-y-auto pr-1 scrollbar-thin">

          {/* MOBILE HEADER */}
          <div className="flex lg:hidden items-center justify-between pb-6 mb-6 border-b border-white/10">

            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleNavigation("/dashboard")}
            >
              <div className="w-9 h-9 rounded-xl bg-yellow-500 text-[#022036] flex items-center justify-center">
                <Home size={20} />
              </div>

              <div>
                <strong className="text-sm">
                  House Rental
                </strong>

                <span className="block text-[10px] text-yellow-400">
                  System
                </span>
              </div>
            </div>

            <button
              className="p-2 bg-white/5 text-white/80 rounded-xl"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* DESKTOP LOGO */}
          <div
            className="hidden lg:flex items-center gap-3 mb-8 cursor-pointer px-2"
            onClick={() => handleNavigation("/dashboard")}
          >
            <div className="w-10 h-10 rounded-2xl bg-yellow-500 text-[#022036] flex items-center justify-center font-extrabold">
              <Home size={22} />
            </div>

            <div className="flex flex-col">
              <strong className="text-base">
                House Rental
              </strong>

              <span className="text-[10px] text-yellow-400 tracking-wider uppercase font-extrabold">
                System
              </span>
            </div>
          </div>

          {/* USER CARD */}
          <div className="flex items-center gap-3.5 p-4 bg-white/5 border border-white/10 rounded-2xl mb-6">

            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
              <User size={24} />
            </div>

            <div className="flex flex-col min-w-0">
              <strong className="text-sm font-bold text-white truncate">
                {userName}
              </strong>

              <span className="text-xs text-yellow-400 font-medium">
                Tenant
              </span>

              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </div>
            </div>
          </div>

          {/* MENU TITLE */}
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-3">
            MENU
          </div>

          {/* NAVIGATION */}
          <nav className="space-y-1.5">

            {menuItems.map((item) => {

              const isActive =
                location.pathname === item.path ||
                (
                  item.path !== "/dashboard" &&
                  location.pathname.startsWith(item.path)
                );

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full
                    flex
                    items-center
                    px-4
                    py-3
                    rounded-2xl
                    text-xs
                    font-bold
                    transition-all
                    cursor-pointer

                    ${
                      isActive
                        ? "bg-yellow-500 text-[#022036] shadow-md"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}

          </nav>
        </div>

        {/* BOTTOM PROMO */}
        <div className="mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 p-4 text-center">

          <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-400">
            Easy • Safe • Reliable
          </span>

          <h4 className="text-sm font-bold text-white mt-1 mb-3">
            Find Your Perfect Home
          </h4>

          <button
            onClick={() => handleNavigation("/properties")}
            className="w-full py-2 bg-yellow-500 text-[#022036] text-xs font-extrabold rounded-xl hover:bg-yellow-400 transition-all"
          >
            Explore Now →
          </button>
        </div>

      </aside>
    </>
  );
}