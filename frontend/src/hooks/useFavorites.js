import { useCallback, useEffect, useState } from "react";
import { favoriteService } from "../services/favoriteService";

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await favoriteService.getAll();

      setFavorites(
        Array.isArray(response.data)
          ? response.data
          : response.data?.favorites || []
      );
    } catch (err) {
      console.error("LOAD FAVORITES ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Failed to load favorites"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (propertyId) => {
      return favorites.some(
        (favorite) =>
          favorite.propertyId === propertyId ||
          favorite.property?.id === propertyId
      );
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (propertyId) => {
      try {
        setError("");

        const alreadyFavorite = favorites.some(
          (favorite) =>
            favorite.propertyId === propertyId ||
            favorite.property?.id === propertyId
        );

        if (alreadyFavorite) {
          await favoriteService.remove(propertyId);

          setFavorites((current) =>
            current.filter(
              (favorite) =>
                favorite.propertyId !== propertyId &&
                favorite.property?.id !== propertyId
            )
          );

          return false;
        }

        const response =
          await favoriteService.add(propertyId);

        const newFavorite = response.data;

        setFavorites((current) => [
          newFavorite,
          ...current,
        ]);

        return true;
      } catch (err) {
        console.error("TOGGLE FAVORITE ERROR:", err);

        setError(
          err.response?.data?.error ||
            "Failed to update favorite"
        );

        throw err;
      }
    },
    [favorites]
  );

  return {
    favorites,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    reloadFavorites: loadFavorites,
  };
}