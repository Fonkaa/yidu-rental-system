<<<<<<< HEAD
import { createContext, useContext, useEffect, useState } from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
} from "../services/authService";
=======
import { createContext, useContext, useState } from 'react';
>>>>>>> origin/feature/developer-a-auth

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
<<<<<<< HEAD
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication after page refresh
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("hr_token");
      const savedUser = localStorage.getItem("hr_user");

      // No token = not logged in
      if (!token) {
        setLoading(false);
        return;
      }

      // Restore saved user immediately
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Invalid saved user:", error);
          localStorage.removeItem("hr_user");
        }
      }

      // Verify token with backend
      try {
        const response = await getCurrentUser();

        if (!response?.user) {
          throw new Error("Invalid user response");
        }

        /*
          Backend /api/auth/me returns:
          {
            userId,
            role,
            iat,
            exp
          }

          Merge that with saved user information.
        */
        setUser((previousUser) => ({
          ...(previousUser || {}),
          ...response.user,
          id: response.user.userId || previousUser?.id,
        }));
      } catch (error) {
        console.error("Session verification failed:", error);

        logoutUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login
  const login = async (credentials) => {
    const response = await loginUser(credentials);

    if (!response?.token || !response?.user) {
      throw new Error("Invalid login response from server");
    }

    setUser(response.user);

    return response;
  };

  // Register
  const register = async (userData) => {
    return await registerUser(userData);
  };

  // Logout
  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const isAuthenticated =
    Boolean(localStorage.getItem("hr_token")) && Boolean(user);

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
=======
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
>>>>>>> origin/feature/developer-a-auth
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
<<<<<<< HEAD
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export default AuthContext;
=======
  return useContext(AuthContext);
}
>>>>>>> origin/feature/developer-a-auth
