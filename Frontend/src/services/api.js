
import axios from "axios";
import { API_BASE_URL } from "../constants/config";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync("authToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle API errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Something went wrong";

        console.log("API Error:", message);
        console.log("API BASE URL:", API_BASE_URL);

        return Promise.reject(error);
    }
);

export default api;
