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
} from "lucide-react";

import { getProperties } from "../../services/propertyService";
import { favoriteService } from "../../services/favoriteService";

import "./SearchProperty.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80";

export default function SearchProperty() {
  // ======================================================
  // PROPERTIES
  // ======================================================

  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ======================================================
  // SEARCH
  // ======================================================

  const [search, setSearch] = useState("");

  const [categoryId, setCategoryId] = useState("");

  const [locationId, setLocationId] = useState("");

  const [rooms, setRooms] = useState("");

  const [furnished, setFurnished] = useState("");

  const [minPrice, setMinPrice] = useState("");

  const [maxPrice, setMaxPrice] = useState("");

  const [sort, setSort] = useState("newest");

  // ======================================================
  // PAGINATION
  // ======================================================

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalProperties, setTotalProperties] = useState(0);

  const limit = 12;

  // ======================================================
  // MOBILE FILTER
  // ======================================================

  const [showFilters, setShowFilters] = useState(false);

  // ======================================================
  // FAVORITES
  // ======================================================

  const [favoriteIds, setFavoriteIds] = useState([]);

  const [favoriteLoading, setFavoriteLoading] = useState({});

  // ======================================================
  // LOAD FAVORITES FROM DATABASE
  // ======================================================

  const loadFavorites = async () => {
    try {
      const response = await favoriteService.getAll();

      const data = response?.data;

      if (Array.isArray(data)) {
        setFavoriteIds(
          data
            .map((item) => item?.propertyId)
            .filter(Boolean)
        );

        return;
      }

      if (Array.isArray(data?.favorites)) {
        setFavoriteIds(
          data.favorites
            .map((item) => item?.propertyId)
            .filter(Boolean)
        );

        return;
      }

      setFavoriteIds([]);
    } catch (error) {
      console.error("LOAD FAVORITES ERROR:", error);
    }
  };

  // ======================================================
  // LOAD PROPERTIES
  // ======================================================

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

      console.log(
        "TENANT SEARCH PROPERTY RESPONSE:",
        response
      );

      const propertyList = Array.isArray(
        response?.properties
      )
        ? response.properties
        : [];

      setProperties(propertyList);

      setTotalProperties(
        Number(response?.totalProperties || 0)
      );

      setTotalPages(
        Math.max(
          Number(response?.totalPages || 1),
          1
        )
      );
    } catch (err) {
      console.error(
        "TENANT SEARCH PROPERTY ERROR:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.error ||
            "Failed to load properties."
        );
      }

      setProperties([]);
      setTotalProperties(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadFavorites();
  }, []);

  // ======================================================
  // SEARCH / FILTER LOAD
  // ======================================================

  useEffect(() => {
    loadProperties();
  }, [
    search,
    minPrice,
    maxPrice,
    rooms,
    furnished,
    categoryId,
    locationId,
    sort,
    page,
  ]);

  // ======================================================
  // CATEGORY OPTIONS
  // Existing Property API already includes category.
  // We build options from returned database records.
  // ======================================================

  const categoryOptions = useMemo(() => {
    const map = new Map();

    properties.forEach((property) => {
      const category = property?.category;

      if (!category?.id) {
        return;
      }

      const label =
        category.nameEn ||
        category.nameAm ||
        category.name ||
        "Property Category";

      if (!map.has(category.id)) {
        map.set(category.id, {
          id: category.id,
          label,
        });
      }
    });

    return Array.from(map.values());
  }, [properties]);

  // ======================================================
  // LOCATION OPTIONS
  // Existing Property API already includes location.
  // ======================================================

  const locationOptions = useMemo(() => {
    const map = new Map();

    properties.forEach((property) => {
      const location = property?.location;

      if (!location?.id) {
        return;
      }

      const parts = [
        location.city,
        location.subCity,
        location.kebeleOrWoreda,
        location.region,
      ].filter(Boolean);

      const label =
        parts.length > 0
          ? parts.join(", ")
          : "Location";

      if (!map.has(location.id)) {
        map.set(location.id, {
          id: location.id,
          label,
        });
      }
    });

    return Array.from(map.values());
  }, [properties]);

  // ======================================================
  // TOGGLE FAVORITE
  // DATABASE VERSION
  // ======================================================

  const toggleFavorite = async (propertyId) => {
    if (!propertyId) {
      return;
    }

    if (favoriteLoading[propertyId]) {
      return;
    }

    try {
      setFavoriteLoading((current) => ({
        ...current,
        [propertyId]: true,
      }));

      const alreadyFavorite =
        favoriteIds.includes(propertyId);

      if (alreadyFavorite) {
        await favoriteService.remove(propertyId);

        setFavoriteIds((current) =>
          current.filter(
            (id) => id !== propertyId
          )
        );
      } else {
        await favoriteService.add(propertyId);

        setFavoriteIds((current) => [
          ...current,
          propertyId,
        ]);
      }
    } catch (error) {
      console.error(
        "TOGGLE FAVORITE ERROR:",
        error
      );

      const message =
        error.response?.data?.error ||
        "Unable to update favorite.";

      window.alert(message);
    } finally {
      setFavoriteLoading((current) => ({
        ...current,
        [propertyId]: false,
      }));
    }
  };

  // ======================================================
  // CLEAR FILTERS
  // ======================================================

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

  // ======================================================
  // PRICE FORMAT
  // ======================================================

  const formatPrice = (price) => {
    if (
      price === undefined ||
      price === null
    ) {
      return "N/A";
    }

    return Number(price).toLocaleString("en-US");
  };

  // ======================================================
  // TITLE
  // ======================================================

  const getTitle = (property) => {
    return (
      property?.titleEn ||
      property?.titleAm ||
      "Rental Property"
    );
  };

  // ======================================================
  // DESCRIPTION
  // ======================================================

  const getDescription = (property) => {
    const description =
      property?.descriptionEn ||
      property?.descriptionAm ||
      "Beautiful rental property.";

    return description.length > 120
      ? `${description.substring(0, 120)}...`
      : description;
  };

  // ======================================================
  // LOCATION
  // ======================================================

  const getLocation = (property) => {
    const location = property?.location;

    if (!location) {
      return "Location not available";
    }

    const parts = [
      location.city,
      location.subCity,
      location.kebeleOrWoreda,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return (
      location.region ||
      "Location not available"
    );
  };

  // ======================================================
  // CATEGORY
  // ======================================================

  const getCategory = (property) => {
    const category = property?.category;

    if (!category) {
      return "Property";
    }

    return (
      category.nameEn ||
      category.nameAm ||
      category.name ||
      "Property"
    );
  };

  // ======================================================
  // IMAGE
  // ======================================================

  const getImage = (property) => {
    const images = property?.images;

    if (
      Array.isArray(images) &&
      images.length > 0
    ) {
      const firstImage = images[0];

      const imageUrl =
        typeof firstImage === "string"
          ? firstImage
          : firstImage?.url;

      if (imageUrl) {
        if (
          imageUrl.startsWith("http://") ||
          imageUrl.startsWith("https://")
        ) {
          return imageUrl;
        }

        return `http://localhost:5000${imageUrl}`;
      }
    }

    return FALLBACK_IMAGE;
  };

  // ======================================================
  // PAGE CHANGE
  // ======================================================

  const changePage = (newPage) => {
    if (
      newPage < 1 ||
      newPage > totalPages
    ) {
      return;
    }

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="search-property-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="search-page-header">

        <div>
          <div className="header-breadcrumb">
            Tenant Dashboard
            <span>/</span>
            Search Properties
          </div>

          <h1>
            Find Your Perfect Home
          </h1>

          <p>
            Search approved rental properties
            and find the home that is right
            for you.
          </p>
        </div>

        <button
          type="button"
          className="mobile-filter-button"
          onClick={() =>
            setShowFilters(true)
          }
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>

      </div>

      {/* ==================================================
          MAIN SEARCH BAR
      ================================================== */}

      <div className="main-search-box">

        <div className="search-input-wrapper">

          <Search size={20} />

          <input
            type="text"
            placeholder="Search house, apartment, location..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              <X size={16} />
            </button>
          )}

        </div>

        <button
          type="button"
          className="search-button"
          onClick={() => {
            setPage(1);
            loadProperties();
          }}
        >
          <Search size={18} />
          Search
        </button>

      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="search-content">

        {/* ==================================================
            FILTER SIDEBAR
        ================================================== */}

        <aside
          className={`property-filter-sidebar ${
            showFilters
              ? "filter-open"
              : ""
          }`}
        >

          <div className="filter-header">

            <div>
              <span className="filter-small-title">
                FILTER
              </span>

              <h2>
                Search Properties
              </h2>
            </div>

            <button
              type="button"
              className="close-filter"
              onClick={() =>
                setShowFilters(false)
              }
            >
              <X size={20} />
            </button>

          </div>

          {/* CATEGORY */}

          <div className="filter-group">

            <label htmlFor="category">
              Property Category
            </label>

            <div className="select-wrapper">

              <Home size={17} />

              <select
                id="category"
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="">
                  All Categories
                </option>

                {categoryOptions.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.label}
                    </option>
                  )
                )}
              </select>

              <ChevronDown size={16} />

            </div>

          </div>

          {/* LOCATION */}

          <div className="filter-group">

            <label htmlFor="location">
              Location
            </label>

            <div className="select-wrapper">

              <MapPin size={17} />

              <select
                id="location"
                value={locationId}
                onChange={(event) => {
                  setLocationId(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="">
                  All Locations
                </option>

                {locationOptions.map(
                  (location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.label}
                    </option>
                  )
                )}
              </select>

              <ChevronDown size={16} />

            </div>

          </div>

          {/* ROOMS */}

          <div className="filter-group">

            <label htmlFor="rooms">
              Rooms
            </label>

            <div className="select-wrapper">

              <BedDouble size={17} />

              <select
                id="rooms"
                value={rooms}
                onChange={(event) => {
                  setRooms(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="">
                  Any Rooms
                </option>

                <option value="1">
                  1+ Room
                </option>

                <option value="2">
                  2+ Rooms
                </option>

                <option value="3">
                  3+ Rooms
                </option>

                <option value="4">
                  4+ Rooms
                </option>

                <option value="5">
                  5+ Rooms
                </option>

              </select>

              <ChevronDown size={16} />

            </div>

          </div>

          {/* PRICE */}

          <div className="filter-group">

            <label>
              Monthly Price
            </label>

            <div className="price-inputs">

              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(event) => {
                  setMinPrice(
                    event.target.value
                  );
                  setPage(1);
                }}
              />

              <span>—</span>

              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(
                    event.target.value
                  );
                  setPage(1);
                }}
              />

            </div>

          </div>

          {/* FURNISHED */}

          <div className="filter-group">

            <label htmlFor="furnished">
              Furnished
            </label>

            <div className="select-wrapper">

              <Sofa size={17} />

              <select
                id="furnished"
                value={furnished}
                onChange={(event) => {
                  setFurnished(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="">
                  Any
                </option>

                <option value="true">
                  Furnished
                </option>

                <option value="false">
                  Unfurnished
                </option>

              </select>

              <ChevronDown size={16} />

            </div>

          </div>

          {/* SORT */}

          <div className="filter-group">

            <label htmlFor="filter-sort">
              Sort Properties
            </label>

            <div className="select-wrapper">

              <select
                id="filter-sort"
                value={sort}
                onChange={(event) => {
                  setSort(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="newest">
                  Newest
                </option>

                <option value="price_asc">
                  Price: Low to High
                </option>

                <option value="price_desc">
                  Price: High to Low
                </option>

                <option value="oldest">
                  Oldest
                </option>

              </select>

              <ChevronDown size={16} />

            </div>

          </div>

          {/* ACTIONS */}

          <div className="filter-actions">

            <button
              type="button"
              className="reset-filter-button"
              onClick={clearFilters}
            >
              <RefreshCw size={16} />
              Reset Filters
            </button>

            <button
              type="button"
              className="apply-filter-button"
              onClick={() =>
                setShowFilters(false)
              }
            >
              Apply Filters
            </button>

          </div>

        </aside>

        {/* ==================================================
            RESULTS
        ================================================== */}

        <main className="property-results">

          <div className="results-toolbar">

            <div>
              <h2>
                Available Properties
              </h2>

              <p>
                <strong>
                  {totalProperties}
                </strong>{" "}
                properties found
              </p>
            </div>

            <div className="sort-wrapper">

              <label htmlFor="result-sort">
                Sort
              </label>

              <div className="sort-select">

                <select
                  id="result-sort"
                  value={sort}
                  onChange={(event) => {
                    setSort(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="newest">
                    Newest
                  </option>

                  <option value="price_asc">
                    Price Low
                  </option>

                  <option value="price_desc">
                    Price High
                  </option>

                  <option value="oldest">
                    Oldest
                  </option>
                </select>

                <ChevronDown size={16} />

              </div>

            </div>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div className="property-state">

              <Loader2
                size={40}
                className="loading-icon"
              />

              <h3>
                Loading properties...
              </h3>

              <p>
                Finding available homes
                for you.
              </p>

            </div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (
            <div className="property-state error-state">

              <div className="state-icon">
                <AlertCircle size={34} />
              </div>

              <h3>
                Unable to load properties
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="retry-button"
                onClick={loadProperties}
              >
                <RefreshCw size={16} />
                Try Again
              </button>

            </div>
          )}

          {/* ==================================================
              EMPTY
          ================================================== */}

          {!loading &&
            !error &&
            properties.length === 0 && (
              <div className="property-state">

                <div className="empty-house-icon">
                  <Home size={40} />
                </div>

                <h3>
                  No properties found
                </h3>

                <p>
                  Try changing your search
                  or filters.
                </p>

                <button
                  type="button"
                  className="retry-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>

              </div>
            )}

          {/* ==================================================
              PROPERTY GRID
          ================================================== */}

          {!loading &&
            !error &&
            properties.length > 0 && (
              <div className="property-card-grid">

                {properties.map(
                  (property) => {
                    const favorite =
                      favoriteIds.includes(
                        property.id
                      );

                    const favoriteIsLoading =
                      Boolean(
                        favoriteLoading[
                          property.id
                        ]
                      );

                    return (
                      <article
                        className="search-property-card"
                        key={property.id}
                      >

                        {/* IMAGE */}

                        <div className="property-image-container">

                          <img
                            src={getImage(property)}
                            alt={getTitle(property)}
                            className="property-image"
                            onError={(event) => {
                              event.currentTarget.src =
                                FALLBACK_IMAGE;
                            }}
                          />

                          <span className="available-badge">
                            APPROVED
                          </span>

                          <button
                            type="button"
                            aria-label={
                              favorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                            disabled={
                              favoriteIsLoading
                            }
                            className={`favorite-button ${
                              favorite
                                ? "favorite-active"
                                : ""
                            }`}
                            onClick={() =>
                              toggleFavorite(
                                property.id
                              )
                            }
                          >
                            {favoriteIsLoading ? (
                              <Loader2
                                size={19}
                                className="loading-icon"
                              />
                            ) : (
                              <Heart
                                size={19}
                                fill={
                                  favorite
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            )}
                          </button>

                        </div>

                        {/* CONTENT */}

                        <div className="property-card-content">

                          <div className="property-type">
                            {getCategory(property)}
                          </div>

                          <h3>
                            {getTitle(property)}
                          </h3>

                          <p className="property-description">
                            {getDescription(property)}
                          </p>

                          <div className="property-location">

                            <MapPin size={16} />

                            <span>
                              {getLocation(property)}
                            </span>

                          </div>

                          <div className="property-features">

                            <span>
                              <BedDouble size={17} />

                              {property.rooms || 0}{" "}
                              Rooms
                            </span>

                            <span>
                              {property.furnished
                                ? "Furnished"
                                : "Unfurnished"}
                            </span>

                          </div>

                          <div className="card-footer">

                            <div className="property-price">

                              <strong>
                                {formatPrice(
                                  property.price
                                )}
                              </strong>

                              <span>
                                / month
                              </span>

                            </div>

                            <Link
                              to={`/properties/${property.id}`}
                              className="view-property-button"
                            >
                              View Details
                            </Link>

                          </div>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}

          {/* ==================================================
              PAGINATION
          ================================================== */}

          {!loading &&
            !error &&
            totalPages > 1 && (
              <div className="pagination">

                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    changePage(page - 1)
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) => index + 1
                )
                  .slice(
                    Math.max(
                      0,
                      page - 3
                    ),
                    Math.min(
                      totalPages,
                      page + 2
                    )
                  )
                  .map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      className={
                        pageNumber === page
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        changePage(
                          pageNumber
                        )
                      }
                    >
                      {pageNumber}
                    </button>
                  ))}

                <button
                  type="button"
                  disabled={
                    page === totalPages
                  }
                  onClick={() =>
                    changePage(page + 1)
                  }
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>

              </div>
            )}

        </main>
      </div>

      {/* ==================================================
          MOBILE FILTER OVERLAY
      ================================================== */}

      {showFilters && (
        <div
          className="filter-overlay"
          onClick={() =>
            setShowFilters(false)
          }
        />
      )}

    </div>
  );
}