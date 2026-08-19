import api from './api';

export const getCategories = () => api.get('/lookup/categories');
export const getLocations = () => api.get('/lookup/locations');