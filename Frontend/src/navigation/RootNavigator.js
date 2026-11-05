
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

import MainTabNavigator from "./MainTabNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen
                        name="MainTabs"
                        component={MainTabNavigator}
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                        />

                        <Stack.Screen
                            name="Signup"
                            component={SignupScreen}
                        />

                        <Stack.Screen
                            name="ForgotPassword"
                            component={ForgotPasswordScreen}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
