
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

export default function SavedPlacesScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState("All");

    const [savedPlaces] = useState([]);

    const tabs = ["All", "Favorites", "Visited"];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.heading}>Saved Places</Text>
                    <Text style={styles.subtitle}>
                        Your favorite destinations in one place
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate("Search")}
                >
                    <Ionicons name="add" size={25} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsCard}>
                <View style={styles.statsIcon}>
                    <Ionicons
                        name="bookmark"
                        size={25}
                        color="#FFFFFF"
                    />
                </View>

                <View style={styles.statsContent}>
                    <Text style={styles.statsNumber}>
                        {savedPlaces.length}
                    </Text>
                    <Text style={styles.statsLabel}>
                        Places saved
                    </Text>
                </View>

                <Ionicons
                    name="location-outline"
                    size={45}
                    color="#BFDBFE"
                />
            </View>

            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            activeTab === tab && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText,
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {savedPlaces.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIcon}>
                            <Ionicons
                                name="bookmark-outline"
                                size={48}
                                color="#2563EB"
                            />
                        </View>

                        <Text style={styles.emptyTitle}>
                            No saved places yet
                        </Text>

                        <Text style={styles.emptySubtitle}>
                            Save your favorite places and easily find
                            them whenever you need them.
                        </Text>

                        <TouchableOpacity
                            style={styles.exploreButton}
                            onPress={() => navigation.navigate("Search")}
                        >
                            <Ionicons
                                name="compass-outline"
                                size={19}
                                color="#FFFFFF"
                            />

                            <Text style={styles.exploreButtonText}>
                                Explore Places
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    savedPlaces.map((place, index) => (
                        <TouchableOpacity
                            key={place._id || index}
                            style={styles.placeCard}
                        >
                            <Text>{place.name}</Text>
                        </TouchableOpacity>
                    ))
                )}
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
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 23,
    },

    heading: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0F172A",
    },

    subtitle: {
        color: "#64748B",
        fontSize: 12,
        marginTop: 5,
    },

    addButton: {
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },

    statsCard: {
        height: 115,
        backgroundColor: "#2563EB",
        borderRadius: 22,
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 23,
    },

    statsIcon: {
        width: 49,
        height: 49,
        borderRadius: 15,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
    },

    statsContent: {
        flex: 1,
        marginLeft: 15,
    },

    statsNumber: {
        fontSize: 27,
        color: "#FFFFFF",
        fontWeight: "800",
    },

    statsLabel: {
        color: "#DBEAFE",
        fontSize: 12,
        marginTop: 3,
    },

    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#E2E8F0",
        padding: 5,
        borderRadius: 14,
        marginBottom: 20,
    },

    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 11,
        borderRadius: 10,
    },

    activeTab: {
        backgroundColor: "#FFFFFF",
        elevation: 2,
    },

    tabText: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
    },

    activeTabText: {
        color: "#2563EB",
        fontWeight: "800",
    },

    scrollContent: {
        flexGrow: 1,
    },

    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 48,
    },

    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 32,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 23,
    },

    emptyTitle: {
        fontSize: 19,
        fontWeight: "800",
        color: "#0F172A",
    },

    emptySubtitle: {
        fontSize: 13,
        color: "#94A3B8",
        textAlign: "center",
        lineHeight: 21,
        marginTop: 10,
        maxWidth: 270,
    },

    exploreButton: {
        backgroundColor: "#2563EB",
        borderRadius: 14,
        paddingHorizontal: 23,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        marginTop: 23,
    },

    exploreButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },

    placeCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
    },
});
