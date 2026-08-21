import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  MapPin,
  BedDouble,
  Sofa,
  ArrowRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import api from "../../services/api";
import { useFavorites } from "../../hooks/useFavorites";
import FavoriteButton from "../../components/tenant/FavoriteButton";

import "./Properties.css";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search / filter
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [furnished, setFurnished] = useState("");
  const [sort, setSort] = useState("newest");

  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites();

  const [favoriteLoading, setFavoriteLoading] = useState(null);

  // ======================================================
  // LOAD REAL PROPERTIES FROM DEVELOPER A BACKEND
  // ======================================================

  useEffect(() => {
    loadProperties();
  }, [
    search,
    minPrice,
    maxPrice,
    rooms,
    furnished,
    sort,
  ]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (minPrice !== "") {
        params.append("minPrice", minPrice);
      }

      if (maxPrice !== "") {
        params.append("maxPrice", maxPrice);
      }

      if (rooms !== "") {
        params.append("rooms", rooms);
      }

      if (furnished !== "") {
        params.append("furnished", furnished);
      }

      params.append("sort", sort);

      const response = await api.get(
        `/properties?${params.toString()}`
      );

      console.log("REAL PROPERTIES:", response.data);

      const data = response.data;

      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error("LOAD PROPERTIES ERROR:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load properties"
      );

      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FAVORITE
  // ======================================================

  const handleFavorite = async (propertyId) => {
    try {
      setFavoriteLoading(propertyId);

      await toggleFavorite(propertyId);
    } catch (err) {
      console.error("FAVORITE ERROR:", err);
    } finally {
      setFavoriteLoading(null);
    }
  };

  // ======================================================
  // CLEAR FILTERS
  // ======================================================

  const clearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setRooms("");
    setFurnished("");
    setSort("newest");
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="properties-page">
        <div className="properties-container">

          <Link
            to="/dashboard"
            className="properties-back-button"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="properties-header">
            <div>
              <div className="properties-title-row">
                <Home size={30} />
                <h1>Properties</h1>
              </div>

              <p>
                Find an approved property that is
                right for you.
              </p>
            </div>
          </div>

          <div className="property-loading">
            <div className="loading-spinner"></div>
            <p>Loading properties...</p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="properties-page">

      <div className="properties-container">

        {/* ==================================================
            BACK
        ================================================== */}

        <Link
          to="/dashboard"
          className="properties-back-button"
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </Link>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="properties-header">

          <div>
            <div className="properties-title-row">
              <Home size={30} />
              <h1>Properties</h1>
            </div>

            <p>
              Find an approved property that is
              right for you.
            </p>
          </div>

          <div className="property-count">
            <strong>{properties.length}</strong>

            <span>
              {properties.length === 1
                ? "Property"
                : "Properties"}
            </span>
          </div>

        </div>

        {/* ==================================================
            SEARCH + FILTER
        ================================================== */}

        <div className="property-filters">

          <div className="property-search">

            <Search size={19} />

            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="filter-row">

            <div className="filter-item">
              <label>Min Price</label>

              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(e.target.value)
                }
              />
            </div>

            <div className="filter-item">
              <label>Max Price</label>

              <input
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(e.target.value)
                }
              />
            </div>

            <div className="filter-item">
              <label>Rooms</label>

              <select
                value={rooms}
                onChange={(e) =>
                  setRooms(e.target.value)
                }
              >
                <option value="">Any</option>
                <option value="1">1+ Room</option>
                <option value="2">2+ Rooms</option>
                <option value="3">3+ Rooms</option>
                <option value="4">4+ Rooms</option>
                <option value="5">5+ Rooms</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Furnished</label>

              <select
                value={furnished}
                onChange={(e) =>
                  setFurnished(e.target.value)
                }
              >
                <option value="">Any</option>
                <option value="true">
                  Furnished
                </option>
                <option value="false">
                  Unfurnished
                </option>
              </select>
            </div>

            <div className="filter-item">
              <label>Sort</label>

              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value)
                }
              >
                <option value="newest">
                  Newest
                </option>

                <option value="oldest">
                  Oldest
                </option>

                <option value="price_asc">
                  Price: Low → High
                </option>

                <option value="price_desc">
                  Price: High → Low
                </option>
              </select>
            </div>

            <button
              type="button"
              className="clear-filter-button"
              onClick={clearFilters}
            >
              <SlidersHorizontal size={17} />
              Clear
            </button>

          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="property-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!error && properties.length === 0 && (
          <div className="empty-properties">

            <div className="empty-icon">
              <Home size={42} />
            </div>

            <h2>
              No Properties Found
            </h2>

            <p>
              Try changing your search or
              filter options.
            </p>

            <button
              type="button"
              className="empty-back-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>
        )}

        {/* ==================================================
            PROPERTY GRID
        ================================================== */}

        {properties.length > 0 && (
          <div className="property-grid">

            {properties.map((property) => {

              const imageUrl =
                property.images &&
                property.images.length > 0
                  ? property.images[0]?.url ||
                    property.images[0]
                  : null;

              const title =
                property.titleEn ||
                "Untitled Property";

              const description =
                property.descriptionEn ||
                "No description available.";

              const roomsCount =
                property.rooms ?? 0;

              const location =
                property.location?.city ||
                "Addis Ababa";

              const price =
                Number(property.price || 0);

              const active =
                isFavorite(property.id);

              return (
                <div
                  className="property-card"
                  key={property.id}
                >

                  {/* IMAGE */}

                  <div className="property-image">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                      />
                    ) : (
                      <div className="no-image">
                        <Home size={38} />
                        <span>No Image</span>
                      </div>
                    )}

                    <div className="property-status-badge">
                      Available
                    </div>

                    {/* FAVORITE BUTTON */}

                    <div className="property-favorite-button">
                      <FavoriteButton
                        active={active}
                        loading={
                          favoriteLoading ===
                          property.id
                        }
                        onClick={() =>
                          handleFavorite(
                            property.id
                          )
                        }
                        size="small"
                      />
                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="property-content">

                    <h2>{title}</h2>

                    <div className="property-location">
                      <MapPin size={15} />
                      <span>{location}</span>
                    </div>

                    <p>
                      {description.length > 120
                        ? `${description.substring(
                            0,
                            120
                          )}...`
                        : description}
                    </p>

                    {/* DETAILS */}

                    <div className="property-details">

                      <span>
                        <BedDouble size={17} />
                        {roomsCount} Rooms
                      </span>

                      <span>
                        <Sofa size={17} />

                        {property.furnished
                          ? "Furnished"
                          : "Unfurnished"}
                      </span>

                    </div>

                    {/* FOOTER */}

                    <div className="property-footer">

                      <div className="property-price">

                        <strong>
                          {price.toLocaleString()}
                        </strong>

                        <span>
                          ETB / month
                        </span>

                      </div>

                      <Link
                        to={`/properties/${property.id}`}
                        className="view-details"
                      >
                        View Details
                        <ArrowRight size={16} />
                      </Link>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default Properties;