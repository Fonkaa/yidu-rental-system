import { useState, useEffect, useCallback } from "react";
import api from "../services/api"; // Adjust path to your axios/api instance

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/favorites");
      const data = response.data?.favorites || response.data || [];
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH FAVORITES ERROR:", err);
      setError(err.response?.data?.error || "Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (propertyId) => {
    try {
      // Check if property is already favorited locally
      const existing = favorites.find(
        (fav) => fav.propertyId === propertyId || fav.property?.id === propertyId
      );

      if (existing) {
        // Remove favorite
        await api.delete(`/favorites/${propertyId}`);
        setFavorites((prev) =>
          prev.filter(
            (fav) => fav.propertyId !== propertyId && fav.property?.id !== propertyId
          )
        );
      } else {
        // Add favorite
        const response = await api.post("/favorites", { propertyId });
        const newFav = response.data?.favorite || response.data;
        if (newFav) {
          setFavorites((prev) => [newFav, ...prev]);
        } else {
          await fetchFavorites(); // Fallback sync
        }
      }
    } catch (err) {
      console.error("TOGGLE FAVORITE ERROR:", err);
      alert(err.response?.data?.error || "Failed to update favorite status.");
    }
  };

  const isFavorited = (propertyId) => {
    return favorites.some(
      (fav) => fav.propertyId === propertyId || fav.property?.id === propertyId
    );
  };

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    isFavorited,
    refetch: fetchFavorites,
  };
}