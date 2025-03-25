import axios from "axios";
import { User } from "../types/UserTypes";
import { getTokenFromLocalStorage } from "../utils/localStorageUtils";

const API_URL = "https://auth-service-6f3ceb0b5b52.herokuapp.com";

// create an axios instance with auth headers
const authApi = () => {
  const token = getTokenFromLocalStorage();
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const authService = {
  // service to signin
  async signin(
    email: string,
    password: string
  ): Promise<{ token: string, refreshToken: string, user: User }> {
    try {
      const reqData = {
        email,
        password,
      };
      const res = await axios.post(`${API_URL}/auth/login`, reqData);
      console.log(">>> check res signin: ", res);
      const token = res.data.token;
      const refreshToken = res.data.refreshToken;
      const userData = res.data.user;
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || "user",
      };
      return { token, refreshToken, user };
    } catch (error) {
      throw new Error("Login failed");
    }
  },

  // service to signup
  async signup(
    name: string,
    email: string,
    password: string,
  ): Promise<void> {
    const reqData = {
      name: name,
      email,
      password,
    };
    console.log(">>> check reqData signup: ", reqData);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, reqData);
      console.log(">>> check res signup: ", res);
    } catch (error) {
      throw new Error("Failed to register");
    }
  },

  // service to refresh token
  async refreshToken(refreshToken: string): Promise<{ token: string, newRefreshToken: string }> {
    try {
      const reqData = {
        refreshToken: refreshToken
      }
      const res = await axios.post(`${API_URL}/auth/refresh`, reqData);
      console.log(">>> check res refreshToken: ", res);
      return { token: res.data.token, newRefreshToken: res.data.refreshToken };
    } catch (error) {
      throw new Error("Failed to refresh token");
    }
  },

  // service to logout 
  async logout(refreshToken: string): Promise<void> {
    try {
      await authApi().post('/auth/logout', refreshToken);
    } catch (error) {
      throw new Error("Failed to logout");
    }
  }
};

export default authService;
