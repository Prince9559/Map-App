
import React, { useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

import {
    searchLocations,
    getNearbyPlaces,
} from "../services/places.service";

export default function SearchScreen({ navigation, route }) {
    const [searchText, setSearchText] = useState(
        route?.params?.searchText || ""
    );

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const categories = [
        {
            title: "Restaurants",
            type: "restaurant",
            icon: "restaurant-outline",
            color: "#FFF0E6",
        },
        {
            title: "Hotels",
            type: "hotel",
            icon: "bed-outline",
            color: "#EDE9FE",
        },
        {
            title: "Hospitals",
            type: "hospital",
            icon: "medkit-outline",
            color: "#FCE7F3",
        },
        {
            title: "Shopping",
            type: "shopping_mall",
            icon: "cart-outline",
            color: "#DBEAFE",
        },
        {
            title: "ATMs",
            type: "atm",
            icon: "cash-outline",
            color: "#DCFCE7",
        },
        {
            title: "Gas Stations",
            type: "gas_station",
            icon: "car-outline",
            color: "#FEF3C7",
        },
        {
            title: "Cafes",
            type: "cafe",
            icon: "cafe-outline",
            color: "#FCE7F3",
        },
        {
            title: "Pharmacies",
            type: "pharmacy",
            icon: "medkit-outline",
            color: "#DCFCE7",
        },
        {
            title: "Police Stations",
            type: "police",
            icon: "shield-checkmark-outline",
            color: "#DBEAFE",
        },
    ];

    // Normal text search for a specific place name
    const handleSearch = async (query = searchText) => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            setError("Please enter a place name or category.");
            return;
        }

        setSearchText(trimmedQuery);
        setLoading(true);
        setError("");
        setPlaces([]);
        setHasSearched(true);

        try {
            const results = await searchLocations(trimmedQuery);
            setPlaces(results);
        } catch (err) {
            console.log(
                "Search Error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to search places. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Nearby category search using current GPS location
    const handleCategorySearch = async (category) => {
        setSearchText(category.title);
        setLoading(true);
        setError("");
        setPlaces([]);
        setHasSearched(true);

        try {
            // Request location permission
            const permission =
                await Location.requestForegroundPermissionsAsync();

            if (permission.status !== "granted") {
                throw new Error(
                    "Location permission denied. Please allow location access to find nearby places."
                );
            }

            // Get current GPS location
            const currentLocation =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

            const latitude = currentLocation.coords.latitude;
            const longitude = currentLocation.coords.longitude;

            console.log("Current Location:", {
                latitude,
                longitude,
            });

            // Fetch nearby places within 1500 meters
            const results = await getNearbyPlaces({
                latitude,
                longitude,
                radius: 1500,
                type: category.type,
            });

            console.log(
                "Nearby Category:",
                category.title,
                "Results:",
                results
            );

            setPlaces(Array.isArray(results) ? results : []);

        } catch (err) {
            console.log(
                "Nearby Search Error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to find nearby places. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const openPlaceDetails = (place) => {
        if (!place?.placeId) {
            return;
        }

        navigation.navigate("PlaceDetails", {
            placeId: place.placeId,
        });
    };

    const clearSearch = () => {
        setSearchText("");
        setPlaces([]);
        setError("");
        setHasSearched(false);
    };

    const popularSearches = [
        { label: "Restaurants", type: "restaurant" },
        { label: "Hotels", type: "hotel" },
        { label: "Hospitals", type: "hospital" },
        { label: "Coffee shops", type: "cafe" },
        { label: "ATMs", type: "atm" },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.heading}>Discover Places</Text>
                    <Text style={styles.subtitle}>
                        Find restaurants, hotels and more
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={clearSearch}
                >
                    <Ionicons
                        name="refresh-outline"
                        size={21}
                        color="#2563EB"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
                <Ionicons name="search" size={22} color="#2563EB" />

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search restaurants, hotels, ATMs..."
                    placeholderTextColor="#94A3B8"
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={() => handleSearch()}
                    returnKeyType="search"
                />

                {searchText.length > 0 && (
                    <TouchableOpacity onPress={clearSearch}>
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color="#94A3B8"
                        />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {!hasSearched && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Explore Categories
                        </Text>

                        <View style={styles.categoryGrid}>
                            {categories.map((item) => (
                                <TouchableOpacity
                                    key={item.title}
                                    style={styles.categoryCard}
                                    onPress={() =>
                                        handleCategorySearch(item)
                                    }
                                    disabled={loading}
                                >
                                    <View
                                        style={[
                                            styles.categoryIcon,
                                            {
                                                backgroundColor: item.color,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={item.icon}
                                            size={25}
                                            color="#2563EB"
                                        />
                                    </View>

                                    <Text style={styles.categoryTitle}>
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>
                            Popular Searches
                        </Text>

                        {popularSearches.map((item) => (
                            <TouchableOpacity
                                key={item.label}
                                style={styles.popularItem}
                                onPress={() =>
                                    handleCategorySearch(item)
                                }
                                disabled={loading}
                            >
                                <View style={styles.popularIcon}>
                                    <Ionicons
                                        name="time-outline"
                                        size={19}
                                        color="#64748B"
                                    />
                                </View>

                                <Text style={styles.popularText}>
                                    {item.label}
                                </Text>

                                <Ionicons
                                    name="arrow-up-outline"
                                    size={18}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {loading && (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator
                            size="large"
                            color="#2563EB"
                        />
                        <Text style={styles.loadingText}>
                            Finding nearby places...
                        </Text>
                    </View>
                )}

                {!!error && !loading && (
                    <View style={styles.messageContainer}>
                        <Ionicons
                            name="alert-circle-outline"
                            size={28}
                            color="#DC2626"
                        />
                        <Text style={styles.errorText}>
                            {error}
                        </Text>
                    </View>
                )}

                {hasSearched && !loading && !error && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Search Results ({places.length})
                        </Text>

                        {places.length === 0 ? (
                            <View style={styles.messageContainer}>
                                <Ionicons
                                    name="location-outline"
                                    size={32}
                                    color="#94A3B8"
                                />
                                <Text style={styles.emptyTitle}>
                                    No places found
                                </Text>
                                <Text style={styles.emptyText}>
                                    Try another name or category.
                                </Text>
                            </View>
                        ) : (
                            places.map((place, index) => (
                                <TouchableOpacity
                                    key={
                                        place.placeId ||
                                        `place-${index}`
                                    }
                                    style={styles.resultCard}
                                    onPress={() =>
                                        openPlaceDetails(place)
                                    }
                                    disabled={!place.placeId}
                                >
                                    <View style={styles.resultIcon}>
                                        <Ionicons
                                            name="location"
                                            size={23}
                                            color="#2563EB"
                                        />
                                    </View>

                                    <View style={styles.resultInfo}>
                                        <Text style={styles.resultName}>
                                            {place.name ||
                                                "Unnamed Place"}
                                        </Text>

                                        <Text style={styles.resultAddress}>
                                            {place.address ||
                                                "Address unavailable"}
                                        </Text>

                                        {place.rating != null && (
                                            <Text style={styles.ratingText}>
                                                ★ {place.rating}
                                                {place.totalReviews
                                                    ? ` (${place.totalReviews} reviews)`
                                                    : ""}
                                            </Text>
                                        )}
                                    </View>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={21}
                                        color="#94A3B8"
                                    />
                                </TouchableOpacity>
                            ))
                        )}

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={clearSearch}
                        >
                            <Text style={styles.backButtonText}>
                                Explore More Categories
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => handleSearch()}
                    disabled={loading}
                >
                    <Ionicons
                        name="search"
                        size={19}
                        color="#FFFFFF"
                    />
                    <Text style={styles.searchButtonText}>
                        Search Places
                    </Text>
                </TouchableOpacity>
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
        marginBottom: 22,
    },

    heading: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0F172A",
    },

    subtitle: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 5,
    },

    historyButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
    },

    searchBox: {
        height: 58,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 27,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
    },

    searchInput: {
        flex: 1,
        marginLeft: 11,
        color: "#0F172A",
        fontSize: 13,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 15,
        marginTop: 5,
    },

    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 28,
    },

    categoryCard: {
        width: "31%",
        backgroundColor: "#FFFFFF",
        borderRadius: 17,
        paddingVertical: 17,
        alignItems: "center",
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 6,
    },

    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 9,
    },

    categoryTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: "#334155",
        textAlign: "center",
    },

    popularItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 13,
        borderRadius: 14,
        marginBottom: 9,
    },

    popularIcon: {
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },

    popularText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 13,
        color: "#334155",
        fontWeight: "600",
    },

    searchButton: {
        height: 53,
        backgroundColor: "#2563EB",
        borderRadius: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 9,
        marginTop: 15,
        marginBottom: 30,
    },

    searchButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },

    centerContainer: {
        alignItems: "center",
        paddingVertical: 35,
    },

    loadingText: {
        marginTop: 12,
        color: "#64748B",
        fontSize: 13,
    },

    messageContainer: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 25,
        borderRadius: 16,
        marginBottom: 18,
    },

    errorText: {
        color: "#DC2626",
        fontSize: 13,
        textAlign: "center",
        marginTop: 10,
    },

    emptyTitle: {
        color: "#0F172A",
        fontSize: 16,
        fontWeight: "700",
        marginTop: 10,
    },

    emptyText: {
        color: "#64748B",
        fontSize: 13,
        marginTop: 5,
    },

    resultCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: 13,
        marginBottom: 10,
        elevation: 2,
    },

    resultIcon: {
        width: 43,
        height: 43,
        borderRadius: 13,
        backgroundColor: "#DBEAFE",
        alignItems: "center",
        justifyContent: "center",
    },

    resultInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },

    resultName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },

    resultAddress: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 5,
    },

    ratingText: {
        fontSize: 11,
        color: "#D97706",
        marginTop: 5,
        fontWeight: "600",
    },

    backButton: {
        alignItems: "center",
        padding: 14,
        marginTop: 5,
    },

    backButtonText: {
        color: "#2563EB",
        fontWeight: "700",
        fontSize: 13,
    },
});
