import api from "./api";

// Get logged-in tenant profile
export const getMyProfile = async () => {
  const response = await api.get("/profile");
  return response.data;
};

// Update logged-in tenant profile
export const updateMyProfile = async (profileData) => {
  const response = await api.put("/profile", profileData);
  return response.data;
};