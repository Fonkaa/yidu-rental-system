import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Sofa,
  Tag,
  CheckCircle,
  Heart,
  Send,
  Navigation,
  Image as ImageIcon,
  X,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";
import { getMyProfile } from "../../services/profileService";
import { createRentalRequest } from "../../services/rentalRequestService";
import { favoriteService } from "../../services/favoriteService";

export default function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [existingRentalRequest, setExistingRentalRequest] = useState(null);
  const [rentalRequestLoading, setRentalRequestLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState("");
  const [requestError, setRequestError] = useState("");

  const [tenantProfile, setTenantProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [requestForm, setRequestForm] = useState({
    message: "",
    proposedPrice: "",
    startDate: "",
    endDate: "",
  });

  // Load property details and check favorite status
  useEffect(() => {
    const loadPropertyAndFavorites = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch property details and user favorites in parallel
        const [propertyRes, favoritesRes] = await Promise.all([
          api.get(`/properties/${id}`),
          favoriteService.getAll().catch(() => ({ data: [] }))
        ]);

        const propertyData = propertyRes.data?.property || propertyRes.data;

        if (!propertyData) {
          setError("Property not found");
          return;
        }

        setProperty(propertyData);

        // Check if this property is in user's favorites
        const favData = favoritesRes?.data || favoritesRes;
        let favList = [];
        if (Array.isArray(favData)) {
          favList = favData;
        } else if (Array.isArray(favData?.favorites)) {
          favList = favData.favorites;
        }

        const isFav = favList.some(
          (item) => String(item?.propertyId || item?.property?.id || item?.id) === String(id)
        );
        setFavorite(isFav);

      } catch (err) {
        console.error("LOAD PROPERTY DETAILS ERROR:", err);
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load property details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPropertyAndFavorites();
    } else {
      setError("Property ID is missing");
      setLoading(false);
    }
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!id || favoriteLoading) return;

    try {
      setFavoriteLoading(true);
      if (favorite) {
        await favoriteService.remove(id);
        setFavorite(false);
      } else {
        await favoriteService.add(id);
        setFavorite(true);
      }
    } catch (err) {
      console.error("TOGGLE FAVORITE ERROR:", err);
      window.alert(err.response?.data?.error || "Failed to update favorite status.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const loadExistingRentalRequest = async () => {
    try {
      setRentalRequestLoading(true);
      const response = await api.get("/rental-requests");
      const requests = response.data?.requests || response.data?.data || [];

      if (!Array.isArray(requests)) {
        setExistingRentalRequest(null);
        return;
      }

      const currentPropertyRequest = requests.find((request) => {
        const requestPropertyId = request.propertyId || request.property?.id;
        return String(requestPropertyId) === String(id);
      });

      setExistingRentalRequest(currentPropertyRequest || null);
    } catch (err) {
      console.error("LOAD RENTAL REQUESTS ERROR:", err);
    } finally {
      setRentalRequestLoading(false);
    }
  };

  useEffect(() => {
    if (!property || !id) return;
    loadExistingRentalRequest();
  }, [property, id]);

  const loadTenantProfile = async () => {
    try {
      setProfileLoading(true);
      setRequestError("");

      const response = await getMyProfile();
      const profile = response?.data?.user || response?.user || response?.data || response;

      if (!profile) {
        throw new Error("Tenant profile not found");
      }

      setTenantProfile(profile);
    } catch (err) {
      console.error("LOAD TENANT PROFILE ERROR:", err);
      setTenantProfile({ fullName: "Tenant User", email: "tenant@example.com" });
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-white text-slate-800 flex flex-col items-center justify-center gap-4 font-sans">
        <Loader2 size={40} className="animate-spin text-yellow-500" />
        <p className="text-sm text-slate-400 font-semibold">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="h-full w-full bg-slate-50 text-slate-800 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={30} />
          </div>
          <h2 className="text-xl font-black text-[#022036] mb-2">Unable to load property</h2>
          <p className="text-slate-500 text-xs mb-6 font-light">{error || "Property not found."}</p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft size={16} />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  let images = [];
  if (Array.isArray(property.images) && property.images.length > 0) {
    images = property.images.map(img => {
      const rawUrl = img?.url || img;
      return rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
    });
  } else if (property.image) {
    const rawUrl = property.image;
    images = [rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`];
  } else if (property.imageUrl) {
    const rawUrl = property.imageUrl;
    images = [rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`];
  }

  const locationName = property.location?.city || property.city || "Addis Ababa";
  const categoryName = property.category?.name || "Apartment";
  const title = property.titleEn || property.title || "Untitled Property";
  const description = property.descriptionEn || property.description || "No description available.";
  const rooms = property.rooms ?? property.bedrooms ?? 0;
  const furnished = property.furnished === true;
  const price = Number(property.price || property.rentAmount || 0);
  const status = property.status || "APPROVED";
  const landmark = property.landmarkDescription || property.landmark || "";
  
  const isAvailable = status === "APPROVED" || status === "AVAILABLE";

  const rentalStatus = existingRentalRequest?.status || null;
  const hasPendingRequest = rentalStatus === "PENDING";
  const hasApprovedRequest = rentalStatus === "APPROVED" && status === "RENTED";

  const getRequestButtonText = () => {
    if (rentalRequestLoading) return "Checking Request...";
    if (hasPendingRequest) return "Request Pending";
    if (hasApprovedRequest) return "Rental Approved";
    return "Request to Rent";
  };

  const handleOpenRequestForm = async () => {
    setRequestSuccess("");
    setRequestError("");
    await loadExistingRentalRequest();
    setShowRequestForm(true);
    await loadTenantProfile();
  };

  const handleRentRequest = async (e) => {
    e.preventDefault();
    if (requestLoading) return;

    if (hasPendingRequest || hasApprovedRequest) {
      setRequestError("You already have an active or pending request for this property.");
      return;
    }

    setRequestLoading(true);
    setRequestError("");

    try {
      const response = await createRentalRequest({
        propertyId: property.id,
        message: requestForm.message.trim(),
        proposedPrice: requestForm.proposedPrice ? Number(requestForm.proposedPrice) : null,
        startDate: requestForm.startDate || null,
        endDate: requestForm.endDate || null,
      });

      setExistingRentalRequest(response?.request || { propertyId: property.id, status: "PENDING" });
      setRequestSuccess("Rental request submitted successfully! Your request is now pending review.");
      setRequestForm({ message: "", proposedPrice: "", startDate: "", endDate: "" });
    } catch (err) {
      console.error("CREATE RENTAL REQUEST ERROR:", err);
      const backendError = err.response?.data;
      setRequestError(backendError?.message || backendError?.error || "Failed to submit rental request.");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 text-slate-800 py-10 px-4 sm:px-8 relative overflow-y-auto pb-24 font-sans selection:bg-yellow-500 selection:text-[#022036]">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 bg-white border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-xs"
        >
          <ArrowLeft size={16} />
          Back to Properties
        </Link>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
              <CheckCircle size={13} />
              {isAvailable ? "Approved & Available" : status}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#022036]">{title}</h1>
            <div className="flex items-center gap-1.5 text-xs text-yellow-600 font-semibold mt-2">
              <MapPin size={15} />
              <span>{locationName}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={favoriteLoading}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center shadow-xs ${
              favorite ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-slate-600 hover:text-slate-950 border-slate-200"
            }`}
            onClick={handleToggleFavorite}
          >
            {favoriteLoading ? (
              <Loader2 size={20} className="animate-spin text-yellow-500" />
            ) : (
              <Heart size={20} fill={favorite ? "currentColor" : "none"} />
            )}
          </button>
        </div>

        {/* IMAGE GALLERY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden p-3 shadow-xs">
            <div className="relative h-80 sm:h-[420px] rounded-2xl overflow-hidden bg-slate-100">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]?.url || images[activeImage]}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <ImageIcon size={48} />
                  <span className="text-xs font-medium">No images available</span>
                </div>
              )}
              <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-950/70 backdrop-blur-md text-xs font-extrabold text-white border border-white/10 shadow-xs">
                {images.length > 0 ? `${activeImage + 1} / ${images.length}` : "0 / 0"}
              </span>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto mt-3 pb-2 scrollbar-none">
                {images.map((img, index) => {
                  const imgUrl = img?.url || img;
                  return (
                    <button
                      key={img?.id || `${imgUrl}-${index}`}
                      type="button"
                      className={`h-20 w-28 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        activeImage === index ? "border-yellow-500 scale-105 shadow-xs" : "border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img src={imgUrl} alt={`${title} ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SIDEBAR CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Monthly Rent</span>
              <div className="flex items-baseline gap-1.5 mb-1 font-mono">
                <strong className="text-3xl font-black text-slate-950">{price.toLocaleString()}</strong>
                <span className="text-xs text-slate-400 font-semibold">ETB / month</span>
              </div>
              <div className="h-px bg-slate-200 my-6"></div>

              {!isAvailable ? (
                <button type="button" className="w-full py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl cursor-not-allowed text-xs uppercase tracking-wider" disabled>
                  Property Unavailable
                </button>
              ) : hasPendingRequest ? (
                <button type="button" className="w-full py-4 bg-amber-50 text-amber-800 font-extrabold rounded-2xl cursor-not-allowed text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-amber-200 shadow-xs" disabled>
                  <CheckCircle size={18} />
                  Request Pending
                </button>
              ) : hasApprovedRequest ? (
                <button type="button" className="w-full py-4 bg-emerald-50 text-emerald-800 font-extrabold rounded-2xl cursor-not-allowed text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-emerald-200 shadow-xs" disabled>
                  <CheckCircle size={18} />
                  Rental Approved
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-black rounded-2xl shadow-sm transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.99]"
                  onClick={handleOpenRequestForm}
                  disabled={rentalRequestLoading}
                >
                  <Send size={18} />
                  {getRequestButtonText()}
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-6 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
              <CheckCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>Verified direct listing through Teamwork IT Solutions platform infrastructure.</span>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-black text-[#022036] mb-6 uppercase tracking-wider">Property Information</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-yellow-600 mb-2"><BedDouble size={22} /></div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Rooms</span>
                  <strong className="text-base font-extrabold text-slate-900 font-mono">{rooms}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-yellow-600 mb-2"><Sofa size={22} /></div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Furnished</span>
                  <strong className="text-base font-extrabold text-slate-900">{furnished ? "Yes" : "No"}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-yellow-600 mb-2"><Tag size={22} /></div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Category</span>
                  <strong className="text-base font-extrabold text-slate-900 truncate block">{categoryName}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-emerald-600 mb-2"><CheckCircle size={22} /></div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Status</span>
                  <strong className="text-base font-extrabold text-slate-900">{status}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-black text-[#022036] mb-4 uppercase tracking-wider">Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-light">{description}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-black text-[#022036] mb-4 uppercase tracking-wider">Location & Surroundings</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                  <MapPin size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Structured Location</span>
                    <strong className="text-sm font-extrabold text-slate-900">{locationName}</strong>
                  </div>
                </div>

                {landmark && (
                  <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                    <Navigation size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Landmark Description</span>
                      <strong className="text-sm font-extrabold text-slate-900">{landmark}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RENTAL REQUEST MODAL */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 text-slate-900">
            <div className="flex justify-between items-start pb-4 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-[#022036] uppercase tracking-wider">Request to Rent</h2>
                <p className="text-xs text-slate-500 mt-1 font-light">Submit agreement application for: <strong className="text-yellow-600 font-bold">{title}</strong></p>
              </div>
              <button
                type="button"
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-950 cursor-pointer transition-all"
                onClick={() => setShowRequestForm(false)}
                disabled={requestLoading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 shadow-xs">
              <h3 className="text-xs font-black text-yellow-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={15} /> Verified Tenant Profile Data
              </h3>

              {profileLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 size={16} className="animate-spin text-yellow-500" />
                  <span>Loading profile data...</span>
                </div>
              ) : tenantProfile ? (
                <div className="grid grid-cols-2 gap-3 text-xs font-medium">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Full Name</span>
                    <strong className="text-slate-900">{tenantProfile.fullName || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Email</span>
                    <strong className="text-slate-900 truncate block">{tenantProfile.email || "N/A"}</strong>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-600 font-semibold">Profile data could not be verified.</p>
              )}
            </div>

            {requestSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs mb-6 flex items-center gap-2.5 font-semibold">
                <CheckCircle size={18} className="flex-shrink-0" />
                <span>{requestSuccess}</span>
              </div>
            )}

            {requestError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs mb-6 font-semibold">
                {requestError}
              </div>
            )}

            {!requestSuccess && (
              <form onSubmit={handleRentRequest} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Message to Landlord</label>
                  <textarea
                    rows="3"
                    value={requestForm.message}
                    onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                    placeholder="Introduce yourself and specify your preferred terms..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-yellow-500 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Proposed Monthly Price (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    value={requestForm.proposedPrice}
                    onChange={(e) => setRequestForm({ ...requestForm, proposedPrice: e.target.value })}
                    placeholder={price}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Move-in Start Date</label>
                    <input
                      type="date"
                      value={requestForm.startDate}
                      onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Expected End Date</label>
                    <input
                      type="date"
                      value={requestForm.endDate}
                      onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-yellow-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                    onClick={() => setShowRequestForm(false)}
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
                    <span>{requestLoading ? "Submitting..." : "Submit Request"}</span>
                  </button>
                </div>
              </form>
            )}

            {requestSuccess && (
              <button
                type="button"
                className="w-full mt-4 py-3 bg-yellow-500 text-[#022036] font-extrabold rounded-xl text-xs shadow-sm cursor-pointer uppercase tracking-wider"
                onClick={() => setShowRequestForm(false)}
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}