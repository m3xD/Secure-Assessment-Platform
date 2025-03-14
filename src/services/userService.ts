import axios from "axios";
import { User } from "../types/UserTypes";
import { getAccessTokenFromLocalStorage } from "../utils/localStorageUtils";

const API_URL = "https://auth-service-6f3ceb0b5b52.herokuapp.com";

// create an axios instance with auth headers
const userApi = () => {
  const token = getAccessTokenFromLocalStorage();
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const userService = {
  // service to get user
  async getUser(id: string): Promise<User> {
    try {
      const res = await userApi().get(`/users/${id}`);
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
    role: "user" | "admin"
  ): Promise<User> {
    try {
      const reqData = {
        full_name: fullName,
        email,
        phone,
        role,
      };
      const res = await userApi().put(`/users/${id}`, reqData);
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
  async deleteUser(id: string): Promise<void> {
    try {
      await userApi().delete(`/users/${id}`);
    } catch (error) {
      throw new Error("Failed to delete user");
    }
  },

  // service to list user
  async listUsers(
    page: number,
    pageSize: number
  ): Promise<{ users: User[]; total_page: number; total_user: number }> {
    try {
      const res = await userApi().get(
        `/users/list?page=${page}&pageSize=${pageSize}`
      );
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
      const total_page = res.data.meta.total_page;
      const total_user = res.data.meta.total_user;
      return { users, total_page, total_user };
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
    role: "user" | "admin"
  ): Promise<User> {
    try {
      const reqData = {
        full_name: fullName,
        email,
        phone,
        password,
        role,
      };
      const res = await userApi().post(`/users`, reqData);
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

export default userService;
