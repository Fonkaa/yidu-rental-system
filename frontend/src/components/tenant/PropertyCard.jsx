import { Link } from "react-router-dom";
import { Heart, MapPin, BedDouble, Armchair } from "lucide-react";
import "./PropertyCard.css";

export default function PropertyCard({
  property,
  isFavorite = false,
  onFavorite,
}) {
  const image =
    property?.images?.[0]?.url ||
    property?.image ||
    "/placeholder-house.jpg";

  const title =
    property?.titleEn ||
    property?.title ||
    "Beautiful Home";

  const price = Number(property?.price || 0);

  const location =
    property?.location?.name ||
    property?.location?.city ||
    property?.location ||
    "Location unavailable";

  return (
    <article className="property-card">
      <div className="property-card-image">
        <img
          src={image}
          alt={title}
          onError={(e) => {
            e.currentTarget.src = "/placeholder-house.jpg";
          }}
        />

        <button
          type="button"
          className={`property-favorite ${
            isFavorite ? "active" : ""
          }`}
          onClick={() => onFavorite?.(property.id)}
          aria-label={
            isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          <Heart
            size={18}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </button>

        <span className="property-status">
          Available
        </span>
      </div>

      <div className="property-card-content">
        <div className="property-card-location">
          <MapPin size={15} />
          <span>{location}</span>
        </div>

        <h3>{title}</h3>

        <div className="property-card-details">
          <span>
            <BedDouble size={16} />
            {property?.rooms || 0} Rooms
          </span>

          <span>
            <Armchair size={16} />
            {property?.furnished ? "Furnished" : "Unfurnished"}
          </span>
        </div>

        <div className="property-card-footer">
          <div className="property-price">
            <strong>
              {price.toLocaleString()} ETB
            </strong>
            <small>/ month</small>
          </div>

          <Link
            to={`/properties/${property.id}`}
            className="property-view-button"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}