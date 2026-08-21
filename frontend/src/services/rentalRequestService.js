import api from "./api";

// Create a new rental request
export const createRentalRequest = async ({
  propertyId,
  message = "",
  proposedPrice = null,
  startDate = null,
  endDate = null,
}) => {
  const response = await api.post("/rental-requests", {
    propertyId,
    message,
    proposedPrice,
    startDate,
    endDate,
  });

  return response.data;
};

// Get rental requests for the logged-in tenant
export const getRentalRequests = async () => {
  const response = await api.get("/rental-requests");

  return response.data;
};

// Update rental request status
export const updateRentalRequestStatus = async (
  id,
  status
) => {
  const response = await api.patch(
    `/rental-requests/${id}/status`,
    { status }
  );

  return response.data;
};