import { useState, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationsDropdown from "../../components/NotificationsDropdown";

import {
  Home,
  Building2,
  Heart,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Globe,
  ChevronDown,
  Headphones,
  LayoutDashboard,
  CalendarDays,
  Bot,
  Send,
} from "lucide-react";

/* =====================================================
    TENANT AI ASSISTANT COMPONENT
===================================================== */
function TenantAIAssistant({ isOpen, setIsOpen }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your Yidu Rental Assistant. How can I help you find, rent, or manage your home today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-5 py-3.5 bg-[#FFC107] hover:bg-[#ffcd38] text-[#022036] font-extrabold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-white/20"
        >
          <Bot size={22} className="text-[#022036]" />
          <span className="text-xs uppercase tracking-wider">AI Assistant</span>
        </button>
      ) : (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-5 py-4 bg-[#022036] border-b border-[#FFC107]/20 flex items-center justify-between text-white">
            <strong className="text-xs tracking-wider uppercase text-[#FFC107]">Yidu Smart Assistant</strong>
            <button onClick={() => setIsOpen(false)} className="p-1 text-white hover:bg-white/20 rounded-lg cursor-pointer">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs ${msg.sender === 'user' ? 'bg-[#FFC107] text-[#022036] font-bold' : 'bg-white text-slate-800 border border-slate-200'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#FFC107]"
            />
            <button type="submit" className="p-2 bg-[#FFC107] hover:bg-[#ffcd38] text-[#022036] rounded-xl font-bold cursor-pointer">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function TenantLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const userName = user?.fullName || "Abebe Kebede";

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
      profileSettings: "Profile Settings",
      helpSupport: "Help & Support",
      tenant: "Tenant",
      online: "Online",
      exploreNow: "Explore Now",
      perfectHome: "Find Your Perfect Home",
      easySafeReliable: "Easy • Safe • Reliable",
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
      profileSettings: "የመገለጫ ቅንብሮች",
      helpSupport: "እርዳታ እና ድጋፍ",
      tenant: "ተከራይ",
      online: "በመስመር ላይ",
      exploreNow: "አሁን ይመልከቱ",
      perfectHome: "ፍጹም ቤትዎን ያግኙ",
      easySafeReliable: "ቀላል • ደህንነቱ የተጠበቀ • አስተማማኝ",
    },
  };

  const t = language === "am" ? translations.am : translations.en;

  const menuItems = [
    { id: "dashboard", label: t.dashboard, icon: <LayoutDashboard size={19} />, path: "/dashboard" },
    { id: "properties", label: t.searchProperties, icon: <Building2 size={19} />, path: "/properties" },
    { id: "favorites", label: t.myFavorites, icon: <Heart size={19} />, path: "/favorites" },
    { id: "requests", label: t.myRequests, icon: <FileText size={19} />, path: "/rental-requests" },
    { id: "leases", label: t.myLeases, icon: <CalendarDays size={19} />, path: "/leases" },
    { id: "messages", label: t.messages, icon: <MessageSquare size={19} />, path: "/messages" },
    { id: "profile", label: t.profileSettings, icon: <Settings size={19} />, path: "/settings" },
    { id: "help", label: t.helpSupport, icon: <Headphones size={19} />, path: "#" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      navigate("/login");
    }
  };

  const navigateTo = (path, id) => {
    setSidebarOpen(false);
    if (id === "help") {
      setIsAIOpen(true);
      return;
    }
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
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 flex font-sans selection:bg-[#FFC107] selection:text-[#022036]">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =================================================
          CONSTANT PERSISTENT SIDEBAR (#022036)
      ================================================ */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-[#022036] border-r border-[#FFC107]/20 p-6 z-50 transition-transform duration-300 flex flex-col justify-between flex-shrink-0 text-white shadow-md ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="overflow-y-auto pr-1 scrollbar-thin">
          <div className="flex lg:hidden items-center justify-between pb-6 mb-6 border-b border-white/10">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo("/dashboard")}>
              <div className="w-9 h-9 rounded-xl bg-[#FFC107] text-[#022036] flex items-center justify-center font-bold">
                <Home size={20} />
              </div>
              <div>
                <strong className="text-sm">House Rental</strong>
                <span className="block text-[10px] text-[#FFC107]">System</span>
              </div>
            </div>
            <button className="p-2 bg-white/5 text-white/80 rounded-xl cursor-pointer" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 mb-8 cursor-pointer px-2" onClick={() => navigateTo("/dashboard")}>
            <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-[#022036] flex items-center justify-center font-extrabold shadow-md">
              <Home size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <strong className="text-base tracking-tight leading-tight">House Rental</strong>
              <span className="text-[10px] text-[#FFC107] tracking-wider uppercase font-extrabold">System</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-white/5 border border-white/10 rounded-2xl mb-6 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-[#FFC107]/20 text-[#FFC107] flex items-center justify-center font-bold text-lg border border-[#FFC107]/30">
              <User size={24} />
            </div>
            <div className="flex flex-col min-w-0">
              <strong className="text-sm font-bold text-white truncate">{userName}</strong>
              <span className="text-xs text-[#FFC107] font-medium">{t.tenant}</span>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {t.online}
              </div>
            </div>
          </div>

          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-3">MENU</div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FFC107] text-[#022036] shadow-md font-black translate-x-1"
                      : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5"
                  }`}
                  onClick={() => navigateTo(item.path, item.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-[#022036]" : "text-[#FFC107]"}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFC107]/20 to-[#FFC107]/5 border border-[#FFC107]/30 p-4 text-center flex-shrink-0 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFC107]">{t.easySafeReliable}</span>
          <h4 className="text-sm font-bold text-white mt-1 mb-3">{t.perfectHome}</h4>
          <button
            onClick={() => navigateTo("/properties")}
            className="w-full py-2 bg-[#FFC107] hover:bg-[#ffcd38] text-[#022036] text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{t.exploreNow}</span>
            <span>→</span>
          </button>
        </div>
      </aside>

      {/* =================================================
          RIGHT CONTENT AREA WITH STICKY NAVBAR
      ================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
        <header className="sticky top-0 z-30 bg-[#022036] border-b border-[#FFC107]/20 px-4 sm:px-8 py-3 flex-shrink-0 shadow-xs text-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 text-white/80 hover:text-white bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={22} />
              </button>

              <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl">
                <button
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#FFC107] bg-white/10 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  onClick={() => navigateTo("/dashboard")}
                >
                  <Home size={14} />
                  {t.home}
                </button>
                <button
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => scrollToSection("about")}
                >
                  {t.about}
                </button>
                <button
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => scrollToSection("contact")}
                >
                  {t.contact}
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-medium text-white transition-all cursor-pointer"
                  onClick={() => setShowLanguageDropdown((prev) => !prev)}
                >
                  <Globe size={15} className="text-[#FFC107]" />
                  <span className="hidden sm:inline">{language === "en" ? "Translate" : "ተርጉም"}</span>
                  <ChevronDown size={13} />
                </button>

                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-2 w-36 bg-[#022036] border border-[#FFC107]/20 rounded-2xl shadow-2xl py-2 z-50">
                    <button
                      onClick={() => changeLanguage("am")}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center gap-2 ${language === "am" ? "bg-[#FFC107]/10 text-[#FFC107] font-bold" : "text-white/80 hover:bg-white/5"}`}
                    >
                      🇪🇹 አማርኛ
                    </button>
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center gap-2 ${language === "en" ? "bg-[#FFC107]/10 text-[#FFC107] font-bold" : "text-white/80 hover:bg-white/5"}`}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                )}
              </div>

              <NotificationsDropdown />

              <button
                className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all cursor-pointer shadow-xs"
                onClick={() => navigateTo("/settings")}
              >
                <div className="w-7 h-7 rounded-lg bg-[#FFC107]/20 text-[#FFC107] flex items-center justify-center font-bold text-xs border border-[#FFC107]/30">
                  <User size={15} />
                </div>
                <span className="text-xs font-medium text-white max-w-[100px] truncate">{userName}</span>
                <ChevronDown size={13} className="text-white/50" />
              </button>

              <button
                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium shadow-xs"
                onClick={handleLogout}
                title={t.logout}
              >
                <LogOut size={16} />
                <span className="hidden md:inline">{t.logout}</span>
              </button>
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT OUTLET (CHANGES WHEN SIDEBAR LINKS ARE CLICKED) */}
        <div className="flex-1 flex flex-col bg-white">
          <Outlet />
        </div>
      </div>

      <TenantAIAssistant isOpen={isAIOpen} setIsOpen={setIsAIOpen} />
      <div id="about" className="h-0"></div>
      <div id="contact" className="h-0"></div>
    </div>
  );
}