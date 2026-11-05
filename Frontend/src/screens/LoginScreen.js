
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import Toast from "react-native-toast-message";

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
       if (!email.trim() || !password) {
    Toast.show({
        type: "error",
        text1: "Missing Details",
        text2: "Please enter email and password.",
    });
    return;
}

        try {
            setLoading(true);
             

            await login({
                email: email.trim().toLowerCase(),
                password,
            });

            Toast.show({
    type: "success",
    text1: "Login Successful!",
    text2: "Welcome back to MapMate.",
});
        } catch (error) {
    console.log("LOGIN ERROR:", error.message);
    console.log("LOGIN STATUS:", error.response?.status);
    console.log(
        "LOGIN RESPONSE:",
        JSON.stringify(error.response?.data, null, 2)
    );

    Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
            error.response?.data?.message ||
            "Please check your email and password.",
    });
} finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.logo}>
                        <Ionicons name="navigate" size={34} color="#FFFFFF" />
                    </View>

                    <Text style={styles.brand}>MapMate</Text>
                    <Text style={styles.tagline}>
                        Your journey starts here.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.heading}>Welcome Back</Text>
                    <Text style={styles.description}>
                        Sign in to continue exploring.
                    </Text>

                    <Text style={styles.label}>Email Address</Text>

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#94A3B8" />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#94A3B8"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <Text style={styles.label}>Password</Text>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#94A3B8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />

                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={21}
                                color="#94A3B8"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.forgotButton}
                        onPress={() => navigation.navigate("ForgotPassword")}
                    >
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                     

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Sign In</Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Don't have an account?
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("Signup")}
                        >
                            <Text style={styles.signupText}> Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.bottomText}>
                    Explore more. Worry less.
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F5F9",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 22,
        paddingVertical: 35,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    logo: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
    },
    brand: {
        fontSize: 30,
        fontWeight: "800",
        color: "#0F172A",
        marginTop: 14,
    },
    tagline: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 5,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 26,
        padding: 24,
        elevation: 7,
        shadowColor: "#0F172A",
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
    },
    heading: {
        fontSize: 25,
        fontWeight: "800",
        color: "#0F172A",
    },
    description: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 7,
        marginBottom: 27,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 9,
    },
    inputContainer: {
        height: 56,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 14,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "#F8FAFC",
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#0F172A",
        marginLeft: 11,
    },
    forgotButton: {
        alignSelf: "flex-end",
        marginTop: -9,
        marginBottom: 22,
    },
    forgotText: {
        color: "#2563EB",
        fontWeight: "700",
        fontSize: 13,
    },
    errorText: {
        color: "#DC2626",
        fontSize: 13,
        marginBottom: 14,
    },
    loginButton: {
        height: 56,
        borderRadius: 15,
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        elevation: 4,
    },
    loginButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 25,
    },
    footerText: {
        color: "#64748B",
        fontSize: 13,
    },
    signupText: {
        color: "#2563EB",
        fontSize: 13,
        fontWeight: "800",
    },
    bottomText: {
        textAlign: "center",
        color: "#94A3B8",
        fontSize: 12,
        marginTop: 27,
    },
});
