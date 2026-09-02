import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, Plus, Clock, AlertCircle, Loader2, 
  CheckCircle2, XCircle, RefreshCw, Edit3, Save, Image as ImageIcon
} from "lucide-react";
import api from "../../services/api";

export default function LandlordProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inline Edit States
  const [editingProperty, setEditingProperty] = useState(null);
  const [editForm, setEditForm] = useState({ titleEn: '', price: '', rooms: '', descriptionEn: '', furnished: false });
  const [newImages, setNewImages] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFeedback, setEditFeedback] = useState("");

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/properties/mine");
      setProperties(response.data || []);
    } catch (err) {
      console.error("FETCH MY PROPERTIES ERROR:", err);
      setError(err.response?.data?.error || "Failed to load your properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const handleRenew = async (id) => {
    try {
      await api.patch(`/properties/${id}/renew`);
      fetchMyProperties();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to renew listing.");
    }
  };

  const handleOpenEdit = (prop) => {
    setEditingProperty(prop);
    setEditForm({
      titleEn: prop.titleEn || prop.title || '',
      price: prop.price || '',
      rooms: prop.rooms || '',
      descriptionEn: prop.descriptionEn || prop.description || '',
      furnished: prop.furnished || false,
    });
    setNewImages([]);
    setEditFeedback("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProperty) return;

    try {
      setSavingEdit(true);
      setEditFeedback("");

      const formData = new FormData();
      formData.append('titleEn', editForm.titleEn);
      formData.append('price', editForm.price);
      formData.append('rooms', editForm.rooms);
      formData.append('descriptionEn', editForm.descriptionEn);
      formData.append('furnished', editForm.furnished);

      // Robustly append each selected file from the edit page
      if (newImages && newImages.length > 0) {
        newImages.forEach((file) => {
          formData.append('images', file);
        });
      }

      await api.put(`/properties/${editingProperty.id}`, formData);

      setEditFeedback("Property and photos updated successfully!");
      await fetchMyProperties();

      setTimeout(() => {
        setEditingProperty(null);
      }, 1000);
    } catch (err) {
      console.error("Update error:", err);
      setEditFeedback(err.response?.data?.error || "Failed to update property.");
    } finally {
      setSavingEdit(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-full font-bold"><CheckCircle2 size={12} /> Approved</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs rounded-full font-bold"><Clock size={12} /> Pending Review</span>;
      case 'EXPIRED':
        return <span className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-full font-bold"><XCircle size={12} /> Expired</span>;
      case 'RENTED':
        return <span className="flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs rounded-full font-bold"><Building2 size={12} /> Rented</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-white text-slate-800 flex flex-col font-sans selection:bg-yellow-500 selection:text-[#022036]">

      {/* Top Header Bar (#022036) */}
      <header className="sticky top-0 z-30 bg-[#022036] border-b border-yellow-500/20 px-6 sm:px-12 py-4 flex items-center justify-between text-white shadow-xs">
        <h1 className="text-base font-bold text-white tracking-tight">Manage Your Properties</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/landlord/properties/new')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus size={15} /> Add New Property
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-12 max-w-7xl mx-auto space-y-8 w-full bg-white">

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
            <Loader2 size={36} className="animate-spin text-yellow-500" />
            <p className="text-slate-400 text-xs font-semibold">Loading your listings...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs text-center flex items-center justify-center gap-2 font-semibold">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* INLINE EDIT VIEW */}
        {!loading && editingProperty && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-[#022036] flex items-center gap-2">
                <Edit3 className="text-yellow-600" size={20} /> Editing: {editingProperty.titleEn}
              </h2>
              <button
                onClick={() => setEditingProperty(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer border border-slate-200"
              >
                Back to Properties
              </button>
            </div>

            {editFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 font-semibold ${editFeedback.includes("success") ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                <span>{editFeedback}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Property Title</label>
                  <input
                    type="text"
                    value={editForm.titleEn}
                    onChange={(e) => setEditForm({ ...editForm, titleEn: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Price (ETB / month)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Rooms</label>
                  <input
                    type="number"
                    value={editForm.rooms}
                    onChange={(e) => setEditForm({ ...editForm, rooms: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={editForm.descriptionEn}
                    onChange={(e) => setEditForm({ ...editForm, descriptionEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="furnished"
                    checked={editForm.furnished}
                    onChange={(e) => setEditForm({ ...editForm, furnished: e.target.checked })}
                    className="w-4 h-4 accent-yellow-500 cursor-pointer"
                  />
                  <label htmlFor="furnished" className="text-slate-700 font-semibold cursor-pointer">Furnished Property</label>
                </div>
              </div>

              {/* Photos Management */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <label className="block text-slate-600 font-semibold text-xs flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-yellow-600" /> Upload Additional / Replacement Photos
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setNewImages(Array.from(e.target.files))}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-yellow-500 file:text-[#022036] hover:file:bg-yellow-400 file:cursor-pointer cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={savingEdit}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#022036] font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{savingEdit ? "Saving Changes..." : "Save Property & Photo Updates"}</span>
              </button>
            </form>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && !editingProperty && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
            <div className="w-16 h-16 bg-yellow-50 border border-yellow-200 rounded-full flex items-center justify-center text-yellow-600 mb-4 shadow-inner">
              <Building2 size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">No active listings found</h3>
            <p className="text-slate-500 text-xs max-w-sm leading-relaxed mb-6">
              You haven't added any real estate properties yet. Create your first listing to connect with prospective tenants.
            </p>
            <button
              onClick={() => navigate('/landlord/properties/new')}
              className="px-6 py-2.5 rounded-xl bg-yellow-500 text-[#022036] font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
            >
              Create First Listing
            </button>
          </div>
        )}

        {/* PROPERTIES GRID CARDS */}
        {!loading && !error && !editingProperty && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div 
                key={property.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group hover:border-yellow-400 transition-all"
              >
                <div>
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0].url.startsWith('http') ? property.images[0].url : `http://localhost:5000${property.images[0].url}`} 
                        alt={property.titleEn}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                        No Image Uploaded
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(property.status)}
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 truncate">{property.titleEn || property.titleAm}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 font-light">{property.descriptionEn || property.descriptionAm}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-medium">{property.rooms} Rooms • {property.furnished ? 'Furnished' : 'Unfurnished'}</span>
                      <span className="text-base font-black text-slate-950 font-mono">{property.price} ETB</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenEdit(property);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Edit3 size={14} /> Edit & Photos
                  </button>
                  {property.status === 'EXPIRED' && (
                    <button
                      onClick={() => handleRenew(property.id)}
                      className="px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-[#022036] text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <RefreshCw size={12} /> Renew
                    </button>
                    
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}