import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationsDropdown from "../components/NotificationsDropdown";

import {
  Home,
  Building2,
  Heart,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  ChevronDown,
  Headphones,
  LayoutDashboard,
  CalendarDays,
  Bot,
  Send,
  HelpCircle,
} from "lucide-react";

/* =====================================================
    TENANT AI ASSISTANT COMPONENT WITH 20 BUILT-IN FAQS
===================================================== */
function TenantAIAssistant({ isOpen, setIsOpen }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your Yidu Rental Assistant. Below are 20 common questions about our platform. Click any question to get an instant, system-accurate response!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // List of all 20 exact system questions and their precise responses
  const tenantQuestionsAndAnswers = [
    {
      q: "1. How do I search and filter properties?",
      a: "You can search for verified properties by clicking 'Search Properties' in your sidebar. You can filter listings by city, sub-city, price range, and property type (Apartment, Villa, House)."
    },
    {
      q: "2. What do property listing prices include?",
      a: "Property listing prices are displayed in Ethiopian Birr (ETB) per month. You can view full specifications, room counts, furnished status, and landlord descriptions on each property's detail page."
    },
    {
      q: "3. How do I submit a rental request?",
      a: "To rent a property, open a listing's details page and submit a rental request form specifying your proposed price and move-in dates."
    },
    {
      q: "4. How can I track my request status?",
      a: "You can track whether your rental applications are Pending, Approved, or Rejected in real time under the 'My Requests' menu tab."
    },
    {
      q: "5. How do I save properties to favorites?",
      a: "Click the heart icon on any property card to save it. All your bookmarked properties can be managed easily under the 'My Favorites' menu."
    },
    {
      q: "6. Where can I view my active leases?",
      a: "Your active housing contracts, agreements, and start/end timelines are securely tracked under 'My Leases'."
    },
    {
      q: "7. How do payments work via Chapa?",
      a: "Platform payments and rent settlements are safely processed online through the integrated Chapa payment gateway using Telebirr, CBE Birr, or cards."
    },
    {
      q: "8. How do I view my digital receipts?",
      a: "Once a payment is successfully completed via Chapa, your request status updates to verified, and you can instantly view and download your digital payment receipt under 'Rental Requests'."
    },
    {
      q: "9. Can I chat directly with landlords?",
      a: "You can chat directly and securely with property owners/landlords using the 'Messages' tab once you initiate an inquiry or rental request."
    },
    {
      q: "10. How do I update my profile settings?",
      a: "You can update your personal account information, full name, or phone number anytime under 'Profile Settings' in your sidebar."
    },
    {
      q: "11. Where is my Fayda ID stored?",
      a: "Your Fayda or National ID number is securely stored in your profile settings for verification and lease compliance purposes."
    },
    {
      q: "12. How do I update my family members count?",
      a: "You can update your gender, marital status, and family member count under 'Profile Settings' to help landlords review your rental application accurately."
    },
    {
      q: "13. How do I change my account password?",
      a: "You can update your account password securely by entering your current password and a new password under 'Profile Settings'."
    },
    {
      q: "14. Where can I find system notifications?",
      a: "You can check real-time system alerts, request approvals, and payment updates via the Notifications dropdown on your top navigation bar."
    },
    {
      q: "15. How do I renew or re-apply for a lease?",
      a: "If your lease is finishing or expired, you can click the 'Re-apply' button under 'Rental Requests' to submit a renewal application for the property."
    },
    {
      q: "16. Are my phone numbers kept private?",
      a: "Yidu ensures secure communication without exposing phone numbers directly until a formal inquiry or request is established."
    },
    {
      q: "17. How do I log out of my account?",
      a: "You can securely log out of your session anytime by clicking the 'Log Out' button located at the bottom of your sidebar menu."
    },
    {
      q: "18. What shows up on my tenant dashboard?",
      a: "Your tenant dashboard gives you a quick snapshot of active leases, pending requests, saved favorites, and quick links to search homes."
    },
    {
      q: "19. How do I contact technical support?",
      a: "If you encounter any technical issues with payments or property moderation, please contact system support or message platform admins."
    },
    {
      q: "20. What are the accepted payment methods?",
      a: "Accepted payment methods through Chapa include Telebirr, CBE Birr, and standard debit/credit cards securely processed online."
    }
  ];

  const getCustomAssistantResponse = (query) => {
    const q = query.toLowerCase();
    const found = tenantQuestionsAndAnswers.find(item => 
      q.includes(item.q.toLowerCase().substring(3, 15)) || 
      q === item.q.toLowerCase()
    );

    if (found) {
      return found.a;
    }

    return "I can help you with searching properties, submitting rental requests, tracking active leases, managing favorites, updating your Fayda ID in profile settings, or making secure payments via Chapa. Feel free to click any question from the list below!";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.trim();
    const userMsg = {
      sender: "user",
      text: userQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const assistantReply = {
        sender: "ai",
        text: getCustomAssistantResponse(userQuery),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantReply]);
    }, 200);
  };

  const handleQuestionSelect = (qaItem) => {
    const userMsg = {
      sender: "user",
      text: qaItem.q.replace(/^\d+\.\s*/, ""), 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const aiMsg = {
      sender: "ai",
      text: qaItem.a,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
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
        <div className="w-[380px] sm:w-[420px] h-[640px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* HEADER */}
          <div className="px-5 py-4 bg-[#022036] border-b border-[#FFC107]/20 flex items-center justify-between text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#022036] flex items-center justify-center font-bold">
                <Bot size={18} />
              </div>
              <strong className="text-xs tracking-wider uppercase text-[#FFC107]">Yidu Smart Assistant</strong>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 text-white hover:bg-white/20 rounded-lg cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-[#FFC107] text-[#022036] font-bold rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-xs font-medium'}`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* SCROLLABLE 20 QUESTIONS LIST CONTAINER */}
          <div className="bg-slate-100 border-t border-slate-200 p-3 flex-shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 px-1">
              <HelpCircle size={12} className="text-amber-600" />
              <span>Click any question below for an instant answer:</span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-300">
              {tenantQuestionsAndAnswers.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuestionSelect(item)}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-amber-50 border border-slate-200/90 text-slate-700 hover:text-[#022036] rounded-xl text-[11px] font-medium transition-all cursor-pointer shadow-xs flex items-center justify-between group"
                >
                  <span className="truncate">{item.q}</span>
                  <span className="text-[10px] text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">Get Answer →</span>
                </button>
              ))}
            </div>
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Or type your own question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#FFC107] font-medium"
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
      tenant: "Admin",
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
      tenant: "አስተዳዳሪ",
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 flex font-sans selection:bg-[#FFC107] selection:text-[#022036]">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-[#022036] border-r border-[#FFC107]/20 p-6 z-50 transition-transform duration-300 flex flex-col justify-between flex-shrink-0 text-white shadow-md ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="overflow-y-auto pr-1 scrollbar-thin">
          <div className="hidden lg:flex items-center gap-3 mb-6 cursor-pointer px-2" onClick={() => navigateTo("/dashboard")}>
            <div className="w-10 h-10 rounded-xl bg-[#FFC107] text-[#022036] flex items-center justify-center font-extrabold shadow-md">
              <Home size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <strong className="text-base tracking-tight leading-tight text-white">Yidu Rental</strong>
              <span className="text-[10px] text-[#FFC107] tracking-wider uppercase font-extrabold">PROPERTY PLATFORM</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#0B2C45] border border-white/10 rounded-2xl mb-8 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-[#FFC107] text-[#022036] flex items-center justify-center font-extrabold text-sm shadow-sm">
              {userName.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <strong className="text-xs font-bold text-white truncate">{userName}</strong>
              <span className="text-[10px] bg-[#FFC107] text-[#022036] font-black px-1.5 py-0.5 rounded uppercase tracking-wider w-fit mt-0.5">TENANT</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FFC107] text-[#022036] shadow-md font-black"
                      : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
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

        <div className="pt-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold bg-[#1C1824] hover:bg-[#252030] border border-white/10 text-rose-300 transition-all cursor-pointer shadow-inner"
          >
            <LogOut size={16} className="text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50">
        <header className="sticky top-0 z-30 bg-[#022036] border-b border-[#FFC107]/20 px-4 sm:px-8 py-3 flex-shrink-0 shadow-xs text-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              className="lg:hidden p-2 text-white/80 hover:text-white bg-white/10 rounded-xl transition-all cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
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
                    <button onClick={() => changeLanguage("am")} className="w-full text-left px-4 py-2 text-xs text-white/80 hover:bg-white/5">🇪🇹 አማርኛ</button>
                    <button onClick={() => changeLanguage("en")} className="w-full text-left px-4 py-2 text-xs text-white/80 hover:bg-white/5">🇬🇧 English</button>
                  </div>
                )}
              </div>

              <NotificationsDropdown />

              <button
                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all cursor-pointer"
                onClick={handleLogout}
                title={t.logout}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <TenantAIAssistant isOpen={isAIOpen} setIsOpen={setIsAIOpen} />
    </div>
  );
}