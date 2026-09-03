import api from './api';

export const getPendingProperties = () => api.get('/admin/properties/pending');
export const approveProperty = (id) => api.patch(`/admin/properties/${id}/approve`);
export const rejectProperty = (id, rejectionReason) =>
  api.patch(`/admin/properties/${id}/reject`, { rejectionReason });
export const getAllUsers = () => api.get('/admin/users');
export const toggleUserActive = (id) => api.patch(`/admin/users/${id}/toggle-active`);
export const updateUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role });
export const getCommissionRate = () => api.get('/admin/settings/commission-rate');
export const updateCommissionRate = (ratePercent) =>
  api.patch('/admin/settings/commission-rate', {
    ratePercent,
  });


// ============================================================
// PAYMENTS / FINANCIAL ANALYTICS
// ============================================================

export const getPaymentsSummary = () =>
  api.get('/admin/payments-summary');