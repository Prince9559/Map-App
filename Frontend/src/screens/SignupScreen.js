
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
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";

export default function SignupScreen({ navigation }) {
    const { signup } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    // Signup Function
    const handleSignup = async () => {
        if (loading) return;

        if (
            !name.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            Toast.show({
                type: "error",
                text1: "Missing Details",
                text2: "Please fill in all fields.",
            });
            return;
        }

        if (password.length < 8) {
            Toast.show({
                type: "error",
                text1: "Weak Password",
                text2: "Password must be at least 8 characters.",
            });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: "error",
                text1: "Password Mismatch",
                text2: "Passwords do not match.",
            });
            return;
        }

        try {
            setLoading(true);

            await signup({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            Toast.show({
                type: "success",
                text1: "Account Created!",
                text2: "Welcome to MapMate.",
            });

        } catch (error) {
            console.log("SIGNUP ERROR:", error.message);
            console.log("SIGNUP STATUS:", error.response?.status);

            console.log(
                "SIGNUP RESPONSE:",
                JSON.stringify(error.response?.data, null, 2)
            );

            Toast.show({
                type: "error",
                text1: "Signup Failed",
                text2:
                    error.response?.data?.message ||
                    "Unable to create account. Please try again.",
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
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={23}
                        color="#0F172A"
                    />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logo}>
                        <Ionicons
                            name="navigate"
                            size={32}
                            color="#FFFFFF"
                        />
                    </View>

                    <Text style={styles.brand}>MapMate</Text>

                    <Text style={styles.tagline}>
                        Your next adventure starts here.
                    </Text>
                </View>

                {/* Signup Card */}
                <View style={styles.card}>
                    <Text style={styles.heading}>
                        Create Account
                    </Text>

                    <Text style={styles.description}>
                        Join us and start exploring the world.
                    </Text>

                    {/* Full Name */}
                    <Text style={styles.label}>Full Name</Text>

                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="person-outline"
                            size={20}
                            color="#94A3B8"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            placeholderTextColor="#94A3B8"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email */}
                    <Text style={styles.label}>Email Address</Text>

                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color="#94A3B8"
                        />

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

                    {/* Password */}
                    <Text style={styles.label}>Password</Text>

                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color="#94A3B8"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            placeholderTextColor="#94A3B8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() =>
                                setShowPassword(!showPassword)
                            }
                            activeOpacity={0.7}
                            hitSlop={10}
                        >
                            <Ionicons
                                name={
                                    showPassword
                                        ? "eye-off-outline"
                                        : "eye-outline"
                                }
                                size={21}
                                color="#64748B"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <Text style={styles.label}>
                        Confirm Password
                    </Text>

                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="shield-checkmark-outline"
                            size={20}
                            color="#94A3B8"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            placeholderTextColor="#94A3B8"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() =>
                                setShowConfirmPassword(
                                    !showConfirmPassword
                                )
                            }
                            activeOpacity={0.7}
                            hitSlop={10}
                        >
                            <Ionicons
                                name={
                                    showConfirmPassword
                                        ? "eye-off-outline"
                                        : "eye-outline"
                                }
                                size={21}
                                color="#64748B"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Create Account Button */}
                    <TouchableOpacity
                        style={[
                            styles.signupButton,
                            loading && styles.disabledButton,
                        ]}
                        onPress={handleSignup}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>
                                    Create Account
                                </Text>

                                <Ionicons
                                    name="arrow-forward"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Login Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Already have an account?
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.loginText}>
                                {" "}Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.bottomText}>
                    Discover places. Create memories.
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
        paddingVertical: 30,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        elevation: 2,
    },

    header: {
        alignItems: "center",
        marginBottom: 27,
    },

    logo: {
        width: 68,
        height: 68,
        borderRadius: 23,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        elevation: 7,
    },

    brand: {
        fontSize: 29,
        fontWeight: "800",
        color: "#0F172A",
        marginTop: 12,
    },

    tagline: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 5,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 25,
        padding: 23,
        elevation: 7,
        shadowColor: "#0F172A",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: {
            width: 0,
            height: 7,
        },
    },

    heading: {
        fontSize: 25,
        fontWeight: "800",
        color: "#0F172A",
    },

    description: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 6,
        marginBottom: 23,
    },

    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 8,
    },

    inputContainer: {
        height: 53,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 13,
        paddingHorizontal: 13,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 17,
        backgroundColor: "#F8FAFC",
    },

    input: {
        flex: 1,
        fontSize: 14,
        color: "#0F172A",
        marginLeft: 10,
    },

    eyeButton: {
        width: 32,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },

    signupButton: {
        height: 55,
        borderRadius: 14,
        backgroundColor: "#2563EB",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        marginTop: 5,
        elevation: 4,
    },

    disabledButton: {
        opacity: 0.7,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },

    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 23,
    },

    footerText: {
        color: "#64748B",
        fontSize: 13,
    },

    loginText: {
        color: "#2563EB",
        fontWeight: "800",
        fontSize: 13,
    },

    bottomText: {
        textAlign: "center",
        color: "#94A3B8",
        fontSize: 12,
        marginTop: 24,
    },
});
