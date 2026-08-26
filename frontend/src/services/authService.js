import api from "./api";

// Register
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Aliases for compatibility
export const register = registerUser;

// Login
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  const token = response.data.token;
  const user = response.data.user;

  if (token) {
    localStorage.setItem("hr_token", token);
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem("hr_user", JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
  }

  return response.data;
};

// Alias for compatibility
export const login = loginUser;

// Current user
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const getMe = getCurrentUser;

// Forgot password
export const forgotPassword = async (emailOrData) => {
  const payload = typeof emailOrData === 'string' ? { email: emailOrData } : emailOrData;
  const response = await api.post("/auth/forgot-password", payload);
  return response.data;
};

// Reset password
export const resetPassword = async (resetTokenOrData, newPassword) => {
  const payload = typeof resetTokenOrData === 'object' 
    ? resetTokenOrData 
    : { resetToken: resetTokenOrData, newPassword };
  const response = await api.post("/auth/reset-password", payload);
  return response.data;
};

// Update ID Number
export const updateIdNumber = async (idNumber) => {
  const response = await api.patch('/auth/id-number', { idNumber });
  return response.data;
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("hr_token");
  localStorage.removeItem("token");
  localStorage.removeItem("hr_user");
  localStorage.removeItem("user");
};