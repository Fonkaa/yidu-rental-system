import { useFavorites } from "../../hooks/useFavorites";
import FavoriteButton from "../../components/tenant/FavoriteButton";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  BedDouble,
  Sofa,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import "./Favorites.css";
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
      <div className="favorites-page">
        <div className="favorites-loading">
          <LoaderCircle
            size={36}
            className="favorites-spinner"
          />
          <p>Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">

      <div className="favorites-header">
        <div>
          <span className="favorites-eyebrow">
            YOUR COLLECTION
          </span>

          <h1>
            Saved Properties
          </h1>

          <p>
            Keep track of the properties you
            are interested in.
          </p>
        </div>

        <div className="favorites-count">
          <Heart size={20} fill="currentColor" />
          <span>{favorites.length}</span>
          <small>Saved</small>
        </div>
      </div>

      {error && (
        <div className="favorites-error">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <div className="favorites-empty-icon">
            <Heart size={42} />
          </div>

          <h2>
            No saved properties yet
          </h2>

          <p>
            When you find a property you love,
            save it here for easy access later.
          </p>

          <Link
            to="/properties"
            className="favorites-browse-button"
          >
            Browse Properties
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">

          {favorites.map((favorite) => {
            const property = favorite.property;

            if (!property) return null;

            const image =
              property.images?.[0]?.url;

            return (
              <article
                className="favorite-card"
                key={favorite.id}
              >

                <div className="favorite-card-image">

                  {image ? (
                    <img
                      src={image}
                      alt={
                        property.titleEn ||
                        "Property"
                      }
                    />
                  ) : (
                    <div className="favorite-no-image">
                      <span>Property</span>
                    </div>
                  )}

                  <div className="favorite-card-overlay">
                    <FavoriteButton
                      active
                      size="small"
                      onClick={() =>
                        handleRemove(property.id)
                      }
                    />
                  </div>

                  <div className="favorite-status">
                    {property.status ===
                    "APPROVED"
                      ? "Available"
                      : property.status}
                  </div>
                </div>

                <div className="favorite-card-body">

                  <div className="favorite-location">
                    <MapPin size={15} />

                    <span>
                      {property.location?.city ||
                        "Addis Ababa"}
                    </span>
                  </div>

                  <h2>
                    {property.titleEn ||
                      "Untitled Property"}
                  </h2>

                  <p className="favorite-description">
                    {property.descriptionEn ||
                      "No description available."}
                  </p>

                  <div className="favorite-features">

                    <span>
                      <BedDouble size={17} />
                      {property.rooms} Rooms
                    </span>

                    <span>
                      <Sofa size={17} />
                      {property.furnished
                        ? "Furnished"
                        : "Unfurnished"}
                    </span>

                  </div>

                  <div className="favorite-card-footer">

                    <div>
                      <strong>
                        {Number(
                          property.price
                        ).toLocaleString()}{" "}
                        ETB
                      </strong>

                      <small>
                        / month
                      </small>
                    </div>

                    <Link
                      to={`/properties/${property.id}`}
                      className="favorite-details-button"
                    >
                      View Details
                      <ArrowRight size={17} />
                    </Link>

                  </div>

                </div>
              </article>
            );
          })}

        </div>
      )}
    </div>
  );
}