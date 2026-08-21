import api from "./api";

// Register
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Login
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  if (response.data.token) {
    localStorage.setItem("hr_token", response.data.token);
  }

  if (response.data.user) {
    localStorage.setItem(
      "hr_user",
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};

// Current user
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

// Reset password
export const resetPassword = async (resetToken, newPassword) => {
  const response = await api.post("/auth/reset-password", {
    resetToken,
    newPassword,
  });

  return response.data;
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("hr_token");
  localStorage.removeItem("hr_user");
};