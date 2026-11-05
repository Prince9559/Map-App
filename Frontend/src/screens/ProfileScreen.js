
import React from "react";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.log("Logout Error:", error.message);
                            Alert.alert("Error", "Unable to logout.");
                        }
                    },
                },
            ]
        );
    };

    const menuItems = [
        {
            title: "Edit Profile",
            subtitle: "Update your personal information",
            icon: "person-outline",
            action: () => navigation.navigate("EditProfile"),
        },
        {
            title: "Saved Places",
            subtitle: "Your favorite destinations",
            icon: "bookmark-outline",
            action: () => navigation.navigate("Saved"),
        },
        {
            title: "Road Trips",
            subtitle: "Manage your travel plans",
            icon: "car-sport-outline",
            action: () => navigation.navigate("Trips"),
        },
        {
            title: "AI Travel Assistant",
            subtitle: "Get help planning your journey",
            icon: "sparkles-outline",
            action: () => navigation.navigate("AIAssistant"),
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={styles.heading}>My Profile</Text>

                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() =>
                        Alert.alert(
                            "Settings",
                            "More settings will be available soon."
                        )
                    }
                >
                    <Ionicons
                        name="settings-outline"
                        size={22}
                        color="#334155"
                    />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(user?.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                        </Text>
                    </View>

                    <Text style={styles.userName}>
                        {user?.name || "MapMate User"}
                    </Text>

                    <Text style={styles.userEmail}>
                        {user?.email || "No email available"}
                    </Text>

                    <View style={styles.memberBadge}>
                        <Ionicons
                            name="shield-checkmark"
                            size={14}
                            color="#2563EB"
                        />

                        <Text style={styles.memberText}>
                            MapMate Member
                        </Text>
                    </View>
                </View>

                {/* Account Overview */}
                <Text style={styles.sectionTitle}>
                    Account
                </Text>

                <View style={styles.menuCard}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.action}
                        >
                            <View style={styles.menuIcon}>
                                <Ionicons
                                    name={item.icon}
                                    size={22}
                                    color="#2563EB"
                                />
                            </View>

                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>
                                    {item.title}
                                </Text>

                                <Text style={styles.menuSubtitle}>
                                    {item.subtitle}
                                </Text>
                            </View>

                            <Ionicons
                                name="chevron-forward"
                                size={19}
                                color="#94A3B8"
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Support */}
                <Text style={styles.sectionTitle}>
                    Support
                </Text>

                <View style={styles.menuCard}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() =>
                            Alert.alert(
                                "Help & Support",
                                "Support information will be available soon."
                            )
                        }
                    >
                        <View style={styles.menuIcon}>
                            <Ionicons
                                name="help-circle-outline"
                                size={22}
                                color="#2563EB"
                            />
                        </View>

                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>
                                Help & Support
                            </Text>

                            <Text style={styles.menuSubtitle}>
                                Get assistance with MapMate
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={19}
                            color="#94A3B8"
                        />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={21}
                        color="#DC2626"
                    />

                    <Text style={styles.logoutText}>
                        Logout
                    </Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>
                    MapMate · Version 1.0.0
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingTop: 52,
        paddingHorizontal: 20,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 23,
    },

    heading: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0F172A",
    },

    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },

    profileCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        alignItems: "center",
        paddingVertical: 25,
        marginBottom: 25,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 9,
    },

    avatar: {
        width: 85,
        height: 85,
        borderRadius: 29,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },

    avatarText: {
        color: "#2563EB",
        fontSize: 36,
        fontWeight: "800",
    },

    userName: {
        color: "#0F172A",
        fontSize: 20,
        fontWeight: "800",
    },

    userEmail: {
        color: "#94A3B8",
        fontSize: 12,
        marginTop: 6,
    },

    memberBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#DBEAFE",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        marginTop: 13,
    },

    memberText: {
        color: "#2563EB",
        fontSize: 11,
        fontWeight: "700",
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 13,
    },

    menuCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        paddingHorizontal: 13,
        marginBottom: 24,
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },

    menuIcon: {
        width: 43,
        height: 43,
        borderRadius: 13,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
    },

    menuContent: {
        flex: 1,
        marginLeft: 12,
    },

    menuTitle: {
        color: "#1E293B",
        fontSize: 13,
        fontWeight: "700",
    },

    menuSubtitle: {
        color: "#94A3B8",
        fontSize: 10,
        marginTop: 4,
    },

    logoutButton: {
        height: 53,
        backgroundColor: "#FEE2E2",
        borderRadius: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 9,
        marginTop: 2,
    },

    logoutText: {
        color: "#DC2626",
        fontSize: 14,
        fontWeight: "800",
    },

    versionText: {
        color: "#94A3B8",
        textAlign: "center",
        fontSize: 11,
        marginVertical: 22,
    },
});
