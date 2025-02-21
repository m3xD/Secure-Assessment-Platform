import axios from "axios";
import { User } from "../types/AuthTypes";

const API_URL = "https://daily-submit-4bffa99fd788.herokuapp.com/api/v1";

const authService = {
  // async login(
  //   email: string,
  //   password: string
  // ): Promise<{ token: string; user: User }> {
  //   const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  //   console.log(">>>>> check res login: ", res);
  //   return res.data;
  // },

  async login(
    email: string,
    password: string
  ): Promise<{token: string}> {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log(">>>>> check res login: ", res);
    console.log(">>>>> check res.data.data.token: ", res.data.data.token);
    return {token: res.data.data.token};
  },

  async signup(
    name: string,
    email: string,
    password: string,
    role: "student" | "teacher"
  ): Promise<void> {
    const reqData = {
      name,
      email,
      password,
      role,
    };
    await axios.post(`${API_URL}/auth/signup`, reqData);
  },

  async validateToken(token: string): Promise<User> {
    const response = await axios.get(`${API_URL}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user;
  },

  async logout(): Promise<void> {
    await axios.post(`${API_URL}/auth/logout`);
  },
};

export default authService;
