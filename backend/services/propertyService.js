import api from './api';

// ==========================================
// PROPERTY SERVICES
// ==========================================

export async function getProperties(params) {
  const response = await api.get('/properties', { params });
  return response.data;
}

export async function getPropertyById(id) {
  const response = await api.get(`/properties/${id}`);
  return response.data;
}

export async function createProperty(propertyData) {
  const response = await api.post('/properties', propertyData);
  return response.data;
}

export async function updateProperty(id, propertyData) {
  const response = await api.patch(`/properties/${id}`, propertyData);
  return response.data;
}

export async function uploadPropertyImages(id, formData) {
  const response = await api.post(`/properties/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}