
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import * as SecureStore from "expo-secure-store";

import {
    login as loginService,
    signup as signupService,
    logout as logoutService,
    getProfile,
} from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check existing login when app starts
    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const token = await SecureStore.getItemAsync("authToken");

                if (token) {
                    const response = await getProfile();

                    const profile = response.user || response.data?.user || response.data;

                    setUser(profile);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                await SecureStore.deleteItemAsync("authToken");
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    // Login
    const login = async (credentials) => {
        const response = await loginService(credentials);

        let profile = response.user || response.data?.user;

        if (!profile) {
            const profileResponse = await getProfile();
            profile =
                profileResponse.user ||
                profileResponse.data?.user ||
                profileResponse.data;
        }

        setUser(profile);
        setIsAuthenticated(true);

        return response;
    };

    // Signup
    const signup = async (userData) => {
        const response = await signupService(userData);

        if (response.token) {
            const profileResponse = await getProfile();

            const profile =
                profileResponse.user ||
                profileResponse.data?.user ||
                profileResponse.data;

            setUser(profile);
            setIsAuthenticated(true);
        }

        return response;
    };

    // Logout
    const logout = async () => {
        await logoutService();

        setUser(null);
        setIsAuthenticated(false);
    };

    // Update user information
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                signup,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};
