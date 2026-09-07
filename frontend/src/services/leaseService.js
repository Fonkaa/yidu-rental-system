import api from "./api";

// ==========================================
// GET MY LEASES
// ==========================================
export async function getMyLeases() {
  const response = await api.get(
    "/leases/my-leases"
  );

  return response.data;
}

// ==========================================
// GET SINGLE LEASE
// ==========================================
// Use this only if your backend has
// GET /api/leases/:id
// ==========================================
export async function getLeaseById(id) {
  const response = await api.get(
    `/leases/${id}`
  );

  return response.data;
}

// ==========================================
// SERVICE OBJECT
// ==========================================
export const leaseService = {
  getAll: getMyLeases,
  getById: getLeaseById,
};