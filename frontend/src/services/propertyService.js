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