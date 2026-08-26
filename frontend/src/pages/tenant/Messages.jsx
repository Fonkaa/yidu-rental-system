import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ChevronRight, Clock, Loader2, AlertCircle, Plus, Search, X } from "lucide-react";
import { io } from "socket.io-client";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [searching, setSearching] = useState(false);

  const currentUserId = user?.id || user?.userId;

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/messages");
      const messages = response.data?.messages || response.data || [];

      const threadMap = new Map();

      messages.forEach((msg) => {
        const isSender = msg.senderId === currentUserId;
        const contactUser = isSender ? msg.receiver : msg.sender;
        const contactId = contactUser?.id;

        if (!contactId) return;

        const messageText = msg.text || msg.content || "";

        if (!threadMap.has(contactId) || new Date(msg.createdAt) > new Date(threadMap.get(contactId).rawDate)) {
          threadMap.set(contactId, {
            contactId,
            name: contactUser.fullName || contactUser.email || "User",
            lastMessage: messageText,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawDate: msg.createdAt,
            property: msg.property?.titleEn || msg.property?.titleAm || msg.property?.title || null,
            unread: !msg.isRead && msg.receiverId === currentUserId,
          });
        }
      });

      const sortedThreads = Array.from(threadMap.values()).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
      setConversations(sortedThreads);
    } catch (err) {
      console.error("FETCH MESSAGES ERROR:", err);
      setError(err.response?.data?.error || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") }
    });

    if (currentUserId) {
      socket.emit("join_room", currentUserId);
    }

    socket.on("receive_message", () => {
      fetchConversations();
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!showNewChatModal) return;
      try {
        setSearching(true);
        const res = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`).catch(() => ({ data: { users: [] } }));
        setUsersList(res.data?.users || res.data || []);
      } catch (err) {
        console.error("SEARCH USERS ERROR:", err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showNewChatModal]);

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 flex-1 bg-white relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto w-full space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] block mb-1">
              Teamwork IT Solutions · Communication Center
            </span>
            <h1 className="text-3xl font-black tracking-tight text-[#022036]">In-App Messages</h1>
            <p className="text-slate-700 text-xs sm:text-sm mt-1 font-medium">Communicate securely without exposing phone numbers.</p>
          </div>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus size={16} strokeWidth={3} />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
            <Loader2 size={36} className="animate-spin text-yellow-500" />
            <p className="text-slate-600 text-xs font-semibold">Loading your conversations...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-yellow-50 border border-yellow-200 rounded-full flex items-center justify-center text-yellow-600 mb-4 shadow-inner">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-[#022036] mb-1">No messages yet</h3>
            <p className="text-slate-700 text-xs max-w-sm leading-relaxed mb-6 font-medium">
              Start a new conversation using the button above.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-6 py-3 bg-slate-900 text-yellow-400 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs"
            >
              Start Chatting
            </button>
          </div>
        )}

        {/* Conversations List Card */}
        {!loading && !error && conversations.length > 0 && (
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-slate-100">
            {conversations.map((chat) => (
              <div
                key={chat.contactId}
                onClick={() => navigate(`/messages/${chat.contactId}`)}
                className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 border border-yellow-200 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <MessageSquare size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-base text-slate-900 truncate font-extrabold">{chat.name}</strong>
                      {chat.unread && (
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                      )}
                    </div>
                    {chat.property && (
                      <span className="text-[10px] uppercase font-bold text-yellow-700 block mt-0.5 tracking-wider">
                        Property: {chat.property}
                      </span>
                    )}
                    <p className="text-xs text-slate-700 truncate mt-0.5 font-medium">{chat.lastMessage}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1 font-medium">
                    <Clock size={13} />
                    {chat.time}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-950 group-hover:bg-yellow-100 transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* NEW CONVERSATION MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black uppercase tracking-wider text-[#022036]">Start New Conversation</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-950 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {searching ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-yellow-500" />
                </div>
              ) : usersList.length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-xs font-medium">No users found matching that query.</p>
              ) : (
                usersList.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setShowNewChatModal(false);
                      navigate(`/messages/${u.id}`);
                    }}
                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-yellow-50 rounded-2xl cursor-pointer transition-all border border-slate-200/80"
                  >
                    <div>
                      <strong className="text-xs font-extrabold text-slate-900 block">{u.fullName || u.email}</strong>
                      <span className="text-[10px] text-yellow-700 font-bold uppercase tracking-wider">{u.role || 'Member'}</span>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-900 text-[10px] font-black rounded-xl uppercase">Chat</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}