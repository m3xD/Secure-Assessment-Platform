import userService from "../services/userService";
import { useAuth } from "./useAuth";

export const useUserService = () => {
  const { authState, setAuthState } = useAuth();

  const getUser = async (id: string) => {
    try {
      const user = await userService.getUser(id);
      return user;
    } catch (error) {
      throw new Error("Failed to get user");
    }
  };

  const updateUser = async (
    id: string,
    name: string,
    email: string,
    role: "user" | "admin"
  ) => {
    try {
      const updatedUser = await userService.updateUser(
        id,
        name,
        email,
        role
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

  const deleteUser = async (id: string) => {
    try {
      await userService.deleteUser(id);
    } catch (error) {
      throw new Error("Failed to delete user");
    }
  };

  const listUsers = async (page: number, pageSize: number) => {
    try {
      const res = await userService.listUsers(page, pageSize);
      return res;
    } catch (error) {
      throw new Error("Failed to list users");
    }
  };

  const createUser = async (
    name: string,
    email: string,
    password: string,
    role: "user" | "admin"
  ) => {
    try {
      const user = await userService.createUser(
        name,
        email,
        password,
        role
      );
      return user;
    } catch (error) {
      throw new Error("Failed to create new user");
    }
  };

  return {
    getUser,
    updateUser,
    deleteUser,
    listUsers,
    createUser,
  };
};
