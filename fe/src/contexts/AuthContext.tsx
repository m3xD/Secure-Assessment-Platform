import React, { createContext, useEffect, useState, useCallback } from "react";
import { AuthContextType, AuthState } from "../types/AuthTypes";
import authService from "../services/authService";
import { getUserIDFromToken } from "../utils/jwtUtils";
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

      if (token && userDataStr) {
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
      
      // If no token exists, user is not authenticated
      if (!token) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
        return;
      }

      // Try to get user data from localStorage first
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
          // Continue to fetch user data if parsing fails
        }
      }

      // If we have a token but no valid user data, fetch user data
      try {
        const userId = getUserIDFromToken(token);
        if (!userId) {
          throw new Error("Invalid token - no user ID found");
        }
        
        // Fetch user data using the token (axios interceptor will handle refresh if needed)
        const user = await userService.getUser(userId);
        localStorage.setItem("userData", JSON.stringify(user));
        
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to get user data:", error);
        // If we can't get user data, clear auth state
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear everything on error
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  }, []); // No dependencies needed as we're not using any props or state

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

  const logout = async (refreshToken: string) => {
    try {
      const res = await authService.logout(refreshToken);
      console.log(">>> check res logout: ", res);
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (error) {
      throw new Error("Logout failed");
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await authService.signup(name, email, password);
    } catch (error) {
      throw new Error("Signup failed");
    }
  };

  const refreshToken = async (refreshToken: string) => {
    try {
      const { token, newRefreshToken } = await authService.refreshToken(
        refreshToken
      );
      return {
        token,
        newRefreshToken,
      };
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
