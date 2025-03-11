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
      const token = localStorage.getItem("access_token");
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
      const token = localStorage.getItem("access_token");
      if (!token) {
        setAuthState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          loading: false,
        }));
        return;
      }

      // If token is expired, clear auth and return
      if (isTokenExpired(token)) {
        console.log("Token expired, clearing auth");
        localStorage.removeItem("access_token");
        localStorage.removeItem("userData");
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
        return;
      }

      // Check if we already have user data
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
        localStorage.removeItem("access_token");
        localStorage.removeItem("userData");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      localStorage.removeItem("access_token");
      localStorage.removeItem("userData");
    }
  }, []);

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
      const { access_token, refresh_token, user } = await authService.signin(
        email,
        password
      );
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userData");
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const signup = async (
    fullName: string,
    email: string,
    phone: string,
    password: string
  ) => {
    try {
      await authService.signup(fullName, email, phone, password);
    } catch (error) {
      throw new Error("Signup failed");
    }
  };

  const getUser = async (id: string, providedToken?: string) => {
    try {
      const user = await userService.getUser(id, providedToken);
      return user;
    } catch (error) {
      throw new Error("Failed to get user");
    }
  };

  const updateUser = async (
    id: string,
    fullName: string,
    email: string,
    phone: string,
    role: "user" | "admin",
    providedToken?: string
  ) => {
    try {
      const updatedUser = await userService.updateUser(
        id,
        fullName,
        email,
        phone,
        role,
        providedToken
      );
      if (updatedUser.id === authState.user?.id) {
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }));
      }
      return updatedUser;
    } catch (error) {
      throw new Error("Failed to update user");
    }
  };

  const deleteUser = async (id: string, providedToken?: string) => {
    try {
      await userService.deleteUser(id, providedToken);
    } catch (error) {
      throw new Error("Failed to delete user");
    }
  };

  const refreshToken = async (refresh_token: string) => {
    try {
      const access_token = await authService.refreshToken(refresh_token);
      localStorage.setItem("access_token", access_token);
      return access_token;
    } catch (error) {
      throw new Error("Failed to refresh token");
    }
  };

  const listUsers = async (
    page: number,
    pageSize: number,
    providedToken?: string
  ) => {
    try {
      const res = await userService.listUsers(page, pageSize, providedToken);
      return res;
    } catch (error) {
      throw new Error("Failed to list users");
    }
  };

  const createUser = async (
    fullName: string,
    email: string,
    phone: string,
    password: string,
    role: "user" | "admin",
    providedToken?: string
  ) => {
    try {
      const user = await userService.createUser(
        fullName,
        email,
        phone,
        password,
        role,
        providedToken
      );
      return user;
    } catch (error) {
      throw new Error("Failed to create new user");
    }
  };

  const value = {
    authState,
    signin,
    logout,
    signup,
    getUser,
    updateUser,
    deleteUser,
    refreshToken,
    createUser,
    listUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
