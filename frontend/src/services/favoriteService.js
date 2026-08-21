import api from "./api";

export const favoriteService = {
  getAll: () => api.get("/favorites"),

  add: (propertyId) =>
    api.post("/favorites", {
      propertyId,
    }),

  remove: (propertyId) =>
    api.delete(`/favorites/${propertyId}`),
};