import React, { createContext, useEffect, useState, useCallback } from "react";
import { AuthContextType, AuthState } from "../types/AuthTypes";
import authService from "../services/authService";
import { getUserIDFromToken, isTokenExpired } from "../utils/jwtUtils";
import userService from "../services/userService";


export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize authState from localStorage on component mount
    // This prevents the initial "loading" state from causing flickering
    try {
      const token = localStorage.getItem("token");
      const userDataStr = localStorage.getItem("userData");

      if (token && userDataStr && !isTokenExpired(token)) {
        const user = JSON.parse(userDataStr);
        return {
          user,
          isAuthenticated: true,
          loading: false,
        };
      }
    } catch (error) {
      console.error("Error initializing auth state:", error);
    }

    return {
      user: null,
      isAuthenticated: false,
      loading: true,
    };
  });

  // Use useCallback to prevent checkAuth from being recreated on each render
  const checkAuth = useCallback(async () => {
    console.log("Running checkAuth...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          loading: false,
        }));
        return;
      }

      // If token is expired, try to refresh
      if (isTokenExpired(token)) {
        console.log("Token expired, attempting refresh");
        try {
          const refreshTokenValue = localStorage.getItem("refreshToken");
          if (!refreshTokenValue) {
            throw new Error("No refresh token available");
          }
          
          // Await the token refresh
          await refreshToken(refreshTokenValue);
          
          // After refresh, get the new token and fetch user data
          const newToken = localStorage.getItem("token");
          if (!newToken) {
            throw new Error("Token refresh failed");
          }
          
          const userId = getUserIDFromToken(newToken);
          if (!userId) {
            throw new Error("Invalid token after refresh");
          }
          
          // Fetch user data with the new token
          const user = await userService.getUser(userId);
          localStorage.setItem("userData", JSON.stringify(user));
          
          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            loading: false,
          }));
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userData");
          
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
        return;
      }

      // Rest of your existing code for handling valid tokens
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setAuthState({
            user: userData,
            isAuthenticated: true,
            loading: false,
          });
          return;
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      // If we don't have valid user data but token is valid, fetch user
      try {
        const userId = getUserIDFromToken(token);
        if (userId) {
          const user = await userService.getUser(userId);
          localStorage.setItem("userData", JSON.stringify(user));
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          throw new Error("No user ID in token");
        }
      } catch (error) {
        console.error("Failed to get user data:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("refreshToken");
    }
  }, []);  // Add proper dependencies

  // Only run checkAuth once during initial component mount
  useEffect(() => {
    if (authState.loading) {
      checkAuth();
    }
  }, [checkAuth]);

  // Check authState
  useEffect(() => {
    console.log("Auth state changed:", authState);
  }, [authState]);

  const signin = async (email: string, password: string) => {
    try {
      const { token, refreshToken, user } = await authService.signin(
        email,
        password
      );
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userData", JSON.stringify(user));
      setAuthState({
        user: user,
        isAuthenticated: true,
        loading: false,
      });
      return user;
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: "user" | "admin"
  ) => {
    try {
      await authService.signup(name, email, password, role);
    } catch (error) {
      throw new Error("Signup failed");
    }
  };

  const refreshToken = async (refreshToken: string) => {
    try {
      const { token, newRefreshToken } = await authService.refreshToken(refreshToken);
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", newRefreshToken);
    } catch (error) {
      throw new Error("Failed to refresh token");
    }
  };

  const value = {
    authState,
    setAuthState,
    signin,
    logout,
    signup,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
