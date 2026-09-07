
import React from "react";
import { Heart } from "lucide-react";

export default function FavoriteButton({
  active = false,
  onClick,
  disabled = false,
  size = 20,
  title,
}) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={
        active
          ? "Remove from favorites"
          : "Add to favorites"
      }
      title={
        title ||
        (active
          ? "Remove from favorites"
          : "Add to favorites")
      }
      className={`
        w-10
        h-10
        min-w-10
        rounded-full
        flex
        items-center
        justify-center
        border
        transition-all
        duration-200
        cursor-pointer

        ${
          active
            ? "bg-rose-50 border-rose-500 text-rose-600"
            : "bg-white border-slate-200 text-slate-500 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500"
        }

        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-105 active:scale-95"
        }

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-rose-400
        focus-visible:ring-offset-2
      `}
    >
      <Heart
        size={size}
        strokeWidth={2}
        className="transition-all duration-200"
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
