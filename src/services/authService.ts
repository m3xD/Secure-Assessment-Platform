import axios from "axios";
import { User } from "../types/UserTypes";

const API_URL = "https://auth-service-6f3ceb0b5b52.herokuapp.com";

const authService = {
  // service to signin
  async signin(
    email: string,
    password: string
  ): Promise<{ access_token: string; refresh_token: string; user: User }> {
    try {
      const reqData = {
        email,
        password,
      };
      const res = await axios.post(`${API_URL}/auth/login`, reqData);
      console.log(">>> check res signin: ", res);
      const access_token = res.data.data.access_token;
      const refresh_token = res.data.data.refresh_token;
      const userData = res.data.data.user;
      const user: User = {
        id: userData.id,
        fullName: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.avatar || "",
        role: userData.role || "user",
      };
      return { access_token, refresh_token, user };
    } catch (error) {
      throw new Error("Login failed");
    }
  },

  // service to signup
  async signup(
    fullName: string,
    email: string,
    phone: string,
    password: string
  ): Promise<void> {
    const reqData = {
      full_name: fullName,
      email,
      phone,
      password,
    };
    try {
      await axios.post(`${API_URL}/auth/register`, reqData);
    } catch (error) {
      throw new Error("Failed to register");
    }
  },

  // service to refresh token
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const res = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      return res.data.data.access_token;
    } catch (error) {
      throw new Error("Failed to refresh token");
    }
  },
};

export default authService;
