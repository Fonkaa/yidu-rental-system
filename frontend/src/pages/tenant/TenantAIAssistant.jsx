
import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  HelpCircle,
  Loader2,
} from "lucide-react";

export default function TenantAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your fiker Rental Assistant. How can I help you find, rent, or manage your home today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
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
      a: "You can search for verified properties by clicking 'Search Properties' in your sidebar. You can filter listings by city, sub-city, price range, and property type (Apartment, Villa, House).",
    },
    {
      q: "2. What do property listing prices include?",
      a: "Property listing prices are displayed in Ethiopian Birr (ETB) per month. You can view full specifications, room counts, furnished status, and landlord descriptions on each property's detail page.",
    },
    {
      q: "3. How do I submit a rental request?",
      a: "To rent a property, open a listing's details page and submit a rental request form specifying your proposed price and move-in dates.",
    },
    {
      q: "4. How can I track my request status?",
      a: "You can track whether your rental applications are Pending, Approved, or Rejected in real time under the 'My Requests' menu tab.",
    },
    {
      q: "5. How do I save properties to favorites?",
      a: "Click the heart icon on any property card to save it. All your bookmarked properties can be managed easily under the 'My Favorites' menu.",
    },
    {
      q: "6. Where can I view my active leases?",
      a: "Your active housing contracts, agreements, and start/end timelines are securely tracked under 'My Leases'.",
    },
    {
      q: "7. How do payments work via Chapa?",
      a: "Platform payments and rent settlements are safely processed online through the integrated Chapa payment gateway using Telebirr, CBE Birr, or cards.",
    },
    {
      q: "8. How do I view my digital receipts?",
      a: "Once a payment is successfully completed via Chapa, your request status updates to verified, and you can instantly view and download your digital payment receipt under 'Rental Requests'.",
    },
    {
      q: "9. Can I chat directly with landlords?",
      a: "You can chat directly and securely with property owners/landlords using the 'Messages' tab once you initiate an inquiry or rental request.",
    },
    {
      q: "10. How do I update my profile settings?",
      a: "You can update your personal account information, full name, or phone number anytime under 'Profile Settings' in your sidebar.",
    },
    {
      q: "11. Where is my Fayda ID stored?",
      a: "Your Fayda or National ID number is securely stored in your profile settings for verification and lease compliance purposes.",
    },
    {
      q: "12. How do I update my family members count?",
      a: "You can update your gender, marital status, and family member count under 'Profile Settings' to help landlords review your rental application accurately.",
    },
    {
      q: "13. How do I change my account password?",
      a: "You can update your account password securely by entering your current password and a new password under 'Profile Settings'.",
    },
    {
      q: "14. Where can I find system notifications?",
      a: "You can check real-time system alerts, request approvals, and payment updates via the Notifications dropdown on your top navigation bar.",
    },
    {
      q: "15. How do I renew or re-apply for a lease?",
      a: "If your lease is finishing or expired, you can click the 'Re-apply' button under 'Rental Requests' to submit a renewal application for the property.",
    },
    {
      q: "16. Are my phone numbers kept private?",
      a: "Yidu ensures secure communication without exposing phone numbers directly until a formal inquiry or request is established.",
    },
    {
      q: "17. How do I log out of my account?",
      a: "You can securely log out of your session anytime by clicking the 'Log Out' button located at the bottom of your sidebar menu.",
    },
    {
      q: "18. What shows up on my tenant dashboard?",
      a: "Your tenant dashboard gives you a quick snapshot of active leases, pending requests, saved favorites, and quick links to search homes.",
    },
    {
      q: "19. How do I contact technical support?",
      a: "If you encounter any technical issues with payments or property moderation, please contact system support or message platform admins.",
    },
    {
      q: "20. What are the accepted payment methods?",
      a: "Accepted payment methods through Chapa include Telebirr, CBE Birr, and standard debit/credit cards securely processed online.",
    },
  ];

  const getCustomAssistantResponse = (query) => {
    const q = query.toLowerCase();

    const found = tenantQuestionsAndAnswers.find(
      (item) =>
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

    if (!input.trim() || loading) return;

    const userQuery = input.trim();

    const userMsg = {
      sender: "user",
      text: userQuery,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const assistantReply = {
        sender: "ai",
        text: getCustomAssistantResponse(userQuery),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantReply]);
      setLoading(false);
    }, 200);
  };

  const handleQuestionSelect = (qaItem) => {
    if (loading) return;

    const userMsg = {
      sender: "user",
      text: qaItem.q.replace(/^\d+\.\s*/, ""),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const aiMsg = {
      sender: "ai",
      text: qaItem.a,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans selection:bg-yellow-500 selection:text-[#022036]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-5 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-white/25"
        >
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping"></span>

          <Bot
            size={22}
            className="text-[#022036]"
          />

          <span className="text-xs uppercase tracking-wider">
            AI Assistant
          </span>
        </button>
      ) : (
        <div className="w-[380px] sm:w-[420px] h-[640px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 text-slate-800">

          {/* HEADER */}
          <div className="px-5 py-4 bg-[#022036] border-b border-yellow-500/20 flex items-center justify-between flex-shrink-0 text-white">
            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-yellow-500 text-[#022036] flex items-center justify-center font-bold shadow-sm">
                <Bot size={20} />
              </div>

              <div>
                <strong className="text-sm block">
                  Yidu Smart Assistant
                </strong>

                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  20 System FAQs Built-in
                </span>
              </div>

            </div>

            {/* X BUTTON - CLOSE CHATBOT */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              aria-label="Close AI Assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.sender === "user"
                    ? "items-end"
                    : "items-start"
                }`}
              >

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                    msg.sender === "user"
                      ? "bg-yellow-500 text-[#022036] font-bold rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-xs font-medium"
                  }`}
                >
                  {msg.text}
                </div>

                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                  {msg.time}
                </span>

              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="bg-white text-slate-500 border border-slate-200 p-3 rounded-2xl rounded-bl-sm text-xs flex items-center gap-2 shadow-xs font-medium">

                  <Loader2
                    size={14}
                    className="animate-spin text-yellow-600"
                  />

                  <span>
                    Assistant is typing...
                  </span>

                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* QUESTIONS LIST */}
          <div className="bg-slate-100 border-t border-slate-200 p-3 flex-shrink-0">

            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 px-1">

              <HelpCircle
                size={12}
                className="text-yellow-600"
              />

              <span>
                Click any question below for an instant answer:
              </span>

            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-300">

              {tenantQuestionsAndAnswers.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuestionSelect(item)}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-yellow-50 border border-slate-200/90 text-slate-700 hover:text-[#022036] rounded-xl text-[11px] font-medium transition-all cursor-pointer shadow-xs flex items-center justify-between group"
                >

                  <span className="truncate">
                    {item.q}
                  </span>

                  <span className="text-[10px] text-yellow-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                    Get Answer →
                  </span>

                </button>
              ))}

            </div>
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0"
          >

            <input
              type="text"
              placeholder="Or type your own question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-yellow-500 disabled:opacity-50 font-medium"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] rounded-xl font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center disabled:opacity-50"
            >
              <Send size={16} />
            </button>

          </form>

        </div>
      )}
    </div>
  );
}