import { User } from "../types/UserTypes";

export const getTokenFromLocalStorage = (): string | null => {
    return localStorage.getItem("token");
}

export const getRefreshTokenFromLocalStorage = (): string | null => {
    return localStorage.getItem("refreshToken");
}

export const getUserDataFromLocalStorage = (): User | null => {
    const userData = localStorage.getItem("userData");
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}