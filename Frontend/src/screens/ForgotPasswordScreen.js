
import React, { useRef, useState } from "react";

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
import api from "../services/api";

export default function ForgotPasswordScreen({ navigation }) {
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const otpInputRef = useRef(null);

    // Step 1: Send OTP
    const handleSendOTP = async () => {
        if (loading) return;

        if (!email.trim()) {
            Toast.show({
                type: "error",
                text1: "Email Required",
                text2: "Please enter your registered email.",
            });
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/forgot-password", {
                email: email.trim().toLowerCase(),
            });

            setOtp("");
            setResetToken("");
            setStep(2);

            Toast.show({
                type: "success",
                text1: "OTP Sent!",
                text2: response.data.message || "Check your email for the 6-digit OTP.",
            });
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "OTP Failed",
                text2:
                    error.response?.data?.message ||
                    "Unable to send OTP. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async () => {
        if (loading) return;

        if (otp.length !== 6) {
            Toast.show({
                type: "error",
                text1: "Invalid OTP",
                text2: "Please enter all 6 digits.",
            });
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/verify-otp", {
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
            });

            // Backend returns resetToken after successful OTP verification
            const token =
                response.data.resetToken ||
                response.data.data?.resetToken;

            if (!token) {
                throw new Error("Reset token was not received from server.");
            }

            setResetToken(token);
            setStep(3);

            Toast.show({
                type: "success",
                text1: "OTP Verified!",
                text2: "Now create your new password.",
            });
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Verification Failed",
                text2:
                    error.response?.data?.message ||
                    error.message ||
                    "Invalid OTP. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async () => {
        if (loading) return;

        if (!newPassword || !confirmPassword) {
            Toast.show({
                type: "error",
                text1: "Missing Details",
                text2: "Please fill in both password fields.",
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: "error",
                text1: "Weak Password",
                text2: "Password must be at least 6 characters.",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: "error",
                text1: "Password Mismatch",
                text2: "Both passwords must match.",
            });
            return;
        }

        if (!resetToken) {
            Toast.show({
                type: "error",
                text1: "Session Expired",
                text2: "Please verify your OTP again.",
            });
            setStep(2);
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/reset-password", {
                email: email.trim().toLowerCase(),
                resetToken,
                newPassword,
            });

            Toast.show({
                type: "success",
                text1: "Password Reset Successful!",
                text2: response.data.message || "You can now login with your new password.",
            });

            setTimeout(() => {
                navigation.navigate("Login");
            }, 1500);

        } catch (error) {
    Toast.show({
        type: "error",
        text1: "OTP Failed",
        text2:
            error.response?.data?.message ||
            "Unable to send OTP. Please try again.",
    });
} finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (value) => {
        const digits = value.replace(/[^0-9]/g, "").slice(0, 6);
        setOtp(digits);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Ionicons name="arrow-back" size={22} color="#1E293B" />
                </TouchableOpacity>

                <View style={styles.iconContainer}>
                    <Ionicons
                        name={
                            step === 2
                                ? "mail-open-outline"
                                : step === 3
                                ? "lock-open-outline"
                                : "lock-closed-outline"
                        }
                        size={38}
                        color="#2563EB"
                    />
                </View>

                <Text style={styles.title}>
                    {step === 1
                        ? "Forgot Password?"
                        : step === 2
                        ? "Verify Your Email"
                        : "Create New Password"}
                </Text>

                <Text style={styles.subtitle}>
                    {step === 1
                        ? "Enter your registered email address to receive a verification code."
                        : step === 2
                        ? `We've sent a 6-digit verification code to ${email.trim()}`
                        : "Your identity is verified. Create a strong new password."}
                </Text>

                {/* Main Card */}
                <View style={styles.card}>

                    {/* STEP 1: EMAIL */}
                    {step === 1 && (
                        <>
                            <Text style={styles.label}>Email Address</Text>

                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color="#64748B"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    loading && styles.disabledButton,
                                ]}
                                onPress={handleSendOTP}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>
                                            Send Verification Code
                                        </Text>
                                        <Ionicons
                                            name="arrow-forward"
                                            size={19}
                                            color="#FFFFFF"
                                        />
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                    {/* STEP 2: SIX DIGIT OTP */}
                    {step === 2 && (
                        <>
                            <Text style={styles.label}>
                                Enter 6-Digit OTP
                            </Text>

                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.otpContainer}
                                onPress={() => otpInputRef.current?.focus()}
                            >
                                <View style={styles.otpBoxes}>
                                    {Array.from({ length: 6 }).map((_, index) => {
                                        const isActive = index === otp.length;
                                        const digit = otp[index] || "";

                                        return (
                                            <View
                                                key={index}
                                                style={[
                                                    styles.otpBox,
                                                    isActive && styles.otpBoxActive,
                                                    digit && styles.otpBoxFilled,
                                                ]}
                                            >
                                                <Text style={styles.otpDigit}>
                                                    {digit}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>

                                <TextInput
                                    ref={otpInputRef}
                                    style={styles.hiddenOtpInput}
                                    value={otp}
                                    onChangeText={handleOtpChange}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    textContentType="oneTimeCode"
                                    autoComplete="one-time-code"
                                    importantForAutofill="yes"
                                    caretHidden
                                    autoFocus
                                />
                            </TouchableOpacity>

                            <Text style={styles.otpHint}>
                                Enter the verification code received in your email.
                            </Text>

                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    loading && styles.disabledButton,
                                ]}
                                onPress={handleVerifyOTP}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>
                                            Verify OTP
                                        </Text>
                                        <Ionicons
                                            name="shield-checkmark-outline"
                                            size={20}
                                            color="#FFFFFF"
                                        />
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={styles.resendContainer}>
                                <Text style={styles.resendText}>
                                    Didn't receive the code?
                                </Text>

                                <TouchableOpacity
                                    onPress={handleSendOTP}
                                    disabled={loading}
                                >
                                    <Text style={styles.resendLink}>
                                        Resend OTP
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => {
                                    setStep(1);
                                    setOtp("");
                                    setResetToken("");
                                }}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Change Email Address
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* STEP 3: NEW PASSWORD */}
                    {step === 3 && (
                        <>
                            <Text style={styles.label}>New Password</Text>

                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#64748B"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry={!showPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    autoCapitalize="none"
                                />

                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={21}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>
                                Confirm New Password
                            </Text>

                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#64748B"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    autoCapitalize="none"
                                />

                                <TouchableOpacity
                                    onPress={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    style={styles.eyeButton}
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

                            <Text style={styles.passwordHint}>
                                Password must contain at least 6 characters.
                            </Text>

                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    loading && styles.disabledButton,
                                ]}
                                onPress={handleResetPassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>
                                            Reset Password
                                        </Text>
                                        <Ionicons
                                            name="checkmark-circle-outline"
                                            size={20}
                                            color="#FFFFFF"
                                        />
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <Text style={styles.footerText}>
                    Remember your password?{" "}
                    <Text
                        style={styles.loginLink}
                        onPress={() => navigation.navigate("Login")}
                    >
                        Login
                    </Text>
                </Text>

                <Text style={styles.bottomText}>
                    MAPMATE • EXPLORE WITHOUT LIMITS
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
        padding: 24,
        paddingTop: 45,
        paddingBottom: 35,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
        elevation: 2,
    },

    iconContainer: {
        width: 76,
        height: 76,
        borderRadius: 24,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 22,
    },

    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#0F172A",
    },

    subtitle: {
        fontSize: 14,
        color: "#64748B",
        lineHeight: 22,
        marginTop: 10,
        marginBottom: 28,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 22,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 5 },
    },

    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 10,
        marginTop: 12,
    },

    inputContainer: {
        height: 54,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        backgroundColor: "#F8FAFC",
    },

    input: {
        flex: 1,
        marginLeft: 11,
        color: "#0F172A",
        fontSize: 14,
    },

    eyeButton: {
        width: 32,
        height: 42,
        justifyContent: "center",
        alignItems: "center",
    },

    otpContainer: {
        marginTop: 12,
        position: "relative",
        justifyContent: "center",
    },

    otpBoxes: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 7,
    },

    otpBox: {
        flex: 1,
        height: 57,
        borderWidth: 1.5,
        borderColor: "#CBD5E1",
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
    },

    otpBoxActive: {
        borderColor: "#2563EB",
        backgroundColor: "#EFF6FF",
    },

    otpBoxFilled: {
        borderColor: "#2563EB",
        backgroundColor: "#DBEAFE",
    },

    otpDigit: {
        fontSize: 23,
        fontWeight: "800",
        color: "#1E293B",
    },

    hiddenOtpInput: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        opacity: 0.02,
        color: "transparent",
    },

    otpHint: {
        color: "#94A3B8",
        fontSize: 12,
        textAlign: "center",
        marginTop: 13,
        lineHeight: 19,
    },

    primaryButton: {
        height: 54,
        borderRadius: 14,
        backgroundColor: "#2563EB",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 9,
        marginTop: 25,
    },

    disabledButton: {
        opacity: 0.65,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },

    resendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 5,
        marginTop: 22,
    },

    resendText: {
        color: "#64748B",
        fontSize: 13,
    },

    resendLink: {
        color: "#2563EB",
        fontWeight: "800",
        fontSize: 13,
    },

    secondaryButton: {
        alignItems: "center",
        padding: 12,
        marginTop: 7,
    },

    secondaryButtonText: {
        color: "#2563EB",
        fontWeight: "700",
        fontSize: 13,
    },

    passwordHint: {
        fontSize: 11,
        color: "#94A3B8",
        marginTop: 9,
    },

    footerText: {
        textAlign: "center",
        color: "#64748B",
        marginTop: 25,
        fontSize: 13,
    },

    loginLink: {
        color: "#2563EB",
        fontWeight: "800",
    },

    bottomText: {
        textAlign: "center",
        color: "#94A3B8",
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 2,
        marginTop: 28,
    },
});
