
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../../services/propertyService";
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer";
import Loader from "../../components/common/Loader";
import "./Search.css";

export default function Search() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);
      setError("");

      const data = await getProperties();

      const list =
        Array.isArray(data)
          ? data
          : data?.properties || data?.data || [];

      setProperties(list);
    } catch (err) {
      console.error("PROPERTY LOAD ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Unable to load properties."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredProperties = properties.filter((property) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      property.title?.toLowerCase().includes(searchText) ||
      property.location?.toLowerCase().includes(searchText) ||
      property.description?.toLowerCase().includes(searchText);

    const matchesBedrooms =
      !bedrooms ||
      Number(property.bedrooms) >= Number(bedrooms);

    const matchesPrice =
      !maxPrice ||
      Number(property.price) <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesBedrooms &&
      matchesPrice
    );
  });

  return (
    <div className="search-page">

      <Sidebar />

      <main className="search-main">

        {/* Header */}
        <section className="search-header">

          <div>
            <span className="search-eyebrow">
              FIND YOUR NEXT HOME
            </span>

            <h1>Find a home you'll love.</h1>

            <p>
              Browse verified properties and find the
              right place for your next chapter.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="dashboard-link"
          >
            ← Dashboard
          </Link>

        </section>

        {/* Search panel */}
        <section className="search-panel">

          <div className="search-input-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by location or property..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          >
            <option value="">Any bedrooms</option>
            <option value="1">1+ bedroom</option>
            <option value="2">2+ bedrooms</option>
            <option value="3">3+ bedrooms</option>
            <option value="4">4+ bedrooms</option>
          </select>

          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          >
            <option value="">Any price</option>
            <option value="5000">Up to 5,000 ETB</option>
            <option value="10000">Up to 10,000 ETB</option>
            <option value="20000">Up to 20,000 ETB</option>
            <option value="30000">Up to 30,000 ETB</option>
          </select>

          <button
            className="clear-button"
            onClick={() => {
              setSearch("");
              setBedrooms("");
              setMaxPrice("");
            }}
          >
            Clear
          </button>

        </section>

        {/* Results heading */}
        <section className="results-heading">

          <div>
            <h2>Available properties</h2>

            <p>
              {filteredProperties.length} properties found
            </p>
          </div>

        </section>

        {/* Error */}
        {error && (
          <div className="search-error">
            <strong>Unable to load properties</strong>
            <span>{error}</span>

            <button onClick={loadProperties}>
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="search-loader">
            <Loader />
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredProperties.length === 0 && (
            <div className="empty-properties">

              <div className="empty-icon">
                ⌂
              </div>

              <h3>No properties found</h3>

              <p>
                Try changing your search or filters.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setBedrooms("");
                  setMaxPrice("");
                }}
              >
                Reset filters
              </button>

            </div>
          )}

        {/* Property cards */}
        {!loading &&
          !error &&
          filteredProperties.length > 0 && (
            <section className="property-grid">

              {filteredProperties.map((property) => (
                <article
                  className="property-card"
                  key={property.id}
                >

                  {/* Image */}
                  <div className="property-image">

                    {property.imageUrl ||
                    property.image ? (
                      <img
                        src={
                          property.imageUrl ||
                          property.image
                        }
                        alt={property.title}
                      />
                    ) : (
                      <div className="property-placeholder">
                        <span>⌂</span>
                      </div>
                    )}

                    <button
                      className="favorite-button"
                      type="button"
                      aria-label="Add to favorites"
                    >
                      ♡
                    </button>

                    <span className="property-status">
                      {property.status || "AVAILABLE"}
                    </span>

                  </div>

                  {/* Content */}
                  <div className="property-content">

                    <div className="property-price">
                      {Number(property.price || 0).toLocaleString()}{" "}
                      <span>ETB / month</span>
                    </div>

                    <h3>
                      {property.title || "Beautiful Home"}
                    </h3>

                    <p className="property-location">
                      📍 {property.location || "Location unavailable"}
                    </p>

                    <p className="property-description">
                      {property.description
                        ? property.description.slice(0, 95)
                        : "Comfortable property ready for its next tenant."}
                    </p>

                    <div className="property-meta">

                      <span>
                        🛏 {property.bedrooms || 0} Beds
                      </span>

                      <span>
                        🏠 Available
                      </span>

                    </div>

                    <Link
                      to={`/properties/${property.id}`}
                      className="details-button"
                    >
                      View property
                      <span>→</span>
                    </Link>

                  </div>

                </article>
              ))}

            </section>
          )}

        <Footer />

      </main>

    </div>
  );
}

