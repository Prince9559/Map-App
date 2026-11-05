
import React from "react";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";

import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
    return (
        <AuthProvider>
            <StatusBar style="dark" />

            <RootNavigator />

            <Toast
                position="top"
                topOffset={55}
                visibilityTime={3000}
                autoHide={true}
            />
        </AuthProvider>
    );
}
