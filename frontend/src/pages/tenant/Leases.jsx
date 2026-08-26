import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import {
  CalendarDays,
  MapPin,
  Loader2,
  ArrowRight
} from "lucide-react";

export default function Leases() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLoading(true);
        const res = await api.get("/leases/my-leases");
        const leaseData = res.data?.leases || res.data || [];
        setLeases(Array.isArray(leaseData) ? leaseData : []);
      } catch (err) {
        console.error("Error fetching leases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 flex-1 bg-white">
      {/* Page Title Header */}
      <div className="border-b border-slate-200 pb-4 max-w-7xl mx-auto w-full">
        <h2 className="text-xl font-extrabold text-[#022036]">My Rental Leases</h2>
        <p className="text-xs text-slate-500 mt-0.5">View and manage your active or past lease agreements.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4 w-full max-w-7xl mx-auto">
          <Loader2 size={40} className="animate-spin text-yellow-500" />
          <p className="text-slate-400 text-xs font-semibold">Loading your lease agreements...</p>
        </div>
      ) : leases.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-slate-50 border border-slate-200 rounded-3xl shadow-xs w-full max-w-7xl mx-auto">
          <CalendarDays size={40} className="text-yellow-600 mb-4" />
          <h3 className="text-lg font-extrabold mb-1 text-[#022036]">No Active Leases Found</h3>
          <p className="text-slate-500 text-xs mb-6 font-light">You do not have any active or past lease agreements yet.</p>
          <button 
            onClick={() => navigate("/properties")} 
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold text-xs rounded-xl cursor-pointer shadow-sm uppercase tracking-wider"
          >
            Explore Properties
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-7xl mx-auto w-full">
          {leases.map((lease) => {
            const isActive = lease.status === "ACTIVE";
            const startDate = lease.startDate ? new Date(lease.startDate).toLocaleDateString() : "N/A";
            const endDate = lease.endDate ? new Date(lease.endDate).toLocaleDateString() : "Ongoing";

            let imgUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=85";
            const propertyImages = lease.property?.images;
            if (Array.isArray(propertyImages) && propertyImages.length > 0) {
              const firstImg = propertyImages[0];
              const raw = typeof firstImg === 'string' ? firstImg : (firstImg?.url || firstImg?.path);
              if (raw) {
                imgUrl = raw.startsWith('http') ? raw : `http://localhost:5000${raw.startsWith('/') ? '' : '/'}${raw}`;
              }
            }

            const propertyTitle = lease.property?.titleEn || lease.property?.title || "Rental Property";
            const propertyCity = lease.property?.location?.city || lease.property?.city || "Addis Ababa";
            const actualRentAmount = Number(lease.rentAmount || lease.monthlyRent || lease.property?.price || 0);

            return (
              <div key={lease.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <img src={imgUrl} alt="Property" loading="lazy" className="w-24 h-24 rounded-2xl object-cover border border-slate-200 flex-shrink-0 bg-slate-100" />
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h4 className="font-extrabold text-[#022036] text-base">{propertyTitle}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {lease.status}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-600 font-semibold flex items-center gap-1 mb-2">
                      <MapPin size={13} /> {propertyCity} • <strong className="text-slate-950 font-mono">{actualRentAmount.toLocaleString()} ETB</strong> / month
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Period: <span className="text-slate-900 font-semibold">{startDate}</span> to <span className="text-slate-900 font-semibold">{endDate}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/properties/${lease.propertyId}`)}
                  className="w-full md:w-auto px-5 py-3 bg-slate-900 hover:bg-yellow-500 hover:text-[#022036] text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs uppercase tracking-wider"
                >
                  <span>View Property</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}