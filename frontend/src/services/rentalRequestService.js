import api from "./api";

// ==========================================
// CREATE RENTAL REQUEST
// ==========================================
export async function createRentalRequest(
  requestData
) {
  const response = await api.post(
    "/rental-requests",
    requestData
  );

  return response.data;
}

// ==========================================
// GET RENTAL REQUESTS
// ==========================================
export async function getRentalRequestsForUser() {
  const response = await api.get(
    "/rental-requests"
  );

  return response.data;
}

// ==========================================
// ALIAS
// ==========================================
export const getRentalRequests =
  getRentalRequestsForUser;

// ==========================================
// UPDATE RENTAL REQUEST STATUS
// ==========================================
export async function updateRentalRequestStatus(
  id,
  status
) {
  const response = await api.patch(
    `/rental-requests/${id}/status`,
    {
      status,
    }
  );

  return response.data;
}