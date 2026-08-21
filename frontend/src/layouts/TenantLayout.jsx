import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Home,
  LayoutDashboard,
  Building2,
  Heart,
  FileText,
  CalendarDays,
  MessageSquare,
  Bell,
  User,
  Settings,
  Headphones,
  LogOut,
  Menu,
  X,
  Globe,
  ChevronDown,
} from "lucide-react";

import "./TenantLayout.css";

export default function TenantLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showLanguage, setShowLanguage] = useState(false);

  const userName = user?.fullName || "Tenant";
  const userEmail = user?.email || "";

  const translations = {
    en: {
      dashboard: "Dashboard",
      properties: "Search Properties",
      favorites: "Favorites",
      requests: "Requests",
      leases: "Leases",
      messages: "Messages",
      notifications: "Notifications",
      profile: "Profile Settings",
      help: "Help & Support",

      tenant: "Tenant",
      online: "Online",

      home: "Home",
      about: "About Us",
      contact: "Contact Us",

      logout: "Logout",
      menu: "MENU",

      promoTitle: "Find Your Perfect Home",
      promoText: "Easy • Safe • Reliable",
      explore: "Explore Properties",
    },

    am: {
      dashboard: "ዳሽቦርድ",
      properties: "ንብረቶችን ይፈልጉ",
      favorites: "የምወዳቸው",
      requests: "የኪራይ ጥያቄዎች",
      leases: "የኪራይ ውል",
      messages: "መልዕክቶች",
      notifications: "ማሳወቂያዎች",
      profile: "የመገለጫ ቅንብሮች",
      help: "እርዳታ እና ድጋፍ",

      tenant: "ተከራይ",
      online: "በመስመር ላይ",

      home: "መኖሪያ",
      about: "ስለ እኛ",
      contact: "አግኙን",

      logout: "ውጣ",
      menu: "ሜኑ",

      promoTitle: "ፍጹም መኖሪያዎን ያግኙ",
      promoText: "ቀላል • ደህና • አስተማማኝ",
      explore: "ንብረቶችን ይመልከቱ",
    },
  };

  const t = translations[language];

  const menuItems = [
    {
      path: "/dashboard",
      label: t.dashboard,
      icon: <LayoutDashboard size={19} />,
      end: true,
    },
    {
      path: "/properties",
      label: t.properties,
      icon: <Building2 size={19} />,
    },
    {
      path: "/favorites",
      label: t.favorites,
      icon: <Heart size={19} />,
    },
    {
      path: "/rental-requests",
      label: t.requests,
      icon: <FileText size={19} />,
    },
    {
      path: "/leases",
      label: t.leases,
      icon: <CalendarDays size={19} />,
    },
    {
      path: "/messages",
      label: t.messages,
      icon: <MessageSquare size={19} />,
    },
    {
      path: "/notifications",
      label: t.notifications,
      icon: <Bell size={19} />,
    },
    {
      path: "/profile",
      label: t.profile,
      icon: <Settings size={19} />,
    },
    {
      path: "/help",
      label: t.help,
      icon: <Headphones size={19} />,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login");
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setShowLanguage(false);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="tenant-layout">

      {/* =========================
          MOBILE OVERLAY
      ========================= */}
      {sidebarOpen && (
        <div
          className="tenant-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* =========================
          TOP NAVBAR
      ========================= */}
      <header className="tenant-navbar">

        {/* LEFT */}
        <div className="tenant-navbar-left">

          <button
            type="button"
            className="tenant-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <button
            type="button"
            className="tenant-logo"
            onClick={() => navigate("/dashboard")}
          >
            <div className="tenant-logo-icon">
              <Home size={22} />
            </div>

            <div className="tenant-logo-text">
              <strong>House Rental</strong>
              <span>System</span>
            </div>
          </button>

        </div>

        {/* =========================
            TOP NAVIGATION
        ========================= */}
        <nav className="tenant-top-nav">

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="tenant-top-link"
          >
            <Home size={16} />
            {t.home}
          </button>

          <button
            type="button"
            onClick={() => {
              const element = document.getElementById("about");

              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }}
            className="tenant-top-link"
          >
            {t.about}
          </button>

          <button
            type="button"
            onClick={() => {
              const element = document.getElementById("contact");

              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }}
            className="tenant-top-link"
          >
            {t.contact}
          </button>

        </nav>

        {/* =========================
            NAVBAR RIGHT
        ========================= */}
        <div className="tenant-navbar-right">

          {/* LANGUAGE */}
          <div className="tenant-language">

            <button
              type="button"
              className="tenant-language-button"
              onClick={() =>
                setShowLanguage((prev) => !prev)
              }
            >
              <Globe size={17} />

              <span>
                {language === "en"
                  ? "Translate"
                  : "ተርጉም"}
              </span>

              <ChevronDown size={14} />
            </button>

            {showLanguage && (
              <div className="tenant-language-dropdown">

                <button
                  type="button"
                  onClick={() =>
                    changeLanguage(
                      language === "en"
                        ? "am"
                        : "en"
                    )
                  }
                >
                  {language === "en"
                    ? "አማርኛ"
                    : "English"}
                </button>

              </div>
            )}

          </div>

          {/* NOTIFICATION */}
          <button
            type="button"
            className="tenant-nav-icon"
            onClick={() => navigate("/notifications")}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span>5</span>
          </button>

          {/* USER */}
          <button
            type="button"
            className="tenant-user-button"
            onClick={() => navigate("/profile")}
          >
            <div className="tenant-user-avatar">
              <User size={17} />
            </div>

            <span>{userName}</span>

            <ChevronDown size={14} />
          </button>

          {/* LOGOUT */}
          <button
            type="button"
            className="tenant-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>{t.logout}</span>
          </button>

        </div>
      </header>

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside
        className={`tenant-sidebar ${
          sidebarOpen
            ? "tenant-sidebar-open"
            : ""
        }`}
      >

        {/* SIDEBAR HEADER */}
        <div className="tenant-sidebar-header">

          <div className="tenant-sidebar-brand">

            <div className="tenant-sidebar-brand-icon">
              <Home size={21} />
            </div>

            <div>
              <strong>House Rental</strong>
              <span>System</span>
            </div>

          </div>

          <button
            type="button"
            className="tenant-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>

        </div>

        {/* USER CARD */}
        <div className="tenant-sidebar-user">

          <div className="tenant-sidebar-avatar">
            <User size={25} />
          </div>

          <div className="tenant-sidebar-user-info">

            <strong title={userName}>
              {userName}
            </strong>

            <span>{t.tenant}</span>

            <small>
              <i />
              {t.online}
            </small>

          </div>

        </div>

        {/* MENU LABEL */}
        <div className="tenant-menu-label">
          {t.menu}
        </div>

        {/* SIDEBAR NAVIGATION */}
        <nav className="tenant-sidebar-nav">

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `tenant-sidebar-item ${
                  isActive
                    ? "tenant-sidebar-item-active"
                    : ""
                }`
              }
            >

              <span className="tenant-sidebar-icon">
                {item.icon}
              </span>

              <span className="tenant-sidebar-text">
                {item.label}
              </span>

              {item.path === "/notifications" && (
                <span className="tenant-notification-count">
                  5
                </span>
              )}

            </NavLink>
          ))}

        </nav>

        {/* =========================
            SIDEBAR BOTTOM
        ========================= */}
        <div className="tenant-sidebar-bottom">

          <div className="tenant-sidebar-promo">

            <div className="tenant-promo-icon">
              <Home size={24} />
            </div>

            <strong>
              {t.promoTitle}
            </strong>

            <span>
              {t.promoText}
            </span>

            <button
              type="button"
              onClick={() => navigate("/properties")}
            >
              {t.explore}
              <span> →</span>
            </button>

          </div>

          <button
            type="button"
            className="tenant-sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            {t.logout}
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="tenant-main">
        <Outlet />
      </main>

    </div>
  );
}