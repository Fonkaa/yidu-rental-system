import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  Home,
  Building2,
  Heart,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  User,
  Bell,
  Search,
  Menu,
  X,
  Globe,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  LayoutDashboard,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Headphones,
  BadgeCheck,
  TrendingUp,
  BedDouble,
  Bath,
  Maximize,
} from "lucide-react";

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userName = user?.fullName || "Abyu Eshetie";
  const userEmail = user?.email || "abyu@gmail.com";
  const userPhone = user?.phone || "+251 9xx xxx xxx";

  /* =====================================================
     TRANSLATIONS
  ===================================================== */

  const translations = {
    en: {
      home: "Home",
      about: "About Us",
      contact: "Contact Us",
      logout: "Logout",

      dashboard: "Dashboard",
      searchProperties: "Search Properties",
      myFavorites: "My Favorites",
      myRequests: "My Requests",
      myLeases: "My Leases",
      messages: "Messages",
      notifications: "Notifications",
      profileSettings: "Profile Settings",
      helpSupport: "Help & Support",

      tenant: "Tenant",
      online: "Online",
      verified: "Verified",

      welcome: "Welcome back",
      findRent: "Find, rent, and manage your perfect home with ease.",

      searchPlaceholder: "Search location, city, or property...",
      allTypes: "All Types",
      allPrices: "All Prices",
      search: "Search",

      availableProperties: "Available Properties",
      savedProperties: "Saved Properties",
      requests: "My Requests",
      activeLeases: "Active Leases",

      featuredProperties: "Featured Properties",
      viewAll: "View All",
      forRent: "For Rent",
      viewDetails: "View Details",

      beds: "Beds",
      bath: "Bath",
      month: "/ month",

      quickActions: "Quick Actions",

      recentNotifications: "Recent Notifications",
      showAllNotifications: "Show All Notifications",

      requestApproved: "Your request was approved",
      newMatches: "New property matches found",
      leaseExpire: "Lease will expire in 30 days",

      time1: "2 days ago",
      time2: "1 day ago",
      time3: "5 days ago",

      safeSecure: "Safe & Secure",
      safetyPriority: "Your safety is our priority",

      verifiedProperties: "Verified Properties",
      listingsVerified: "All listings are verified",

      bestPrice: "Best Price",
      affordable: "Affordable for you",

      support: "24/7 Support",
      hereForYou: "We are here for you",

      privacy: "Privacy Policy",
      terms: "Terms & Conditions",

      allRights: "All rights reserved",
      exploreNow: "Explore Now",
      perfectHome: "Find Your Perfect Home",
      easySafeReliable: "Easy • Safe • Reliable",

      discoverHomes: "Discover homes that match your needs",

      searchPropertiesShort: "Search Properties",
      favoritesShort: "My Favorites",
      requestsShort: "My Requests",
      messagesShort: "Messages",
      leasesShort: "My Leases",
      profileShort: "Profile",

      increase: "from last month",
    },

    am: {
      home: "መኖሪያ",
      about: "ስለ እኛ",
      contact: "አግኙን",
      logout: "ውጣ",

      dashboard: "ዳሽቦርድ",
      searchProperties: "ንብረቶችን ይፈልጉ",
      myFavorites: "የኔ ተወዳጆች",
      myRequests: "የኔ ጥያቄዎች",
      myLeases: "የኔ ኪራዮች",
      messages: "መልዕክቶች",
      notifications: "ማሳወቂያዎች",
      profileSettings: "የመገለጫ ቅንብሮች",
      helpSupport: "እርዳታ እና ድጋፍ",

      tenant: "ተከራይ",
      online: "በመስመር ላይ",
      verified: "የተረጋገጠ",

      welcome: "እንኳን ደህና መጡ",
      findRent: "ቤትዎን ያግኙ፣ ይከራዩ እና በቀላሉ ያስተዳድሩ።",

      searchPlaceholder: "አካባቢ፣ ከተማ ወይም ንብረት ይፈልጉ...",
      allTypes: "ሁሉም ዓይነቶች",
      allPrices: "ሁሉም ዋጋዎች",
      search: "ፈልግ",

      availableProperties: "የሚገኙ ንብረቶች",
      savedProperties: "የተቀመጡ ንብረቶች",
      requests: "የኔ ጥያቄዎች",
      activeLeases: "ንቁ ኪራዮች",

      featuredProperties: "ተመራጭ ንብረቶች",
      viewAll: "ሁሉንም ይመልከቱ",
      forRent: "ለኪራይ",
      viewDetails: "ዝርዝር ይመልከቱ",

      beds: "መኝታ",
      bath: "መታጠቢያ",
      month: "/ ወር",

      quickActions: "ፈጣን ድርጊቶች",

      recentNotifications: "የቅርብ ጊዜ ማሳወቂያዎች",
      showAllNotifications: "ሁሉንም ማሳወቂያዎች",

      requestApproved: "ጥያቄዎ ጸድቋል",
      newMatches: "አዳዲስ ተስማሚ ንብረቶች ተገኝተዋል",
      leaseExpire: "ኪራይዎ በ30 ቀናት ውስጥ ያበቃል",

      time1: "2 ቀናት በፊት",
      time2: "1 ቀን በፊት",
      time3: "5 ቀናት በፊት",

      safeSecure: "ደህንነት",
      safetyPriority: "ደህንነትዎ ቅድሚያችን ነው",

      verifiedProperties: "የተረጋገጡ ንብረቶች",
      listingsVerified: "ሁሉም ንብረቶች ተረጋግጠዋል",

      bestPrice: "ምርጥ ዋጋ",
      affordable: "ለእርስዎ ተመጣጣኝ",

      support: "24/7 ድጋፍ",
      hereForYou: "ሁሌም ለእርስዎ እዚህ ነን",

      privacy: "የግላዊነት ፖሊሲ",
      terms: "ውሎች እና ሁኔታዎች",

      allRights: "መብቱ በህግ የተጠበቀ ነው",
      exploreNow: "አሁን ይመልከቱ",
      perfectHome: "ፍጹም ቤትዎን ያግኙ",
      easySafeReliable: "ቀላል • ደህንነቱ የተጠበቀ • አስተማማኝ",

      discoverHomes: "የሚፈልጉትን ቤት ያግኙ",

      searchPropertiesShort: "ንብረት ፈልግ",
      favoritesShort: "ተወዳጆች",
      requestsShort: "ጥያቄዎች",
      messagesShort: "መልዕክቶች",
      leasesShort: "ኪራዮች",
      profileShort: "መገለጫ",

      increase: "ካለፈው ወር",
    },
  };

  const t = language === "am" ? translations.am : translations.en;

  /* =====================================================
     PROPERTY DATA
  ===================================================== */

  const properties = [
    {
      id: 1,
      title: "Modern Apartment",
      location: "Bole, Addis Ababa",
      price: "850",
      bedrooms: 2,
      bathrooms: 1,
      area: "120",
      image:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=85",
    },
    {
      id: 2,
      title: "Luxury Villa",
      location: "CMC, Addis Ababa",
      price: "1,200",
      bedrooms: 3,
      bathrooms: 2,
      area: "200",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
    },
    {
      id: 3,
      title: "Family House",
      location: "Ayat, Addis Ababa",
      price: "650",
      bedrooms: 2,
      bathrooms: 1,
      area: "100",
      image:
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
    },
  ];

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const notifications = [
    {
      type: "success",
      icon: <CheckCircle size={18} />,
      title: t.requestApproved,
      time: t.time1,
    },
    {
      type: "info",
      icon: <Bell size={18} />,
      title: t.newMatches,
      time: t.time2,
    },
    {
      type: "warning",
      icon: <AlertCircle size={18} />,
      title: t.leaseExpire,
      time: t.time3,
    },
  ];

  /* =====================================================
     SIDEBAR MENU
  ===================================================== */

  const menuItems = [
    {
      id: "dashboard",
      label: t.dashboard,
      icon: <LayoutDashboard size={19} />,
      path: "/dashboard",
    },
    {
      id: "properties",
      label: t.searchProperties,
      icon: <Building2 size={19} />,
      path: "/properties",
    },
    {
      id: "favorites",
      label: t.myFavorites,
      icon: <Heart size={19} />,
      path: "/favorites",
    },
    {
      id: "requests",
      label: t.myRequests,
      icon: <FileText size={19} />,
      path: "/rental-requests",
    },
    {
      id: "leases",
      label: t.myLeases,
      icon: <CalendarDays size={19} />,
      path: "/leases",
    },
    {
      id: "messages",
      label: t.messages,
      icon: <MessageSquare size={19} />,
      path: "/messages",
    },
    {
      id: "notifications",
      label: t.notifications,
      icon: <Bell size={19} />,
      path: "/notifications",
    },
    {
      id: "profile",
      label: t.profileSettings,
      icon: <Settings size={19} />,
      path: "/profile",
    },
    {
      id: "help",
      label: t.helpSupport,
      icon: <Headphones size={19} />,
      path: "/help",
    },
  ];

  /* =====================================================
     HANDLERS
  ===================================================== */

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  const navigateTo = (path) => {
    setSidebarOpen(false);
    setShowNotifications(false);
    setShowLanguageDropdown(false);
    navigate(path);
  };

  const changeLanguage = (value) => {
    setLanguage(value);
    setShowLanguageDropdown(false);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =====================================================
     COMPONENT
  ===================================================== */

  return (
    <div className="dashboard-page">
      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <div
          className="dashboard-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="dashboard-top-navbar">
        <div className="navbar-container">
          {/* LEFT */}
          <div className="navbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="navbar-brand">
              <div className="brand-icon">
                <Home size={24} strokeWidth={2.4} />
              </div>

              <div className="brand-text">
                <strong>House Rental</strong>
                <span>System</span>
              </div>
            </div>
          </div>

          {/* CENTER NAVIGATION */}
          <nav className="navbar-center">
            <button
              className="top-nav-link active"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              <Home size={16} />
              {t.home}
            </button>

            <button
              className="top-nav-link"
              onClick={() => scrollToSection("about")}
            >
              {t.about}
            </button>

            <button
              className="top-nav-link"
              onClick={() => scrollToSection("contact")}
            >
              {t.contact}
            </button>
          </nav>

          {/* RIGHT */}
          <div className="navbar-right">
            {/* LANGUAGE */}
            <div className="language-wrapper">
              <button
                className="language-button"
                onClick={() =>
                  setShowLanguageDropdown((prev) => !prev)
                }
              >
                <Globe size={17} />

                <span>
                  {language === "en" ? "Translate" : "ተርጉም"}
                </span>

                <ChevronDown size={14} />
              </button>

              {showLanguageDropdown && (
                <div className="language-dropdown">
                  <button
                    onClick={() => changeLanguage("am")}
                    className={language === "am" ? "selected" : ""}
                  >
                    🇪🇹 አማርኛ
                  </button>

                  <button
                    onClick={() => changeLanguage("en")}
                    className={language === "en" ? "selected" : ""}
                  >
                    🇬🇧 English
                  </button>
                </div>
              )}
            </div>

            {/* NOTIFICATIONS */}
            <div className="notification-wrapper">
              <button
                className="icon-nav-button"
                onClick={() =>
                  setShowNotifications((prev) => !prev)
                }
                aria-label="Notifications"
              >
                <Bell size={20} />

                <span className="notification-badge">5</span>
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-title">
                    <strong>{t.notifications}</strong>
                    <span>5</span>
                  </div>

                  {notifications.map((item, index) => (
                    <div
                      className="dropdown-notification"
                      key={index}
                    >
                      <div
                        className={`dropdown-icon ${item.type}`}
                      >
                        {item.icon}
                      </div>

                      <div className="dropdown-notification-content">
                        <strong>{item.title}</strong>
                        <small>{item.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* USER */}
            <button
              className="navbar-user"
              onClick={() => navigateTo("/profile")}
            >
              <div className="navbar-avatar">
                <User size={18} />
              </div>

              <span>{userName}</span>

              <ChevronDown size={14} />
            </button>

            {/* LOGOUT */}
            <button
              className="navbar-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-top">
          {/* MOBILE SIDEBAR HEADER */}
          <div className="sidebar-mobile-header">
            <div className="sidebar-brand">
              <div className="sidebar-brand-icon">
                <Home size={22} />
              </div>

              <div>
                <strong>House Rental</strong>
                <span>System</span>
              </div>
            </div>

            <button
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X size={21} />
            </button>
          </div>

          {/* USER CARD */}
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">
              <User size={26} />
            </div>

            <div className="sidebar-user-info">
              <strong>{userName}</strong>
              <span>{t.tenant}</span>

              <div className="online-status">
                <i></i>
                {t.online}
              </div>
            </div>
          </div>

          {/* LABEL */}
          <div className="sidebar-label">MENU</div>

          {/* NAVIGATION */}
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${
                  item.id === "dashboard" ? "active" : ""
                }`}
                onClick={() => navigateTo(item.path)}
              >
                <span className="sidebar-item-icon">
                  {item.icon}
                </span>

                <span className="sidebar-item-text">
                  {item.label}
                </span>

                {item.id === "notifications" && (
                  <span className="sidebar-notification-count">
                    5
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* PROMO */}
        <div className="sidebar-promo">
          <div className="promo-overlay"></div>

          <div className="promo-content">
            <span>{t.easySafeReliable}</span>

            <h3>{t.perfectHome}</h3>

            <button
              onClick={() => navigateTo("/properties")}
            >
              {t.exploreNow}
              <span>→</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero-section">
          <div className="hero-background"></div>

          <div className="hero-content">
            <div className="hero-text">
              <h1>
                {t.welcome}, {userName}!
              </h1>

              <p>{t.findRent}</p>
            </div>

            {/* SEARCH */}
            <div className="hero-search">
              <div className="search-input-wrapper">
                <Search size={19} />

                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                />
              </div>

              <select defaultValue="">
                <option value="" disabled>
                  {t.allTypes}
                </option>

                <option value="Apartment">
                  Apartment
                </option>

                <option value="Villa">
                  Villa
                </option>

                <option value="House">
                  House
                </option>
              </select>

              <select defaultValue="">
                <option value="" disabled>
                  {t.allPrices}
                </option>

                <option value="0-500">
                  $0 - $500
                </option>

                <option value="500-1000">
                  $500 - $1,000
                </option>

                <option value="1000+">
                  $1,000+
                </option>
              </select>

              <button
                className="hero-search-button"
                onClick={() => navigateTo("/properties")}
              >
                <Search size={17} />
                {t.search}
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            DASHBOARD CONTENT
        ================================================= */}

        <div className="dashboard-layout">
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="dashboard-content-left">
            {/* STATISTICS */}
            <section className="statistics-grid">
              <div className="stat-card blue">
                <div className="stat-icon">
                  <Building2 size={22} />
                </div>

                <div className="stat-content">
                  <strong>12</strong>

                  <span>
                    {t.availableProperties}
                  </span>

                  <small>
                    <TrendingUp size={13} />
                    15% {t.increase}
                  </small>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-icon">
                  <Heart size={22} />
                </div>

                <div className="stat-content">
                  <strong>8</strong>

                  <span>
                    {t.savedProperties}
                  </span>

                  <small>
                    <TrendingUp size={13} />
                    10% {t.increase}
                  </small>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="stat-icon">
                  <CalendarDays size={22} />
                </div>

                <div className="stat-content">
                  <strong>3</strong>

                  <span>{t.requests}</span>

                  <small>
                    <TrendingUp size={13} />
                    8% {t.increase}
                  </small>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="stat-icon">
                  <FileText size={22} />
                </div>

                <div className="stat-content">
                  <strong>2</strong>

                  <span>{t.activeLeases}</span>

                  <small>
                    <TrendingUp size={13} />
                    5% {t.increase}
                  </small>
                </div>
              </div>
            </section>

            {/* FEATURED PROPERTIES */}
            <section className="section-card">
              <div className="section-heading">
                <div>
                  <h2>{t.featuredProperties}</h2>

                  <p>{t.discoverHomes}</p>
                </div>

                <button
                  className="view-all-button"
                  onClick={() =>
                    navigateTo("/properties")
                  }
                >
                  {t.viewAll}
                  <span>→</span>
                </button>
              </div>

              <div className="property-grid">
                {properties.map((property) => (
                  <article
                    className="property-card"
                    key={property.id}
                  >
                    {/* IMAGE */}
                    <div className="property-image">
                      <img
                        src={property.image}
                        alt={property.title}
                        loading="lazy"
                      />

                      <span className="rent-badge">
                        {t.forRent}
                      </span>

                      <button
                        className="property-favorite"
                        aria-label="Favorite property"
                        onClick={() => navigateTo("/favorites")}
                      >
                        <Heart size={18} />
                      </button>
                    </div>

                    {/* BODY */}
                    <div className="property-body">
                      <h3>{property.title}</h3>

                      <div className="property-location">
                        <MapPin size={14} />

                        <span>
                          {property.location}
                        </span>
                      </div>

                      <div className="property-price">
                        <strong>
                          ${property.price}
                        </strong>

                        <span>{t.month}</span>
                      </div>

                      <div className="property-meta">
                        <span>
                          <BedDouble size={14} />
                          {property.bedrooms} {t.beds}
                        </span>

                        <span>
                          <Bath size={14} />
                          {property.bathrooms} {t.bath}
                        </span>

                        <span>
                          <Maximize size={14} />
                          {property.area} m²
                        </span>
                      </div>

                      <button
                        className="view-details-button"
                        onClick={() =>
                          navigateTo(
                            `/properties/${property.id}`
                          )
                        }
                      >
                        {t.viewDetails}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* BENEFITS */}
            <section className="benefits-section">
              <div className="benefit-item">
                <div className="benefit-icon green">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <strong>{t.safeSecure}</strong>
                  <span>{t.safetyPriority}</span>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon purple">
                  <BadgeCheck size={21} />
                </div>

                <div>
                  <strong>
                    {t.verifiedProperties}
                  </strong>

                  <span>
                    {t.listingsVerified}
                  </span>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon orange">
                  <Building2 size={21} />
                </div>

                <div>
                  <strong>{t.bestPrice}</strong>
                  <span>{t.affordable}</span>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon pink">
                  <Headphones size={21} />
                </div>

                <div>
                  <strong>{t.support}</strong>
                  <span>{t.hereForYou}</span>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside className="dashboard-right">
            {/* PROFILE */}
            <section className="right-card profile-card">
              <div className="profile-top">
                <div className="large-avatar">
                  <User size={30} />
                </div>

                <div>
                  <h3>{userName}</h3>
                  <span>{t.tenant}</span>
                </div>
              </div>

              <div className="profile-info">
                <div>
                  <span>✉</span>
                  <p>{userEmail}</p>
                </div>

                <div>
                  <span>☎</span>
                  <p>{userPhone}</p>
                </div>
              </div>

              <div className="verified-label">
                <BadgeCheck size={14} />
                {t.verified}
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="right-card">
              <div className="right-card-heading">
                <h2>{t.quickActions}</h2>
              </div>

              <div className="quick-actions-grid">
                <button
                  onClick={() =>
                    navigateTo("/properties")
                  }
                >
                  <div className="quick-icon blue">
                    <Search size={21} />
                  </div>

                  <span>
                    {t.searchPropertiesShort}
                  </span>
                </button>

                <button
                  onClick={() =>
                    navigateTo("/favorites")
                  }
                >
                  <div className="quick-icon red">
                    <Heart size={21} />
                  </div>

                  <span>
                    {t.favoritesShort}
                  </span>
                </button>

                <button
                  onClick={() =>
                    navigateTo("/rental-requests")
                  }
                >
                  <div className="quick-icon orange">
                    <CalendarDays size={21} />
                  </div>

                  <span>
                    {t.requestsShort}
                  </span>
                </button>

                <button
                  onClick={() =>
                    navigateTo("/messages")
                  }
                >
                  <div className="quick-icon purple">
                    <MessageSquare size={21} />
                  </div>

                  <span>
                    {t.messagesShort}
                  </span>
                </button>

                <button
                  onClick={() =>
                    navigateTo("/leases")
                  }
                >
                  <div className="quick-icon blue">
                    <FileText size={21} />
                  </div>

                  <span>
                    {t.leasesShort}
                  </span>
                </button>

                <button
                  onClick={() =>
                    navigateTo("/profile")
                  }
                >
                  <div className="quick-icon green">
                    <User size={21} />
                  </div>

                  <span>
                    {t.profileShort}
                  </span>
                </button>
              </div>
            </section>

            {/* NOTIFICATIONS */}
            <section className="right-card notifications-card">
              <div className="right-card-heading">
                <h2>{t.recentNotifications}</h2>

                <button
                  onClick={() =>
                    navigateTo("/notifications")
                  }
                >
                  {t.viewAll}
                </button>
              </div>

              <div className="notification-list">
                {notifications.map((item, index) => (
                  <div
                    className="notification-row"
                    key={index}
                  >
                    <div
                      className={`notification-row-icon ${item.type}`}
                    >
                      {item.icon}
                    </div>

                    <div className="notification-row-content">
                      <strong>{item.title}</strong>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="show-notifications-button"
                onClick={() =>
                  navigateTo("/notifications")
                }
              >
                {t.showAllNotifications}
              </button>
            </section>
          </aside>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="dashboard-footer">
          <div className="footer-copy">
            © 2026 House Rental System. {t.allRights}.
          </div>

          <div className="footer-links">
            <a href="#privacy">{t.privacy}</a>

            <span>|</span>

            <a href="#terms">{t.terms}</a>

            <span>|</span>

            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
            >
              {t.contact}
            </a>
          </div>
        </footer>

        {/* TARGETS */}
        <div id="about" className="page-anchor"></div>
        <div id="contact" className="page-anchor"></div>
      </main>
    </div>
  );
}