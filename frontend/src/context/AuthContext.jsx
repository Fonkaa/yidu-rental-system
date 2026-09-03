import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  getCurrentUser,
  logoutUser as apiLogoutUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("hr_user") ||
        localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Failed to load saved user:", error);
      localStorage.removeItem("hr_user");
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // ==========================================
  // RESTORE SESSION
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const token =
        localStorage.getItem("hr_token") ||
        localStorage.getItem("token");

      const savedUser =
        localStorage.getItem("hr_user") ||
        localStorage.getItem("user");

      // No token = not logged in
      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // Restore saved user immediately
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);

          if (mounted) {
            setUser(parsedUser);
          }
        } catch (error) {
          console.error(
            "Invalid saved user:",
            error
          );

          localStorage.removeItem("hr_user");
          localStorage.removeItem("user");
        }
      }

      // Verify token with backend
      try {
        const response = await getCurrentUser();

        const userData =
          response?.user || response?.data?.user || response;

        if (!userData || !userData.id) {
          throw new Error(
            "Invalid user response from server"
          );
        }

        if (mounted) {
          setUser((previousUser) => {
            const updatedUser = {
              ...(previousUser || {}),
              ...userData,
              id: userData.userId || userData.id || previousUser?.id,
            };

            localStorage.setItem(
              "hr_user",
              JSON.stringify(updatedUser)
            );

            localStorage.setItem(
              "user",
              JSON.stringify(updatedUser)
            );

            return updatedUser;
          });
        }
      } catch (error) {
        console.error(
          "Session verification failed:",
          error
        );

        apiLogoutUser();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================
  // REAL-TIME USER STATE & STORAGE UPDATER
  // ==========================================

  const updateUser = (updatedUserData) => {
    setUser((previousUser) => {
      const updatedUser = {
        ...(previousUser || {}),
        ...updatedUserData,
        id: updatedUserData.userId || updatedUserData.id || previousUser?.id,
      };
      // Save to both key patterns to ensure compatibility across all layouts
      localStorage.setItem("hr_user", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (credentials) => {
    const response = await apiLoginUser(credentials);

    const token = response?.token;

    const userData =
      response?.user || response?.data?.user;

    if (!token) {
      throw new Error(
        "Login successful but no token was returned"
      );
    }

    if (!userData) {
      throw new Error(
        "Login successful but no user data was returned"
      );
    }

    localStorage.setItem(
      "hr_token",
      token
    );

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "hr_user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);

    return response;
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (userData) => {
    return await apiRegisterUser(userData);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    apiLogoutUser();
    localStorage.removeItem("hr_user");
    localStorage.removeItem("user");
    localStorage.removeItem("hr_token");
    localStorage.removeItem("token");
    setUser(null);
  };

  // ==========================================
  // AUTHENTICATION STATUS
  // ==========================================

  const token =
    localStorage.getItem("hr_token") ||
    localStorage.getItem("token");

  const isAuthenticated =
    Boolean(token) && Boolean(user);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser, // <--- Exposed to all components via useAuth()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// USE AUTH
// ==========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthContext;