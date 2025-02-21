import React, { createContext, useEffect, useState } from "react";
import { AuthContextType, AuthState } from "../types/AuthTypes";
import authService from "../services/authService";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (token) {
        const user = await authService.validateToken(token);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      localStorage.removeItem("auth-token");
    }
  };

  // const login = async (email: string, password: string) => {
  //   try {
  //     const { token, user } = await authService.login(email, password);
  //     localStorage.setItem("auth_token", token);

  //     setAuthState({
  //       user,
  //       isAuthenticated: true,
  //       loading: false,
  //     });
  //   } catch (error) {
  //     throw new Error("Login failed");
  //   }
  // };

  const login = async (email: string, password: string) => {
    try {
      const {token} = await authService.login(email, password);
      console.log(">>>>> check token: ", token);
      localStorage.setItem("auth_token", token);

      setAuthState({
        user: {
          id: "1",
          name: "John Doe",
          email: "John@gmail.com",
          role: "student",
        },
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    try {
      // await authService.logout();
      localStorage.removeItem("auth_token");
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: "student" | "teacher"
  ) => {
    try {
      await authService.signup(name, email, password, role);
    } catch (error) {
      throw new Error("Signup failed");
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
