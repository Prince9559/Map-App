
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
} from "react-native";

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.logoContainer}>
                <Text style={styles.logo}>M</Text>
            </View>

            <Text style={styles.title}>MapMate</Text>

            <Text style={styles.subtitle}>
                Explore the world. Find your way.
            </Text>

            <ActivityIndicator
                size="large"
                color="#60A5FA"
                style={styles.loader}
            />

            <Text style={styles.loadingText}>
                Preparing your journey...
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B1220",
        justifyContent: "center",
        alignItems: "center",
    },

    logoContainer: {
        width: 85,
        height: 85,
        borderRadius: 28,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        elevation: 15,
    },

    logo: {
        color: "#FFFFFF",
        fontSize: 48,
        fontWeight: "bold",
    },

    title: {
        color: "#FFFFFF",
        fontSize: 32,
        fontWeight: "800",
        marginTop: 22,
        letterSpacing: 1,
    },

    subtitle: {
        color: "#94A3B8",
        fontSize: 14,
        marginTop: 8,
    },

    loader: {
        marginTop: 55,
    },

    loadingText: {
        color: "#64748B",
        fontSize: 12,
        marginTop: 14,
    },
});
