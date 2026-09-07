
import api from './api';

// ============================================================
// ADMIN PROPERTY MANAGEMENT
// ============================================================

// Get pending properties
export const getPendingProperties = () =>
  api.get('/admin/properties/pending');

// Approve property
export const approveProperty = (id) =>
  api.patch(`/admin/properties/${id}/approve`);

// Reject property
export const rejectProperty = (id, rejectionReason) =>
  api.patch(`/admin/properties/${id}/reject`, {
    rejectionReason,
  });


// ============================================================
// ADMIN USER MANAGEMENT
// ============================================================

// Get all users
export const getAllUsers = () =>
  api.get('/admin/users');

// Activate / Deactivate user
export const toggleUserActive = (id) =>
  api.patch(`/admin/users/${id}/toggle-active`);

// Delete user
export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

// Change user role
export const updateUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, {
    role,
  });


// ============================================================
// ADMIN SETTINGS
// ============================================================

// Get commission rate
export const getCommissionRate = () =>
  api.get('/admin/settings/commission-rate');

// Update commission rate
export const updateCommissionRate = (ratePercent) =>
  api.patch('/admin/settings/commission-rate', {
    ratePercent,
  });


// ============================================================
// PAYMENTS / FINANCIAL ANALYTICS
// ============================================================

// Get payments summary
export const getPaymentsSummary = () =>
  api.get('/admin/payments-summary');
