import axios from "axios";
import { User } from "../types/AuthTypes";

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

  // service to get user
  async getUser(id: string, providedToken?: string): Promise<User> {
    try {
      const token = providedToken || localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const res = await axios.get(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(">>> check res getUser: ", res);
      const userData = res.data.data;
      const user: User = {
        id: userData.id,
        fullName: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.avatar || "",
        role: userData.role || "user",
      };
      return user;
    } catch (error) {
      throw new Error("Failed to get user");
    }
  },

  // service to update user
  async updateUser(
    id: string,
    fullName: string,
    email: string,
    phone: string,
    role: "user" | "admin",
    providedToken?: string,
  ): Promise<User> {
    try {
      const token = providedToken || localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const reqData = {
        full_name: fullName,
        email,
        phone,
        role,
      };
      const res = await axios.put(`${API_URL}/users/${id}`, reqData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(">>> check res updateUser: ", res);
      const userData = res.data.data;
      const user: User = {
        id: userData.id,
        fullName: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.avatar || "",
        role: userData.role || "user",
      };
      return user;
    } catch (error) {
      throw new Error("Failed to update user");
    }
  },

  // service to delete user
  async deleteUser(id: string, providedToken?: string): Promise<void> {
    try {
      const token = providedToken || localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      throw new Error("Failed to delete user");
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

  // service to list user
  async listUsers(providedToken?: string): Promise<User[]> {
    try {
      const token = providedToken || localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const res = await axios.get(`${API_URL}/users/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(">>> check res listUsers: ", res);
      const usersData = res.data.data;
      const users: User[] = usersData.map((userData: any) => ({
        id: userData.id,
        fullName: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.avatar || "",
        role: userData.role || "user",
      }));
      return users;
    } catch (error) {
      throw new Error("Failed to list users");
    }
  },

  // service to create user
  async createUser(
    fullName: string,
    email: string,
    phone: string,
    password: string,
    role: "user" | "admin",
    providedToken?: string
  ): Promise<User> {
    try {
      const token = providedToken || localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const reqData = {
        full_name: fullName,
        email,
        phone,
        password,
        role,
      };
      const res = await axios.post(`${API_URL}/users`, reqData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(">>> check res createUser: ", res);
      const userData = res.data.data;
      const user: User = {
        id: userData.id,
        fullName: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.avatar || "",
        role: userData.role || "user",
      };
      return user;
    } catch (error) {
      throw new Error("Failed to create user");
    }
  },
};

export default authService;
