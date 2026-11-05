
import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    StatusBar,
    Alert,
} from "react-native";

import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        getCurrentLocation();
    }, []);

    // Get user's current location
    const getCurrentLocation = async () => {
        try {
            setLoading(true);

            const permission =
                await Location.requestForegroundPermissionsAsync();

            if (permission.status !== "granted") {
                Alert.alert(
                    "Location Permission",
                    "Please allow location access to show your current location."
                );
                return;
            }

            const currentLocation =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

            setLocation({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
            });
        } catch (error) {
            console.log("Location Error:", error);
            Alert.alert(
                "Location Error",
                "Unable to get your current location."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchText.trim()) {
            navigation.navigate("Search");
            return;
        }

        navigation.navigate("Search", {
            searchText: searchText.trim(),
        });
    };

    const quickActions = [
        {
            title: "Restaurants",
            icon: "restaurant-outline",
            color: "#FFF0E6",
            iconColor: "#F97316",
        },
        {
            title: "Hotels",
            icon: "bed-outline",
            color: "#EDE9FE",
            iconColor: "#7C3AED",
        },
        {
            title: "Hospitals",
            icon: "medkit-outline",
            color: "#FCE7F3",
            iconColor: "#DB2777",
        },
        {
            title: "ATMs",
            icon: "cash-outline",
            color: "#DCFCE7",
            iconColor: "#16A34A",
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Top Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Explore the world</Text>
                    <Text style={styles.heading}>Where to go today?</Text>
                </View>

                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate("Profile")}
                >
                    <Ionicons
                        name="person-outline"
                        size={23}
                        color="#2563EB"
                    />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.searchContainer}
                onPress={() => navigation.navigate("Search")}
            >
                <Ionicons name="search" size={22} color="#2563EB" />

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search places, addresses..."
                    placeholderTextColor="#94A3B8"
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />

                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                >
                    <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Map Section */}
            <View style={styles.mapContainer}>
                {loading && !location ? (
                    <View style={styles.mapLoading}>
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text style={styles.loadingText}>
                            Finding your location...
                        </Text>
                    </View>
                ) : location ? (
                    <MapView
                        style={styles.map}
                        initialRegion={location}
                        showsUserLocation={true}
                        showsMyLocationButton={false}
                        showsCompass={true}
                        toolbarEnabled={false}
                    >
                        <Marker
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }}
                            title="Your Location"
                            description="You are here"
                        />
                    </MapView>
                ) : (
                    <View style={styles.mapLoading}>
                        <Ionicons
                            name="location-outline"
                            size={42}
                            color="#64748B"
                        />

                        <Text style={styles.loadingText}>
                            Location unavailable
                        </Text>

                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={getCurrentLocation}
                        >
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Map Label */}
                <View style={styles.mapLabel}>
                    <Ionicons
                        name="navigate-circle"
                        size={19}
                        color="#2563EB"
                    />
                    <Text style={styles.mapLabelText}>Your Location</Text>
                </View>

                {/* My Location Button */}
                <TouchableOpacity
                    style={styles.myLocationButton}
                    onPress={getCurrentLocation}
                >
                    <Ionicons
                        name="locate"
                        size={23}
                        color="#2563EB"
                    />
                </TouchableOpacity>
            </View>

            {/* Explore Section */}
            <View style={styles.exploreHeader}>
                <View>
                    <Text style={styles.sectionTitle}>Explore Nearby</Text>
                    <Text style={styles.sectionSubtitle}>
                        Discover places around you
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate("Search")}
                >
                    <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Categories */}
            <View style={styles.categories}>
                {quickActions.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.categoryItem}
                        onPress={() =>
                            navigation.navigate("Search", {
                                category: item.title,
                            })
                        }
                    >
                        <View
                            style={[
                                styles.categoryIcon,
                                { backgroundColor: item.color },
                            ]}
                        >
                            <Ionicons
                                name={item.icon}
                                size={25}
                                color={item.iconColor}
                            />
                        </View>

                        <Text style={styles.categoryTitle}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bottom Navigation Hint */}
            <TouchableOpacity
                style={styles.savedBanner}
                onPress={() => navigation.navigate("Saved")}
            >
                <View style={styles.savedIcon}>
                    <Ionicons
                        name="bookmark"
                        size={21}
                        color="#FFFFFF"
                    />
                </View>

                <View style={styles.savedContent}>
                    <Text style={styles.savedTitle}>Your saved places</Text>
                    <Text style={styles.savedSubtitle}>
                        Access your favorite destinations
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={21}
                    color="#64748B"
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingTop: 48,
        paddingHorizontal: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    greeting: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
    },

    heading: {
        fontSize: 23,
        fontWeight: "800",
        color: "#0F172A",
        marginTop: 4,
    },

    profileButton: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
    },

    searchContainer: {
        height: 58,
        backgroundColor: "#FFFFFF",
        borderRadius: 17,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        marginBottom: 18,
    },

    searchInput: {
        flex: 1,
        marginLeft: 11,
        fontSize: 14,
        color: "#0F172A",
    },

    searchButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },

    mapContainer: {
        height: 280,
        borderRadius: 23,
        overflow: "hidden",
        backgroundColor: "#E2E8F0",
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },

    map: {
        flex: 1,
    },

    mapLoading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E2E8F0",
    },

    loadingText: {
        color: "#475569",
        fontSize: 13,
        marginTop: 12,
    },

    mapLabel: {
        position: "absolute",
        top: 14,
        left: 14,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        elevation: 3,
    },

    mapLabelText: {
        color: "#1E293B",
        fontSize: 12,
        fontWeight: "700",
    },

    myLocationButton: {
        position: "absolute",
        bottom: 15,
        right: 15,
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },

    retryButton: {
        marginTop: 12,
        backgroundColor: "#2563EB",
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 10,
    },

    retryText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    exploreHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 23,
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0F172A",
    },

    sectionSubtitle: {
        color: "#94A3B8",
        fontSize: 12,
        marginTop: 4,
    },

    seeAll: {
        color: "#2563EB",
        fontWeight: "700",
        fontSize: 13,
    },

    categories: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 22,
    },

    categoryItem: {
        alignItems: "center",
        width: "23%",
    },

    categoryIcon: {
        width: 58,
        height: 58,
        borderRadius: 19,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },

    categoryTitle: {
        fontSize: 11,
        fontWeight: "600",
        color: "#334155",
    },

    savedBanner: {
        backgroundColor: "#FFFFFF",
        borderRadius: 17,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
    },

    savedIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },

    savedContent: {
        flex: 1,
        marginLeft: 12,
    },

    savedTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
    },

    savedSubtitle: {
        fontSize: 11,
        color: "#94A3B8",
        marginTop: 4,
    },
});
