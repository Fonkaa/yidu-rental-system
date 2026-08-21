import { Heart } from "lucide-react";
import "./FavoriteButton.css";

export default function FavoriteButton({
  active = false,
  loading = false,
  onClick,
  size = "medium",
}) {
  const sizeClass =
    size === "small"
      ? "favorite-button-small"
      : "favorite-button-medium";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`favorite-button ${sizeClass} ${
        active ? "favorite-active" : ""
      }`}
      aria-label={
        active
          ? "Remove from favorites"
          : "Add to favorites"
      }
      title={
        active
          ? "Remove from favorites"
          : "Add to favorites"
      }
    >
      <Heart
        size={size === "small" ? 17 : 20}
        strokeWidth={2}
        fill={active ? "currentColor" : "none"}
      />

      <span>
        {loading
          ? "Saving..."
          : active
          ? "Saved"
          : "Save"}
      </span>
    </button>
  );
}