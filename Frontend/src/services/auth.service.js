
import api from "./api";
import * as SecureStore from "expo-secure-store";

// User Signup
export const signup = async (userData) => {
    const response = await api.post("/auth/signup", userData);

    if (response.data.token) {
        await SecureStore.setItemAsync(
            "authToken",
            response.data.token
        );
    }

    return response.data;
};

// User Login
export const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    if (response.data.token) {
        await SecureStore.setItemAsync(
            "authToken",
            response.data.token
        );
    }

    return response.data;
};

// User Logout
export const logout = async () => {
    await SecureStore.deleteItemAsync("authToken");
};

// Get Current User Profile
export const getProfile = async () => {
    const response = await api.get("/users/profile");

    return response.data;
};
