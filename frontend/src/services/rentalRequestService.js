import api from './api';

export async function createRentalRequest(requestData) {
  const response = await api.post('/rental-requests', requestData);
  return response.data;
}

export async function getRentalRequestsForUser() {
  const response = await api.get('/rental-requests');
  return response.data;
}

// Alias export to satisfy LandlordDashboard.jsx import expectations
export const getRentalRequests = getRentalRequestsForUser;

export async function updateRentalRequestStatus(id, status) {
  const response = await api.patch(`/rental-requests/${id}/status`, { status });
  return response.data;
}