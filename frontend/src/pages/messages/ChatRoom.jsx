import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, User, CheckCheck, Sparkles } from "lucide-react";
import { io } from "socket.io-client";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function ChatRoom() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUserId = user?.id || user?.userId;

  // Auto-scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch Chat History & Contact Info
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/messages/${contactId}`);
        const data = res.data?.messages || res.data || [];
        setMessages(Array.isArray(data) ? data : []);

        if (res.data?.contact) {
          setContact(res.data.contact);
        } else if (data.length > 0) {
          const firstMsg = data[0];
          const contactUser = firstMsg.senderId === currentUserId ? firstMsg.receiver : firstMsg.sender;
          setContact(contactUser);
        }
      } catch (err) {
        console.error("LOAD CHAT HISTORY ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchChatData();
    }
  }, [contactId, currentUserId]);

  // 2. Setup Socket.io Connection & Listeners
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current = socket;

    if (currentUserId) {
      socket.emit("join_room", currentUserId);
    }

    // Listen for incoming live messages
    socket.on("receive_message", (incomingMsg) => {
      if (
        (incomingMsg.senderId === contactId && incomingMsg.receiverId === currentUserId) ||
        (incomingMsg.senderId === currentUserId && incomingMsg.receiverId === contactId)
      ) {
        setMessages((prev) => [...prev, incomingMsg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [contactId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Send Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const payload = {
      receiverId: contactId,
      content: newMessage.trim(),
    };

    try {
      setSending(true);

      const res = await api.post("/messages", payload);
      const savedMsg = res.data?.message || res.data;

      if (socketRef.current) {
        socketRef.current.emit("send_message", savedMsg);
      }

      setMessages((prev) => [...prev, savedMsg]);
      setNewMessage("");
    } catch (err) {
      console.error("SEND MESSAGE ERROR:", err);
      alert(err.response?.data?.error || "Failed to deliver message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full h-full bg-white text-slate-800 flex flex-col font-sans overflow-hidden selection:bg-[#FFC107] selection:text-[#022036]">
      
      {/* CHAT HEADER WITH GOLD/YELLOW COLOR SCHEME TO MATCH OTHER BUTTONS */}
      <header className="px-6 sm:px-10 py-4 bg-[#FFC107] border-b border-[#022036]/10 flex items-center justify-between z-20 shadow-xs text-[#022036]">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate("/messages")}
            className="p-2.5 bg-[#022036]/10 hover:bg-[#022036]/20 rounded-xl text-[#022036] transition-all cursor-pointer border border-[#022036]/10 shadow-xs"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-[#022036]/10 text-[#022036] flex items-center justify-center font-bold flex-shrink-0 border border-[#022036]/20 shadow-xs">
              <User size={20} />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-600 border-2 border-[#FFC107] rounded-full animate-pulse"></span>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-[#022036] tracking-tight">
              {contact?.fullName || contact?.email || "Direct Conversation"}
            </h3>
            <span className="text-[10px] text-[#022036]/80 font-bold flex items-center gap-1.5 uppercase tracking-wider mt-0.5">
              Secure Direct Line
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#022036] bg-[#022036]/10 border border-[#022036]/15 px-3.5 py-1.5 rounded-full">
          <Sparkles size={13} className="text-[#022036]" />
          <span>Encrypted In-App Chat</span>
        </div>
      </header>

      {/* MESSAGES SCROLL AREA (75% Clean White Canvas) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-5 bg-white scrollbar-thin scrollbar-thumb-slate-200">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 size={36} className="animate-spin text-[#FFC107]" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading conversation history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-2">
            <div className="w-16 h-16 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-600 mb-2 shadow-inner">
              <User size={28} />
            </div>
            <p className="text-sm font-bold text-slate-700">No previous messages in this conversation.</p>
            <p className="text-xs text-slate-400 font-light">Send a greeting below to start your direct dialogue!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={msg.id || index}
                className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2.5 animate-in fade-in duration-300`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-md p-4 rounded-3xl text-xs leading-relaxed shadow-sm transition-all ${
                    isMe
                      ? "bg-gradient-to-r from-[#FFC107] to-amber-400 text-[#022036] font-bold rounded-br-xs shadow-amber-500/10"
                      : "bg-slate-100 text-slate-900 border border-slate-200/80 rounded-bl-xs shadow-xs font-medium"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text || msg.content}</p>
                  
                  <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[9px] font-mono ${isMe ? "text-[#022036]/70" : "text-slate-400"}`}>
                    <span>{time}</span>
                    {isMe && <CheckCheck size={13} className="text-[#022036]" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* MESSAGE INPUT BAR */}
      <form onSubmit={handleSendMessage} className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center gap-3 shadow-[0_-10px_25px_rgba(0,0,0,0.03)]">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message securely..."
          className="flex-1 px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-[#FFC107] shadow-inner transition-all"
        />

        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="px-6 py-3.5 bg-[#FFC107] hover:bg-[#ffcd38] text-[#022036] font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 cursor-pointer transition-all uppercase tracking-wider"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}