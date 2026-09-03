import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationsDropdown from "../components/NotificationsDropdown";

import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Percent,
  LogOut,
  Menu,
  X,
  User,
  LayoutDashboard,
  Settings as SettingsIcon,
  Database,
  LockKeyhole,
  FileText,
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const userName = user?.fullName || "Administrator";

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = async () => {
    setProfileMenuOpen(false);
    setSidebarOpen(false);

    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  // =====================================================
  // UPDATE PROFILE - Shows Full Name, Phone, Documents
  // =====================================================
  const handleUpdateProfile = () => {
    setProfileMenuOpen(false);
    navigate("/admin/settings?tab=profile");
  };

  // =====================================================
  // SECURITY & PASSWORD - Shows Current, New, Confirm Password
  // =====================================================
  const handleSecurityPassword = () => {
    setProfileMenuOpen(false);
    navigate("/admin/settings?tab=security");
  };

  // =====================================================
  // ADMIN MENU ITEMS
  // =====================================================
  const menuItems = [
    {
      id: "overview",
      label: "Financial & Analytics",
      icon: <LayoutDashboard size={19} />,
      path: "/admin/dashboard",
    },
    {
      id: "pending",
      label: "Pending Listings",
      icon: <ShieldAlert size={19} />,
      path: "/admin/pending",
    },
    {
      id: "users",
      label: "Platform Users & Roles",
      icon: <Users size={19} />,
      path: "/admin/users",
    },
    {
      id: "commission",
      label: "Commission Rate",
      icon: <Percent size={19} />,
      path: "/admin/commission",
    },
    {
      id: "backup",
      label: "System Backup",
      icon: <Database size={19} />,
      path: "/admin/backup",
    },
    {
      id: "settings",
      label: "Profile Settings",
      icon: <SettingsIcon size={19} />,
      path: "/admin/settings",
    },
  ];

  // =====================================================
  // NAVIGATION
  // =====================================================
  const navigateTo = (path) => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
    navigate(path);
  };

  // =====================================================
  // PAGE TITLE
  // =====================================================
  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes("backup")) {
      return "System Backup & Data Management";
    }

    if (path.includes("pending")) {
      return "Pending Listings Moderation";
    }

    if (path.includes("users")) {
      return "User Compliance & Role Assignment";
    }

    if (path.includes("commission")) {
      return "Commission Rate Configuration";
    }

    if (path.includes("settings")) {
      return "Admin Account Settings";
    }

    return "Executive Financial Overview & Analytics";
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 flex font-sans selection:bg-[#FFC107] selection:text-[#022036]">

      {/* =====================================================
          MOBILE BACKDROP OVERLAY
      ====================================================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          ADMIN SIDEBAR
      ====================================================== */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-[#022036] border-r border-[#FFC107]/20 p-6 z-50 transition-transform duration-300 flex flex-col justify-between flex-shrink-0 text-white shadow-md ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="overflow-y-auto pr-1 scrollbar-thin">

          {/* =================================================
              LOGO
          ================================================= */}
          <div className="flex items-center justify-between mb-8">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigateTo("/admin/dashboard")}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-[#022036] flex items-center justify-center font-extrabold shadow-md">
                <ShieldCheck
                  size={22}
                  strokeWidth={2.5}
                />
              </div>

              <div className="flex flex-col">
                <strong className="text-base tracking-tight leading-tight">
                  Admin Suite
                </strong>

                <span className="text-[10px] text-[#FFC107] tracking-wider uppercase font-extrabold">
                  Teamwork IT
                </span>
              </div>
            </div>

            {/* MOBILE CLOSE BUTTON */}
            <button
              type="button"
              className="lg:hidden p-2 text-white/80 rounded-xl bg-white/10 cursor-pointer hover:bg-white/20 transition"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* =================================================
              ADMIN USER CARD
          ================================================= */}
          <div className="flex items-center gap-3.5 p-4 bg-white/5 border border-white/10 rounded-2xl mb-6 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-[#FFC107]/20 text-[#FFC107] flex items-center justify-center font-bold text-lg border border-[#FFC107]/30">
              <User size={24} />
            </div>

            <div className="flex flex-col min-w-0">
              <strong className="text-sm font-bold text-white truncate">
                {userName}
              </strong>

              <span className="text-xs text-[#FFC107] font-medium">
                System Administrator
              </span>
            </div>
          </div>

          {/* =================================================
              SECTION TITLE
          ================================================= */}
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-3">
            ADMINISTRATION
          </div>

          {/* =================================================
              NAVIGATION
          ================================================= */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FFC107] text-[#022036] shadow-md font-extrabold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        isActive
                          ? "text-[#022036]"
                          : "text-[#FFC107]"
                      }
                    >
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">

        {/* =================================================
            TOP NAVBAR
        ================================================= */}
        <header className="sticky top-0 z-30 bg-[#022036] border-b border-[#FFC107]/20 px-4 sm:px-8 py-3.5 flex-shrink-0 flex items-center justify-between text-white shadow-xs">

          {/* =================================================
              LEFT SIDE
          ================================================= */}
          <div className="flex items-center gap-3">

            {/* MOBILE SIDEBAR BUTTON */}
            <button
              type="button"
              className="lg:hidden p-2 text-white/80 bg-white/10 rounded-xl border border-white/10 cursor-pointer hover:bg-white/20 transition"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <h2 className="text-base font-bold text-white capitalize">
              {getPageTitle()}
            </h2>
          </div>

          {/* =================================================
              TOP RIGHT
          ================================================= */}
          <div className="flex items-center gap-3">

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}
            <NotificationsDropdown />

            {/* =================================================
                SECURE ADMIN SESSION
            ================================================= */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Secure Admin Session
            </span>

            {/* =================================================
                PROFILE DROPDOWN (User Icon)
            ================================================= */}
            <div className="relative">

              {/* PROFILE BUTTON */}
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen((prev) => !prev)
                }
                aria-label="Open profile menu"
                aria-expanded={profileMenuOpen}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer ${
                  profileMenuOpen
                    ? "bg-[#FFC107] text-[#022036] border-[#FFC107]"
                    : "bg-white/10 text-white border-white/10 hover:bg-[#FFC107] hover:text-[#022036]"
                }`}
              >
                <User size={20} />
              </button>

              {/* =================================================
                  PROFILE DROPDOWN MENU
              ================================================= */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[100]">

                  {/* =================================================
                      PROFILE HEADER
                  ================================================= */}
                  <div className="px-4 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-xl bg-[#FFC107]/15 text-[#022036] flex items-center justify-center border border-[#FFC107]/30">
                        <User size={21} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {userName}
                        </p>

                        <p className="text-[10px] text-slate-500 truncate">
                          {user?.email || "Administrator"}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* =================================================
                      UPDATE PROFILE - Full Name, Phone, Documents
                  ================================================= */}
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="w-9 h-9 rounded-xl bg-[#FFC107]/10 border border-[#FFC107]/20 text-[#022036] flex items-center justify-center">
                      <FileText size={17} />
                    </span>

                    <span>
                      Update Profile
                      <span className="block text-[9px] text-slate-400 font-normal">
                        Full name, phone &amp; documents
                      </span>
                    </span>
                  </button>

                  {/* =================================================
                      SECURITY & PASSWORD - Current, New, Confirm
                  ================================================= */}
                  <button
                    type="button"
                    onClick={handleSecurityPassword}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-t border-slate-100"
                  >
                    <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                      <LockKeyhole size={17} />
                    </span>

                    <span>
                      Security &amp; Password
                      <span className="block text-[9px] text-slate-400 font-normal">
                        Current, new &amp; confirm password
                      </span>
                    </span>
                  </button>

                  {/* =================================================
                      LOGOUT
                  ================================================= */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-t border-slate-200"
                  >
                    <span className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-500 flex items-center justify-center">
                      <LogOut size={17} />
                    </span>

                    <span>
                      Logout
                    </span>
                  </button>

                </div>
              )}

            </div>
          </div>
        </header>

        {/* =====================================================
            ROUTED CONTENT
        ====================================================== */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}