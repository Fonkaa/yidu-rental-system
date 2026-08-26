import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  getCurrentUser,
  logoutUser as apiLogoutUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("hr_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Restore authentication after page refresh
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("hr_token") || localStorage.getItem("token");
      const savedUser = localStorage.getItem("hr_user") || localStorage.getItem("user");

      if (!token) {
        setLoading(false);
        return;
      }

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Invalid saved user:", error);
          localStorage.removeItem("hr_user");
          localStorage.removeItem("user");
        }
      }

      try {
        const response = await getCurrentUser();
        const userData = response?.user || response;

        if (!userData) {
          throw new Error("Invalid user response");
        }

        setUser((previousUser) => {
          const updatedUser = {
            ...(previousUser || {}),
            ...userData,
            id: userData.userId || userData.id || previousUser?.id,
          };
          localStorage.setItem("hr_user", JSON.stringify(updatedUser));
          return updatedUser;
        });
      } catch (error) {
        console.error("Session verification failed:", error);
        apiLogoutUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login (Explicitly stores token and user in localStorage)
  const login = async (credentials) => {
    const response = await apiLoginUser(credentials);
    const token = response.token;
    const userData = response.user || response;

    if (token) {
      localStorage.setItem("hr_token", token);
    }
    if (userData) {
      localStorage.setItem("hr_user", JSON.stringify(userData));
    }

    setUser(userData);
    return response;
  };

  // Register
  const register = async (userData) => {
    return await apiRegisterUser(userData);
  };

  // Logout
  const logout = () => {
    apiLogoutUser();
    setUser(null);
  };

  const isAuthenticated =
    Boolean(localStorage.getItem("hr_token") || localStorage.getItem("token")) && Boolean(user);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export default AuthContext;