import { User } from "../types/UserTypes";

export const getAccessTokenFromLocalStorage = (): string | null => {
    return localStorage.getItem("access_token");
}

export const getRefreshTokenFromLocalStorage = (): string | null => {
    return localStorage.getItem("refresh_token");
}

export const getUserDataFromLocalStorage = (): User | null => {
    const userData = localStorage.getItem("userData");
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}