import React from "react";
import { useFavorites } from "../../hooks/useFavorites";
import FavoriteButton from "../../components/tenant/FavoriteButton";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  BedDouble,
  Sofa,
  ArrowRight,
  Loader,
} from "lucide-react";

export default function Favorites() {
  const {
    favorites,
    loading,
    error,
    toggleFavorite,
  } = useFavorites();

  const handleRemove = async (propertyId) => {
    try {
      await toggleFavorite(propertyId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader size={36} className="animate-spin text-yellow-500" />
          <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 sm:p-8 lg:p-12 relative overflow-hidden font-sans selection:bg-yellow-500 selection:text-[#022036]">
      {/* Luxury Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] block mb-1">
              YOUR COLLECTION
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-[#022036]">
              Saved Properties
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-light">
              Keep track of the properties you are interested in.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl backdrop-blur-md self-start md:self-auto shadow-xs">
            <Heart size={18} className="text-rose-500" fill="currentColor" />
            <span className="font-black text-lg text-slate-900 font-mono">{favorites.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Saved</span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Empty State / Grid */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-slate-50 border border-slate-200 rounded-3xl shadow-xs">
            <div className="w-20 h-20 bg-yellow-50 border border-yellow-200 rounded-full flex items-center justify-center text-yellow-600 mb-5 shadow-inner">
              <Heart size={36} />
            </div>
            <h2 className="text-2xl font-black mb-2 text-[#022036]">No saved properties yet</h2>
            <p className="text-slate-500 text-xs max-w-md mb-8 leading-relaxed font-light">
              When you find a property you love, save it here for easy access later.
            </p>
            <Link
              to="/properties"
              className="px-6 py-3.5 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] text-[#022036] font-extrabold rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <span>Browse Properties</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const property = favorite.property;
              if (!property) return null;

              let imgUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=85";
              if (Array.isArray(property.images) && property.images.length > 0) {
                const rawUrl = property.images[0]?.url || property.images[0];
                if (rawUrl) {
                  imgUrl = rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                }
              } else if (property.image) {
                imgUrl = property.image.startsWith('http') ? property.image : `http://localhost:5000${property.image.startsWith('/') ? '' : '/'}${property.image}`;
              } else if (property.imageUrl) {
                imgUrl = property.imageUrl.startsWith('http') ? property.imageUrl : `http://localhost:5000${property.imageUrl.startsWith('/') ? '' : '/'}${property.imageUrl}`;
              }

              return (
                <article
                  key={favorite.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-yellow-400 transition-all duration-300 flex flex-col group shadow-xs hover:shadow-md"
                >
                  {/* Image Container */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imgUrl}
                      alt={property.titleEn || property.title || "Property"}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60"></div>

                    {/* Favorite Toggle Overlay Button */}
                    <div className="absolute top-3 right-3 z-10">
                      <FavoriteButton
                        active
                        size="small"
                        onClick={() => handleRemove(property.id)}
                      />
                    </div>

                    {/* Property Status Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/70 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                      {property.status === "APPROVED" ? "Available" : property.status}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 text-xs text-yellow-600 font-semibold mb-2">
                      <MapPin size={14} />
                      <span>{property.location?.city || property.location || "Addis Ababa"}</span>
                    </div>

                    <h2 className="text-lg font-black text-[#022036] mb-2 line-clamp-1 group-hover:text-yellow-600 transition-colors">
                      {property.titleEn || property.title || "Untitled Property"}
                    </h2>

                    <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed font-light">
                      {property.descriptionEn || property.description || "No description available."}
                    </p>

                    {/* Features Info */}
                    <div className="flex items-center gap-4 py-3 border-y border-slate-100 mb-5 text-xs text-slate-600 font-mono">
                      <div className="flex items-center gap-1.5">
                        <BedDouble size={16} className="text-slate-400" />
                        <span>{property.rooms || 2} Rooms</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Sofa size={16} className="text-slate-400" />
                        <span>{property.furnished ? "Furnished" : "Unfurnished"}</span>
                      </div>
                    </div>

                    {/* Footer price & link */}
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <strong className="text-lg font-black text-slate-950 font-mono">
                          {Number(property.price || 500).toLocaleString()}
                        </strong>
                        <span className="text-xs text-slate-400 ml-1">ETB / mo</span>
                      </div>

                      <Link
                        to={`/properties/${property.id}`}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-yellow-500 hover:text-[#022036] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <span>Details</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}