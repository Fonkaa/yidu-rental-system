<<<<<<< HEAD
import api from "./api";

/**
 * =========================================================
 * GET / SEARCH PROPERTIES
 * =========================================================
 *
 * Backend supports:
 * search
 * minPrice
 * maxPrice
 * rooms
 * furnished
 * categoryId
 * locationId
 * sort
 * page
 * limit
 */
export async function getProperties(filters = {}) {
  const params = {};

  if (filters.search) {
    params.search = filters.search;
  }

  if (
    filters.minPrice !== undefined &&
    filters.minPrice !== ""
  ) {
    params.minPrice = filters.minPrice;
  }

  if (
    filters.maxPrice !== undefined &&
    filters.maxPrice !== ""
  ) {
    params.maxPrice = filters.maxPrice;
  }

  if (
    filters.rooms !== undefined &&
    filters.rooms !== ""
  ) {
    params.rooms = filters.rooms;
  }

  if (filters.furnished !== "") {
    params.furnished = filters.furnished;
  }

  if (filters.categoryId) {
    params.categoryId = filters.categoryId;
  }

  if (filters.locationId) {
    params.locationId = filters.locationId;
  }

  params.sort = filters.sort || "newest";
  params.page = filters.page || 1;
  params.limit = filters.limit || 12;

  const response = await api.get("/properties", {
    params,
  });

  return response.data;
}

/**
 * =========================================================
 * GET ONE PROPERTY
 * =========================================================
 */
export async function getPropertyById(propertyId) {
  const response = await api.get(
    `/properties/${propertyId}`
  );

  return response.data;
}
=======
import api from './api';

export const createProperty = (data) => api.post('/properties', data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const uploadPropertyImages = (id, formData) =>
  api.post(`/properties/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updatePropertyStatus = (id, status) =>
  api.patch(`/properties/${id}/status`, { status });
export const renewProperty = (id) => api.patch(`/properties/${id}/renew`);
export const getMyProperties = () => api.get('/properties/mine');
>>>>>>> origin/feature/developer-a-auth
