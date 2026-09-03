
import api from "./api";

// ==========================================
// REGISTER
// ==========================================

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const register = registerUser;

// ==========================================
// LOGIN
// ==========================================

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  const { token, user } = response.data;

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

export const login = loginUser;

// ==========================================
// CURRENT USER
// ==========================================

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const getMe = getCurrentUser;

// ==========================================
// FORGOT PASSWORD
// ==========================================

export const forgotPassword = async (emailOrData) => {
  const payload =
    typeof emailOrData === "string"
      ? { email: emailOrData }
      : emailOrData;

  const response = await api.post(
    "/auth/forgot-password",
    payload
  );

  return response.data;
};

// ==========================================
// RESET PASSWORD
// ==========================================

export const resetPassword = async (
  resetTokenOrData,
  newPassword
) => {
  const payload =
    typeof resetTokenOrData === "object"
      ? resetTokenOrData
      : {
          resetToken: resetTokenOrData,
          newPassword,
        };

  const response = await api.post(
    "/auth/reset-password",
    payload
  );

  return response.data;
};

// ==========================================
// UPDATE FAYDA INFORMATION
// ==========================================

export const updateIdNumber = async ({
  idNumber,
  faydaFrontImage,
  faydaBackImage,
}) => {
  // Validate ID number
  if (!idNumber) {
    throw new Error("Fayda ID number is required");
  }

  // Validate exactly 16 digits
  if (!/^\d{16}$/.test(String(idNumber))) {
    throw new Error(
      "Fayda ID number must be exactly 16 digits"
    );
  }

  // Validate front image
  if (!(faydaFrontImage instanceof File)) {
    throw new Error(
      "Please select the Fayda front image"
    );
  }

  // Validate back image
  if (!(faydaBackImage instanceof File)) {
    throw new Error(
      "Please select the Fayda back image"
    );
  }

  // Create multipart form
  const formData = new FormData();

  formData.append(
    "idNumber",
    String(idNumber)
  );

  formData.append(
    "faydaFrontImage",
    faydaFrontImage
  );

  formData.append(
    "faydaBackImage",
    faydaBackImage
  );

  // Send request
  const response = await api.patch(
    "/auth/id-number",
    formData
  );

  return response.data;
};

// ==========================================
// LOGOUT
// ==========================================

export const logoutUser = () => {
  localStorage.removeItem("hr_token");
  localStorage.removeItem("token");
  localStorage.removeItem("hr_user");
  localStorage.removeItem("user");
};

export const logout = logoutUser;
