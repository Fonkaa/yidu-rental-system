import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Home,
  BedDouble,
  Heart,
  SlidersHorizontal,
  X,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sofa,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  Filter,
  LayoutGrid,
  List,
  TrendingUp,
} from "lucide-react";

import { getProperties } from "../../services/propertyService";
import { favoriteService } from "../../services/favoriteService";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80";

export default function SearchProperty() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [rooms, setRooms] = useState("");
  const [furnished, setFurnished] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const limit = 12;

  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState({});

  const loadFavorites = async () => {
    try {
      const response = await favoriteService.getAll();
      const data = response?.data || response;

      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.favorites)) {
        list = data.favorites;
      }

      const extractedIds = list
        .map((item) => item?.propertyId || item?.property?.id || item?.id)
        .filter(Boolean);

      setFavoriteIds(extractedIds);
    } catch (error) {
      console.error("LOAD FAVORITES ERROR:", error);
    }
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProperties({
        search,
        minPrice,
        maxPrice,
        rooms,
        furnished,
        categoryId,
        locationId,
        sort,
        page,
        limit,
      });

      const propertyList = Array.isArray(response?.properties) ? response.properties : [];

      setProperties(propertyList);
      setTotalProperties(Number(response?.totalProperties || 0));
      setTotalPages(Math.max(Number(response?.totalPages || 1), 1));
    } catch (err) {
      console.error("TENANT SEARCH PROPERTY ERROR:", err);

      if (err.response?.status === 401) {
        setError("Your login session has expired. Please login again.");
      } else {
        setError(err.response?.data?.error || "Failed to load properties.");
      }

      setProperties([]);
      setTotalProperties(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    loadProperties();
  }, [search, minPrice, maxPrice, rooms, furnished, categoryId, locationId, sort, page]);

  const categoryOptions = useMemo(() => {
    const map = new Map();
    properties.forEach((property) => {
      const category = property?.category;
      if (!category?.id) return;
      const label = category.nameEn || category.nameAm || category.name || "Property Category";
      if (!map.has(category.id)) {
        map.set(category.id, { id: category.id, label });
      }
    });
    return Array.from(map.values());
  }, [properties]);

  const locationOptions = useMemo(() => {
    const map = new Map();
    properties.forEach((property) => {
      const location = property?.location;
      if (!location?.id) return;
      const parts = [location.city, location.subCity, location.kebeleOrWoreda, location.region].filter(Boolean);
      const label = parts.length > 0 ? parts.join(", ") : "Location";
      if (!map.has(location.id)) {
        map.set(location.id, { id: location.id, label });
      }
    });
    return Array.from(map.values());
  }, [properties]);

  const toggleFavorite = async (propertyId) => {
    if (!propertyId || favoriteLoading[propertyId]) return;

    try {
      setFavoriteLoading((current) => ({ ...current, [propertyId]: true }));
      const alreadyFavorite = favoriteIds.includes(propertyId);

      if (alreadyFavorite) {
        await favoriteService.remove(propertyId);
        setFavoriteIds((current) => current.filter((id) => id !== propertyId));
      } else {
        await favoriteService.add(propertyId);
        setFavoriteIds((current) => [...current, propertyId]);
      }
    } catch (error) {
      console.error("TOGGLE FAVORITE ERROR DETAILS:", error.response || error);
      window.alert(error.response?.data?.error || "Unable to update favorite.");
    } finally {
      setFavoriteLoading((current) => ({ ...current, [propertyId]: false }));
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setLocationId("");
    setRooms("");
    setFurnished("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  };

  const formatPrice = (price) => (price === undefined || price === null ? "N/A" : Number(price).toLocaleString("en-US"));
  const getTitle = (property) => property?.titleEn || property?.titleAm || "Rental Property";
  const getDescription = (property) => {
    const desc = property?.descriptionEn || property?.descriptionAm || "Beautiful rental property.";
    return desc.length > 120 ? `${desc.substring(0, 120)}...` : desc;
  };
  const getLocation = (property) => {
    const location = property?.location;
    if (!location) return "Location not available";
    const parts = [location.city, location.subCity, location.kebeleOrWoreda].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : location.region || "Location not available";
  };
  const getCategory = (property) => property?.category?.nameEn || property?.category?.nameAm || property?.category?.name || "Property";
  const getImage = (property) => {
    const images = property?.images;
    if (Array.isArray(images) && images.length > 0) {
      const imgUrl = typeof images[0] === "string" ? images[0] : images[0]?.url;
      if (imgUrl) {
        if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return imgUrl;
        return `http://localhost:5000${imgUrl}`;
      }
    }
    return FALLBACK_IMAGE;
  };

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-amber-50/20">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#022036] text-[#FFC107] flex items-center justify-center shadow-md border-2 border-[#FFC107]/20">
            <Building2 size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#022036] tracking-tight">
              Search Properties
            </h1>
            <p className="text-xs text-[#022036]/50 font-medium">
              Find your perfect home from approved rental properties
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-[#022036]/40 uppercase tracking-wider">
            {totalProperties} Properties
          </span>
          <span className="w-px h-4 bg-black/10" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-black text-emerald-700">
            <TrendingUp size={12} />
            Active Listings
          </span>
        </div>
      </div>

      {/* =====================================================
          SEARCH BAR
      ===================================================== */}

      <div className="bg-white border-2 border-black/20 rounded-2xl p-2 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-black/5 border-2 border-black/10 rounded-xl">
            <Search size={18} className="text-[#FFC107]" />
            <input
              type="text"
              placeholder="Search house, apartment, location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent border-none text-[#022036] placeholder-[#022036]/40 text-xs focus:outline-none font-medium"
            />
            {search && (
              <button
                type="button"
                className="text-[#022036]/40 hover:text-[#022036] cursor-pointer p-1"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#FFC107]/10 hover:bg-[#FFC107] border-2 border-[#FFC107]/30 hover:border-[#FFC107] rounded-xl text-xs font-black text-[#022036] transition-all"
            onClick={() => setShowFilters(true)}
          >
            <Filter size={16} />
            Filters
          </button>

          <button
            type="button"
            className="px-6 py-2.5 bg-[#FFC107] hover:bg-yellow-400 text-[#022036] font-black text-xs rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-[#e5ac00] flex items-center justify-center gap-2"
            onClick={() => {
              setPage(1);
              loadProperties();
            }}
          >
            <Search size={16} />
            Search
          </button>
        </div>
      </div>

      {/* =====================================================
          CONTENT LAYOUT
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* =====================================================
            FILTER SIDEBAR
        ===================================================== */}

        <aside
          className={`
            fixed lg:static top-0 left-0 h-full lg:h-auto w-80 lg:w-auto 
            bg-white lg:bg-white border-r-2 lg:border-2 border-black/10 
            p-6 lg:p-5 rounded-r-3xl lg:rounded-2xl 
            z-50 transition-transform duration-300 
            flex flex-col gap-4 overflow-y-auto 
            shadow-2xl lg:shadow-sm
            ${showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Filter Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-black/10">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-black text-[#FFC107]">FILTER</span>
              <h2 className="text-sm font-black text-[#022036]">Search Filters</h2>
            </div>
            <button
              type="button"
              className="lg:hidden p-2 text-[#022036]/60 hover:text-[#022036] bg-black/5 rounded-xl cursor-pointer"
              onClick={() => setShowFilters(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#022036]/70 uppercase tracking-wider">Category</label>
            <div className="relative">
              <Home size={15} className="absolute left-3.5 top-3 text-[#FFC107]" />
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-8 py-2.5 bg-black/5 border-2 border-black/10 rounded-xl text-[#022036] text-xs font-semibold focus:outline-none focus:border-[#FFC107] cursor-pointer appearance-none"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-[#022036]/40 pointer-events-none" />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#022036]/70 uppercase tracking-wider">Location</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-3 text-[#FFC107]" />
              <select
                value={locationId}
                onChange={(e) => {
                  setLocationId(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-8 py-2.5 bg-black/5 border-2 border-black/10 rounded-xl text-[#022036] text-xs font-semibold focus:outline-none focus:border-[#FFC107] cursor-pointer appearance-none"
              >
                <option value="">All Locations</option>
                {locationOptions.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-[#022036]/40 pointer-events-none" />
            </div>
          </div>

          {/* Rooms */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#022036]/70 uppercase tracking-wider">Rooms</label>
            <div className="relative">
              <BedDouble size={15} className="absolute left-3.5 top-3 text-[#FFC107]" />
              <select
                value={rooms}
                onChange={(e) => {
                  setRooms(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-8 py-2.5 bg-black/5 border-2 border-black/10 rounded-xl text-[#022036] text-xs font-semibold focus:outline-none focus:border-[#FFC107] cursor-pointer appearance-none"
              >
                <option value="">Any Rooms</option>
                <option value="1">1+ Room</option>
                <option value="2">2+ Rooms</option>
                <option value="3">3+ Rooms</option>
                <option value="4">4+ Rooms</option>
                <option value="5">5+ Rooms</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-[#022036]/40 pointer-events-none" />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#022036]/70 uppercase tracking-wider">Price (Birr)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 bg-black/5 border-2 border-black/10 rounded-xl text-[#022036] placeholder-[#022036]/40 text-xs font-mono focus:outline-none focus:border-[#FFC107]"
              />
              <span className="text-[#022036]/40 font-black">—</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 bg-black/5 border-2 border-black/10 rounded-xl text-[#022036] placeholder-[#022036]/40 text-xs font-mono focus:outline-none focus:border-[#FFC107]"
              />
            </div>
          </div>

          {/* Furnished */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#022036]/70 uppercase tracking-wider">Furnished</label>
            <div className="relative">
              <Sofa size={15} className="absolute left-3.5 top-3 text-[#FFC107]" />
              <select
                value={furnished}
                onChange={(e) => {
                  setFurnished(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-8 py-2.5 bg-black/5 border-2 border-black/10 rounded-xl text-[#022036] text-xs font-semibold focus:outline-none focus:border-[#FFC107] cursor-pointer appearance-none"
              >
                <option value="">Any</option>
                <option value="true">Furnished</option>
                <option value="false">Unfurnished</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-[#022036]/40 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t-2 border-black/10 mt-2">
            <button
              type="button"
              className="flex-1 py-2.5 px-3 bg-black/5 hover:bg-black/10 border-2 border-black/10 text-[#022036] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              onClick={clearFilters}
            >
              <RefreshCw size={14} />
              Reset
            </button>
            <button
              type="button"
              className="flex-1 py-2.5 px-3 bg-[#FFC107] hover:bg-yellow-400 text-[#022036] rounded-xl text-xs font-black transition-all shadow-sm uppercase tracking-wider border-2 border-[#e5ac00]"
              onClick={() => setShowFilters(false)}
            >
              Apply
            </button>
          </div>
        </aside>

        {/* =====================================================
            RESULTS AREA
        ===================================================== */}

        <main className="lg:col-span-3 space-y-5">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border-2 border-black/10 p-4 rounded-2xl shadow-sm">
            <div>
              <h2 className="text-sm font-black text-[#022036] uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid size={16} className="text-[#FFC107]" />
                Available Properties
              </h2>
              <p className="text-[10px] text-[#022036]/50 mt-0.5">
                <strong className="text-[#FFC107] font-bold">{totalProperties}</strong> properties found
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] text-[#022036]/50 font-black uppercase tracking-wider">Sort:</label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="pl-3 pr-8 py-2 bg-black/5 border-2 border-black/10 rounded-xl text-[#022036] text-xs font-semibold focus:outline-none focus:border-[#FFC107] cursor-pointer appearance-none"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="oldest">Oldest</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-[#022036]/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white border-2 border-black/10 rounded-2xl">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#FFC107]/20 absolute animate-ping" />
                <div className="w-16 h-16 rounded-2xl bg-[#022036] text-[#FFC107] flex items-center justify-center shadow-lg relative z-10">
                  <Loader2 size={28} className="animate-spin" />
                </div>
              </div>
              <h3 className="text-sm font-black text-[#022036]">Loading properties...</h3>
              <p className="text-xs text-[#022036]/40">Finding available homes for you.</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-rose-50 border-2 border-rose-200 rounded-2xl">
              <div className="w-16 h-16 bg-rose-100 border-2 border-rose-200 rounded-full flex items-center justify-center text-rose-700 mb-4">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-base font-black text-[#022036] mb-1">Unable to load properties</h3>
              <p className="text-rose-700 text-xs max-w-md mb-6 font-semibold">{error}</p>
              <button
                type="button"
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-[#022036] rounded-xl text-xs font-black transition-all border-2 border-black/20 hover:border-black flex items-center gap-2"
                onClick={loadProperties}
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && properties.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white border-2 border-black/10 rounded-2xl">
              <div className="w-20 h-20 rounded-2xl bg-[#FFC107]/10 border-2 border-[#FFC107]/30 flex items-center justify-center mb-4">
                <Home size={32} className="text-[#FFC107]" />
              </div>
              <h3 className="text-lg font-black text-[#022036] mb-1">No properties found</h3>
              <p className="text-xs text-[#022036]/40 max-w-xs mb-6 font-light">
                Try changing your search keywords or active filter options.
              </p>
              <button
                type="button"
                className="px-6 py-3 bg-[#FFC107] hover:bg-yellow-400 text-[#022036] font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all border-2 border-[#e5ac00]"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Property Grid */}
          {!loading && !error && properties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {properties.map((property) => {
                const favorite = favoriteIds.includes(property.id);
                const favoriteIsLoading = Boolean(favoriteLoading[property.id]);

                return (
                  <article
                    key={property.id}
                    className="bg-white border-2 border-black/10 rounded-2xl overflow-hidden group hover:border-black transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={getImage(property)}
                        alt={getTitle(property)}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-[8px] font-black tracking-wider uppercase text-white border border-emerald-400 shadow-md">
                        Approved
                      </span>

                      <button
                        type="button"
                        disabled={favoriteIsLoading}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md ${
                          favorite 
                            ? "bg-rose-500 text-white border-2 border-rose-400" 
                            : "bg-black/50 text-white/80 hover:text-[#FFC107] border-2 border-white/20 hover:border-[#FFC107]"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleFavorite(property.id);
                        }}
                      >
                        {favoriteIsLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Heart size={14} fill={favorite ? "currentColor" : "none"} />
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="text-[8px] uppercase font-black tracking-widest text-[#FFC107] mb-0.5">
                          {getCategory(property)}
                        </div>
                        <h3 className="font-black text-[#022036] text-sm mb-0.5 truncate">{getTitle(property)}</h3>
                        <p className="text-[10px] text-[#022036]/50 line-clamp-2 mb-2 leading-relaxed font-light">
                          {getDescription(property)}
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] text-[#022036]/60 mb-3 font-medium">
                          <MapPin size={12} className="text-[#FFC107]" />
                          <span className="truncate">{getLocation(property)}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] text-[#022036]/60 py-2 border-t-2 border-b-2 border-black/10 mb-3 font-mono">
                          <span className="flex items-center gap-1">
                            <BedDouble size={12} className="text-[#022036]/40" />
                            {property.rooms || 0} Rooms
                          </span>
                          <span className="font-semibold">
                            {property.furnished ? "Furnished" : "Unfurnished"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <strong className="text-base font-black text-[#022036] font-mono">
                              {formatPrice(property.price)}
                            </strong>
                            <span className="text-[8px] text-[#022036]/40 block font-semibold">Birr / month</span>
                          </div>

                          <Link
                            to={`/properties/${property.id}`}
                            className="px-3.5 py-1.5 bg-[#022036] hover:bg-black text-[#FFC107] hover:text-white rounded-xl text-[9px] font-black transition-all shadow-sm border-2 border-[#022036] hover:border-black"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
                className="p-2.5 rounded-xl bg-white border-2 border-black/10 text-[#022036]/60 hover:text-[#022036] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:border-black"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                .map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      pageNumber === page
                        ? "bg-[#FFC107] text-[#022036] font-black border-2 border-[#e5ac00]"
                        : "bg-white border-2 border-black/10 text-[#022036]/60 hover:text-[#022036] hover:border-black"
                    }`}
                    onClick={() => changePage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => changePage(page + 1)}
                className="p-2.5 rounded-xl bg-white border-2 border-black/10 text-[#022036]/60 hover:text-[#022036] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:border-black"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </main>
      </div>

      {/* =====================================================
          QUICK STATS
      ===================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFC107]/10 text-[#FFC107] flex items-center justify-center">
            <Home size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Total Properties</p>
            <p className="text-[10px] font-black text-[#022036]">{totalProperties}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Active Listings</p>
            <p className="text-[10px] font-black text-emerald-600">{properties.length}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <Heart size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Favorites</p>
            <p className="text-[10px] font-black text-[#022036]">{favoriteIds.length}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <TrendingUp size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Avg Price</p>
            <p className="text-[10px] font-black text-[#022036]">
              {properties.length > 0 
                ? `${formatPrice(properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length)}` 
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE FILTER OVERLAY
      ===================================================== */}

      {showFilters && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

    </div>
  );
}