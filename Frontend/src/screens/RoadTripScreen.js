
import React, { useState } from "react";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function RoadTripScreen({ navigation }) {
    const [selectedTab, setSelectedTab] = useState("All Trips");

    const tabs = ["All Trips", "Upcoming", "Completed"];

    const features = [
        {
            icon: "map-outline",
            title: "Plan Your Route",
            description: "Choose your starting point and destination.",
        },
        {
            icon: "car-sport-outline",
            title: "Discover Stops",
            description: "Find interesting places along your journey.",
        },
        {
            icon: "wallet-outline",
            title: "Track Expenses",
            description: "Keep your travel budget organized.",
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.heading}>Road Trips</Text>
                    <Text style={styles.subtitle}>
                        Plan your next adventure
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate("Search")}
                >
                    <Ionicons
                        name="add"
                        size={25}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.heroCard}>
                    <View style={styles.heroContent}>
                        <View style={styles.heroBadge}>
                            <Ionicons
                                name="compass"
                                size={14}
                                color="#FFFFFF"
                            />
                            <Text style={styles.heroBadgeText}>
                                YOUR NEXT ADVENTURE
                            </Text>
                        </View>

                        <Text style={styles.heroTitle}>
                            Every journey{"\n"}starts somewhere.
                        </Text>

                        <Text style={styles.heroSubtitle}>
                            Create memorable trips and explore
                            new destinations.
                        </Text>

                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate("Search")}
                        >
                            <Text style={styles.createButtonText}>
                                Plan a Trip
                            </Text>

                            <Ionicons
                                name="arrow-forward"
                                size={17}
                                color="#2563EB"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroDecoration}>
                        <Ionicons
                            name="navigate-circle"
                            size={100}
                            color="#93C5FD"
                        />
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Trips</Text>

                    <Text style={styles.tripCount}>0 Trips</Text>
                </View>

                <View style={styles.tabContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                selectedTab === tab && styles.activeTab,
                            ]}
                            onPress={() => setSelectedTab(tab)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedTab === tab &&
                                        styles.activeTabText,
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIcon}>
                        <Ionicons
                            name="car-sport-outline"
                            size={43}
                            color="#2563EB"
                        />
                    </View>

                    <Text style={styles.emptyTitle}>
                        No trips planned yet
                    </Text>

                    <Text style={styles.emptySubtitle}>
                        Your travel adventures will appear here.
                        Start planning your first road trip!
                    </Text>

                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate("Search")}
                    >
                        <Ionicons
                            name="add"
                            size={20}
                            color="#FFFFFF"
                        />

                        <Text style={styles.emptyButtonText}>
                            Create Your First Trip
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>
                    What you can do
                </Text>

                {features.map((feature, index) => (
                    <View key={index} style={styles.featureCard}>
                        <View style={styles.featureIcon}>
                            <Ionicons
                                name={feature.icon}
                                size={23}
                                color="#2563EB"
                            />
                        </View>

                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>
                                {feature.title}
                            </Text>

                            <Text style={styles.featureDescription}>
                                {feature.description}
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={19}
                            color="#94A3B8"
                        />
                    </View>
                ))}
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
        marginBottom: 22,
    },

    heading: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0F172A",
    },

    subtitle: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 5,
    },

    headerButton: {
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },

    heroCard: {
        backgroundColor: "#1D4ED8",
        borderRadius: 23,
        padding: 22,
        minHeight: 235,
        overflow: "hidden",
        marginBottom: 27,
    },

    heroContent: {
        zIndex: 1,
    },

    heroBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        backgroundColor: "#3B82F6",
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 20,
    },

    heroBadgeText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "800",
        letterSpacing: 0.7,
    },

    heroTitle: {
        fontSize: 26,
        fontWeight: "900",
        color: "#FFFFFF",
        marginTop: 16,
        lineHeight: 33,
    },

    heroSubtitle: {
        color: "#DBEAFE",
        fontSize: 12,
        lineHeight: 19,
        marginTop: 8,
        maxWidth: 230,
    },

    createButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 11,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 10,
        marginTop: 16,
    },

    createButtonText: {
        color: "#1D4ED8",
        fontSize: 12,
        fontWeight: "800",
    },

    heroDecoration: {
        position: "absolute",
        right: -12,
        bottom: 12,
        opacity: 0.55,
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 14,
    },

    tripCount: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "600",
    },

    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#E2E8F0",
        padding: 5,
        borderRadius: 13,
        marginBottom: 15,
    },

    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,
        borderRadius: 9,
    },

    activeTab: {
        backgroundColor: "#FFFFFF",
        elevation: 2,
    },

    tabText: {
        color: "#64748B",
        fontSize: 11,
        fontWeight: "600",
    },

    activeTabText: {
        color: "#2563EB",
        fontWeight: "800",
    },

    emptyContainer: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 23,
        marginBottom: 27,
    },

    emptyIcon: {
        width: 85,
        height: 85,
        borderRadius: 27,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },

    emptyTitle: {
        color: "#0F172A",
        fontSize: 17,
        fontWeight: "800",
    },

    emptySubtitle: {
        color: "#94A3B8",
        fontSize: 12,
        lineHeight: 19,
        textAlign: "center",
        marginTop: 9,
    },

    emptyButton: {
        backgroundColor: "#2563EB",
        borderRadius: 13,
        paddingHorizontal: 18,
        paddingVertical: 13,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        marginTop: 18,
    },

    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },

    featureCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: 14,
        marginBottom: 11,
    },

    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 13,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
    },

    featureContent: {
        flex: 1,
        marginLeft: 12,
    },

    featureTitle: {
        color: "#0F172A",
        fontSize: 13,
        fontWeight: "700",
    },

    featureDescription: {
        color: "#94A3B8",
        fontSize: 11,
        marginTop: 4,
    },
});
