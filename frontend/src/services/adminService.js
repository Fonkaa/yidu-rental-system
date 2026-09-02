import api from './api';

export const getPendingProperties = () => api.get('/admin/properties/pending');
export const approveProperty = (id) => api.patch(`/admin/properties/${id}/approve`);
export const rejectProperty = (id) => api.patch(`/admin/properties/${id}/reject`);
export const getAllUsers = () => api.get('/admin/users');
export const toggleUserActive = (id) => api.patch(`/admin/users/${id}/toggle-active`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`); // <--- Add this line
export const getCommissionRate = () => api.get('/admin/settings/commission-rate');
export const updateCommissionRate = (ratePercent) =>
  api.patch('/admin/settings/commission-rate', { ratePercent });