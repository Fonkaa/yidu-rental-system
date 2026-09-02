import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { 
  Home, ArrowLeft, MapPin, BedDouble, Sofa, Compass, 
  ChevronLeft, ChevronRight, Loader2, Search, Send, RotateCcw, X, CheckCircle 
} from "lucide-react";
import { createRentalRequest } from "../services/rentalRequestService";

export default function ExploreProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFurnished, setSelectedFurnished] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedRooms, setSelectedRooms] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Rental Request Modal States for Guest / Quick Request flow
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState("");

  const [guestForm, setGuestForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    message: "",
    proposedPrice: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchExploreProperties = async () => {
      try {
        setLoading(true);
        const res = await api.get("/properties");
        const data = res.data?.properties || res.data || [];
        const available = Array.isArray(data) 
          ? data.filter(p => String(p.status || "").trim().toUpperCase() === "APPROVED" || String(p.status || "").trim().toUpperCase() === "AVAILABLE")
          : [];
        setProperties(available);
      } catch (err) {
        console.error("Failed to load explore properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExploreProperties();
  }, []);

  const filteredProperties = properties.filter((property) => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (searchLower) {
      const titleMatch = (property.titleEn || property.title || "").toLowerCase().includes(searchLower);
      const locationMatch = (property.location?.city || property.location || "").toLowerCase().includes(searchLower);
      const landmarkMatch = (property.landmarkDescription || property.landmark || "").toLowerCase().includes(searchLower);
      const descMatch = (property.descriptionEn || property.description || "").toLowerCase().includes(searchLower);
      if (!titleMatch && !locationMatch && !landmarkMatch && !descMatch) return false;
    }

    if (selectedFurnished === "furnished" && !property.furnished) return false;
    if (selectedFurnished === "unfurnished" && property.furnished) return false;

    const price = Number(property.price || property.rentAmount || 0);
    if (minPrice !== "" && price < Number(minPrice)) return false;
    if (maxPrice !== "" && price > Number(maxPrice)) return false;

    const rooms = Number(property.rooms ?? property.bedrooms ?? 0);
    if (selectedRooms !== "all") {
      if (selectedRooms === "4+" && rooms < 4) return false;
      if (selectedRooms !== "4+" && rooms !== Number(selectedRooms)) return false;
    }

    return true;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    const priceA = Number(a.price || a.rentAmount || 0);
    const priceB = Number(b.price || b.rentAmount || 0);
    const roomsA = Number(a.rooms ?? a.bedrooms ?? 0);
    const roomsB = Number(b.rooms ?? b.bedrooms ?? 0);

    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    if (sortBy === "rooms") return roomsB - roomsA;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage) || 1;
  const paginatedProperties = sortedProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedFurnished("all");
    setMinPrice("");
    setMaxPrice("");
    setSelectedRooms("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleOpenRequestModal = (property) => {
    setSelectedProperty(property);
    setRequestSuccess(false);
    setRequestError("");
    setGuestForm({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      message: "",
      proposedPrice: property.price || "",
      startDate: "",
      endDate: "",
    });
    setShowRequestModal(true);
  };

  const handleQuickRentalRequest = async (e) => {
    e.preventDefault();
    if (requestLoading || !selectedProperty) return;

    setRequestLoading(true);
    setRequestError("");

    try {
      const payload = {
        propertyId: selectedProperty.id,
        fullName: guestForm.fullName.trim(),
        email: guestForm.email.trim(),
        phone: guestForm.phone.trim(),
        password: guestForm.password,
        message: guestForm.message.trim(),
        proposedPrice: guestForm.proposedPrice ? Number(guestForm.proposedPrice) : null,
        startDate: guestForm.startDate || null,
        endDate: guestForm.endDate || null,
      };

      const response = await createRentalRequest(payload);

      const token = response?.token || response?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("hr_token", token);
      }

      setRequestSuccess(true);
    } catch (err) {
      console.error("QUICK RENTAL REQUEST ERROR:", err);
      const backendError = err.response?.data;
      setRequestError(backendError?.message || backendError?.error || "Failed to submit rental request. Please try again.");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-yellow-500 selection:text-[#022036]">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-2xl bg-yellow-500 text-[#022036] flex items-center justify-center font-black shadow-md group-hover:scale-110 transition-transform">
              <Home size={22} strokeWidth={2.5} />
            </div>
            <div>
              <strong className="text-base tracking-tight leading-none block text-[#022036]">House Rental System</strong>
              <span className="text-[10px] text-yellow-600 tracking-widest uppercase font-black">Explore Catalog</span>
            </div>
          </div>

          <Link 
            to="/"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      {/* EXPLORE HEADER & ADVANCED FILTER HUB */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-extrabold mb-3 shadow-inner">
              <Compass size={14} className="text-yellow-600" />
              <span>Lightning-Fast Advanced Explorer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#022036] tracking-tight">Explore Available Properties</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">Showing {sortedProperties.length} verified database listings (9 listings per page).</p>
          </div>

          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw size={14} /> Reset Filters
          </button>
        </div>

        {/* ADVANCED FILTER TOOLBAR */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="relative md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Search Keyword / Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by title, sub-city, district, or landmark..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-yellow-500"
                />
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Furnished Status</label>
              <select
                value={selectedFurnished}
                onChange={(e) => {
                  setSelectedFurnished(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                <option value="all">All Furnishing</option>
                <option value="furnished">Furnished Only</option>
                <option value="unfurnished">Unfurnished Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Sort Results By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rooms">Most Rooms</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Min Price (ETB)</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g. 5000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Max Price (ETB)</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g. 50000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Number of Rooms</label>
              <select
                value={selectedRooms}
                onChange={(e) => {
                  setSelectedRooms(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                <option value="all">Any Rooms</option>
                <option value="1">1 Room</option>
                <option value="2">2 Rooms</option>
                <option value="3">3 Rooms</option>
                <option value="4+">4+ Rooms</option>
              </select>
            </div>

          </div>
        </div>
      </header>

      {/* PROPERTIES GRID CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-slate-400">
            <Loader2 size={36} className="animate-spin text-yellow-500" />
            <p className="text-xs font-semibold">Loading explore properties from database...</p>
          </div>
        ) : paginatedProperties.length === 0 ? (
          <div className="text-center py-32 text-slate-400 text-xs bg-white rounded-3xl border border-slate-200 shadow-xs font-light space-y-3">
            <p className="text-sm font-bold text-[#022036]">No properties match your filter criteria.</p>
            <p>Try clearing or adjusting your search filters to view more listings.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-5 py-2.5 bg-yellow-500 text-[#022036] rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProperties.map((property) => {
              let imgUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=85";
              if (Array.isArray(property.images) && property.images.length > 0) {
                const rawUrl = property.images[0]?.url || property.images[0];
                if (rawUrl) {
                  imgUrl = rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                }
              }

              const rawVideoUrl = property.videoUrl;
              const videoUrl = rawVideoUrl
                ? rawVideoUrl.startsWith('http') ? rawVideoUrl : `http://localhost:5000${rawVideoUrl.startsWith('/') ? '' : '/'}${rawVideoUrl}`
                : null;

              return (
                <div 
                  key={property.id}
                  className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:border-yellow-400 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-56 overflow-hidden bg-slate-900">
                      {videoUrl ? (
                        <video
                          src={videoUrl}
                          controls
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img 
                          src={imgUrl} 
                          alt={property.titleEn || property.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-200 shadow-xs">
                        {videoUrl ? "Video Tour" : "Verified 3D"}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-1 text-xs text-yellow-600 font-semibold">
                        <MapPin size={13} />
                        <span>{property.location?.city || property.location || "Addis Ababa"}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-[#022036] truncate">{property.titleEn || property.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 font-light">{property.descriptionEn || property.description}</p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-4">
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-600 font-mono">
                      <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-slate-400" /> {property.rooms || 2} Rooms</span>
                      <span className="flex items-center gap-1.5"><Sofa size={14} className="text-slate-400" /> {property.furnished ? "Furnished" : "Unfurnished"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-xl font-black text-slate-950 font-mono">{Number(property.price || 500).toLocaleString()}</strong>
                        <span className="text-[10px] text-slate-400 ml-1 font-semibold">ETB / mo</span>
                      </div>
                      
                      <button
                        onClick={() => handleOpenRequestModal(property)}
                        className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Send size={13} /> Request
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION FOOTER CONTROLS */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-200">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span className="text-xs font-bold text-slate-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      {/* RENTAL REQUEST MODAL */}
      {showRequestModal && selectedProperty && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 text-slate-900">
            <div className="flex justify-between items-start pb-4 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-[#022036] uppercase tracking-wider">Rental Request Application</h2>
                <p className="text-xs text-slate-500 mt-1 font-light">Apply for: <strong className="text-yellow-600 font-bold">{selectedProperty.titleEn || selectedProperty.title}</strong></p>
              </div>
              <button
                type="button"
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-950 cursor-pointer transition-all"
                onClick={() => setShowRequestModal(false)}
                disabled={requestLoading}
              >
                <X size={20} />
              </button>
            </div>

            {requestSuccess ? (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#022036]">Request Submitted Successfully!</h3>
                  <p className="text-xs text-slate-500 mt-2 font-light">
                    Your rental application has been registered and your tenant account has been created. You are now logged in. Please proceed with payment settlement or go to your tenant dashboard.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard", { state: { from: `/rental-requests` } })}
                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Go to Tenant Dashboard →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickRentalRequest} className="space-y-4">
                {requestError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
                    {requestError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={guestForm.fullName}
                      onChange={(e) => setGuestForm({ ...guestForm, fullName: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number *</label>
                    <input
                      type="text"
                      name="phone"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                      placeholder="0911..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={guestForm.password}
                      onChange={(e) => setGuestForm({ ...guestForm, password: e.target.value })}
                      placeholder="Create secure password"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Message to Landlord *</label>
                  <textarea
                    rows="3"
                    name="message"
                    value={guestForm.message}
                    onChange={(e) => setGuestForm({ ...guestForm, message: e.target.value })}
                    placeholder="Introduce yourself and your lease terms..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-yellow-500 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Proposed Monthly Price (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    name="proposedPrice"
                    value={guestForm.proposedPrice}
                    onChange={(e) => setGuestForm({ ...guestForm, proposedPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Move-in Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={guestForm.startDate}
                      onChange={(e) => setGuestForm({ ...guestForm, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Expected End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={guestForm.endDate}
                      onChange={(e) => setGuestForm({ ...guestForm, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                    onClick={() => setShowRequestModal(false)}
                    disabled={requestLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold rounded-xl text-xs shadow-sm cursor-pointer transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                    disabled={requestLoading}
                  >
                    {requestLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>{requestLoading ? "Submitting..." : "Submit Request & Pay"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}