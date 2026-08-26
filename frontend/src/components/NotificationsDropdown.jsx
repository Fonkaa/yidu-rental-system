import React, { useEffect, useState } from "react";
import { Bell, Check, Loader2, Info, CheckCircle2, MessageSquare } from "lucide-react";
import { io } from "socket.io-client";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUserId = user?.id || user?.userId;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error("FETCH NOTIFICATIONS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    fetchNotifications();

    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") }
    });

    socket.emit("join_room", currentUserId);

    socket.on("receive_notification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [currentUserId]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || id === 'all' ? { ...n, isRead: true } : n))
      );
      if (id === 'all') setUnreadCount(0);
      else setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("MARK READ ERROR:", err);
    }
  };

  return (
    <div className="relative font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 hover:text-slate-950 transition-all cursor-pointer shadow-xs"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-[#022036] font-black text-[10px] rounded-full flex items-center justify-center animate-bounce shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#022036]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => handleMarkAsRead('all')}
                className="text-[10px] text-yellow-600 hover:underline font-bold cursor-pointer uppercase"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-yellow-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`p-4 transition-all cursor-pointer flex gap-3 items-start ${
                    n.isRead ? "bg-transparent opacity-60" : "bg-yellow-50/50 hover:bg-yellow-50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 border ${
                    n.type === 'REQUEST' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#022036] truncate font-extrabold">{n.title}</strong>
                      <span className="text-[9px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-light">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}