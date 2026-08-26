import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Globe,
  ChevronDown,
  User,
  LogOut,
  Home,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import NotificationsDropdown from "../NotificationsDropdown";

export default function TenantNavbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [language, setLanguage] = useState("en");
  const [showLanguageDropdown, setShowLanguageDropdown] =
    useState(false);

  const userName = user?.fullName || "Valued Tenant";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#022036] border-b border-yellow-500/20 px-4 sm:px-8 py-3 flex-shrink-0 shadow-sm text-white">

      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          {/* MOBILE MENU */}
          <button
            className="lg:hidden p-2 text-white/80 hover:text-white bg-white/10 border border-white/10 rounded-xl"
            onClick={() => {
              // Sidebar is controlled from TenantSidebar.
              // For mobile, you can later connect this with context.
            }}
          >
            <Menu size={22} />
          </button>

          {/* NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl">

            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-yellow-400 bg-white/10 flex items-center gap-1.5"
            >
              <Home size={14} />
              Home
            </button>

            <button
              onClick={() => {
                const about = document.getElementById("about");

                if (about) {
                  about.scrollIntoView({
                    behavior: "smooth",
                  });
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
            >
              About Us
            </button>

            <button
              onClick={() => {
                const contact = document.getElementById("contact");

                if (contact) {
                  contact.scrollIntoView({
                    behavior: "smooth",
                  });
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
            >
              Contact Us
            </button>

          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* LANGUAGE */}
          <div className="relative">

            <button
              onClick={() =>
                setShowLanguageDropdown(
                  (prev) => !prev
                )
              }
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-medium"
            >
              <Globe size={15} className="text-yellow-400" />

              <span className="hidden sm:inline">
                {language === "en"
                  ? "Translate"
                  : "ተርጉም"}
              </span>

              <ChevronDown size={13} />
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-[#022036] border border-yellow-500/20 rounded-2xl shadow-2xl py-2 z-50">

                <button
                  onClick={() => {
                    setLanguage("am");
                    setShowLanguageDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5"
                >
                  🇪🇹 አማርኛ
                </button>

                <button
                  onClick={() => {
                    setLanguage("en");
                    setShowLanguageDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5"
                >
                  🇬🇧 English
                </button>

              </div>
            )}

          </div>

          {/* NOTIFICATIONS */}
          <NotificationsDropdown />

          {/* PROFILE */}
          <button
            onClick={() => navigate("/settings")}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl"
          >
            <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <User size={15} />
            </div>

            <span className="text-xs font-medium max-w-[100px] truncate">
              {userName}
            </span>

            <ChevronDown size={13} />
          </button>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-1.5"
          >
            <LogOut size={16} />

            <span className="hidden md:inline text-xs">
              Logout
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}