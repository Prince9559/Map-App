
import React, { useEffect, useRef, useState } from "react";

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Alert,
} from "react-native";

import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import api from "../services/api";
import { getPlaceDetails } from "../services/places.service";

// Decode Google's encoded route polyline without another package
const decodePolyline = (encoded) => {
    if (!encoded) return [];

    let index = 0;
    let latitude = 0;
    let longitude = 0;
    const coordinates = [];

    while (index < encoded.length) {
        let result = 0;
        let shift = 0;
        let byte;

        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const deltaLatitude =
            result & 1 ? ~(result >> 1) : result >> 1;

        latitude += deltaLatitude;

        result = 0;
        shift = 0;

        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const deltaLongitude =
            result & 1 ? ~(result >> 1) : result >> 1;

        longitude += deltaLongitude;

        coordinates.push({
            latitude: latitude / 1e5,
            longitude: longitude / 1e5,
        });
    }

    return coordinates;
};

const formatDuration = (duration) => {
    if (!duration) return "Unavailable";

    const seconds = parseFloat(String(duration));

    if (!Number.isFinite(seconds)) return String(duration);

    const minutes = Math.round(seconds / 60);

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours} hr ${remainingMinutes} min`;
};

const getDistanceBetweenPoints = (point1, point2) => {
    const toRadians = (value) => (value * Math.PI) / 180;

    const earthRadius = 6371000;

    const lat1 = toRadians(point1.latitude);
    const lat2 = toRadians(point2.latitude);

    const deltaLat = toRadians(
        point2.latitude - point1.latitude
    );

    const deltaLng = toRadians(
        point2.longitude - point1.longitude
    );

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLng / 2) ** 2;

    return (
        earthRadius *
        2 *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    );
};

export default function PlaceDetailsScreen({ route, navigation }) {
    const { placeId } = route.params || {};

    const mapRef = useRef(null);

const locationSubscriptionRef = useRef(null);
const lastRouteUpdateRef = useRef(null);
const isUpdatingRouteRef = useRef(false);

const [currentLocation, setCurrentLocation] = useState(null);
const [isNavigating, setIsNavigating] = useState(false);

    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);

    const [routeLoading, setRouteLoading] = useState(false);
    const [routeData, setRouteData] = useState(null);

    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [reviewAnalysis, setReviewAnalysis] = useState("");

    useEffect(() => {
        fetchPlaceDetails();

        // Reset route and analysis when a different place is opened
        setRouteData(null);
        setReviewAnalysis("");
    }, [placeId]);

    useEffect(() => {
    return () => {
        if (locationSubscriptionRef.current) {
            locationSubscriptionRef.current.remove();
            locationSubscriptionRef.current = null;
        }

        setIsNavigating(false);
    };
}, []);


useEffect(() => {
    if (currentLocation && mapRef.current) {
        mapRef.current.animateToRegion(
            {
                ...currentLocation,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
            },
            700
        );
    }
}, [currentLocation]);

    const fetchPlaceDetails = async () => {
        try {
            if (!placeId) {
                throw new Error("Place ID is missing");
            }

            setLoading(true);

            const data = await getPlaceDetails(placeId);

            setPlace(data);
        } catch (error) {
            console.log(
                "Place Details Error:",
                error.response?.data?.message || error.message
            );

            Alert.alert(
                "Error",
                error.response?.data?.message ||
                    "Unable to load place details."
            );
        } finally {
            setLoading(false);
        }
    };

    // Call backend route API and show route inside this app
    const calculateAndShowRoute = async () => {
        try {
            if (
                typeof place?.latitude !== "number" ||
                typeof place?.longitude !== "number"
            ) {
                Alert.alert(
                    "Location unavailable",
                    "Destination coordinates are not available for this place."
                );
                return;
            }

            setRouteLoading(true);
            setRouteData(null);

            const permission =
                await Location.requestForegroundPermissionsAsync();

            if (permission.status !== "granted") {
                Alert.alert(
                    "Location Permission",
                    "Allow location access to calculate your route."
                );
                return;
            }

            const currentLocation =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

            const origin = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };

            const destination = {
                latitude: place.latitude,
                longitude: place.longitude,
            };

            // Backend: POST /api/routes/calculate
            const response = await api.post("/routes/calculate", {
                origin,
                destination,
                travelMode: "DRIVE",
            });

            console.log("LIVE ROUTE API RESPONSE:", response.data);

            const result = response.data?.route;

            if (!result?.polyline) {
                throw new Error("Route polyline was not returned by backend.");
            }

            const coordinates = decodePolyline(result.polyline);

            if (coordinates.length < 2) {
                throw new Error("Unable to draw the calculated route.");
            }

            setRouteData({
                ...result,
                coordinates,
                origin,
                destination,
            });

        } catch (error) {
            console.log(
                "Route Calculation Error:",
                error.response?.data?.message || error.message
            );

            console.log("LIVE ROUTE API ERROR:", error.response?.data || error.message);

            Alert.alert(
                "Route Error",
                error.response?.data?.message ||
                    error.message ||
                    "Unable to calculate route."
            );
        } finally {
            setRouteLoading(false);
        }
    };

    const updateLiveRoute = async (newLocation) => {
    if (!place?.latitude || !place?.longitude) return;
    console.log("UPDATE LIVE ROUTE CALLED");
    if (isUpdatingRouteRef.current) return;
    console.log("ROUTE UPDATE LOCK:", isUpdatingRouteRef.current);

    const destination = {
        latitude: place.latitude,
        longitude: place.longitude,
    };

    // Har chhote GPS movement par API call nahi karni.
    if (lastRouteUpdateRef.current) {
        const movedDistance = getDistanceBetweenPoints(
            lastRouteUpdateRef.current,
            newLocation
        );

        console.log("MOVED DISTANCE:", movedDistance);
    }

    try {
        isUpdatingRouteRef.current = true;

        const response = await api.post("/routes/calculate", {
            origin: newLocation,
            destination,
            travelMode: "DRIVE",
        });

        const result = response.data?.route;

        if (!result?.polyline) return;

        const coordinates = decodePolyline(result.polyline);

        if (coordinates.length < 2) return;

        setRouteData((previous) => ({
            ...previous,
            ...result,
            coordinates,
            origin: newLocation,
            destination,
        }));

        lastRouteUpdateRef.current = newLocation;

    } catch (error) {
        console.log(
            "Live Route Update Error:",
            error.response?.data?.message || error.message
        );
    } finally {
        isUpdatingRouteRef.current = false;
    }
};


const startLiveNavigation = async () => {
    try {
        const permission =
            await Location.requestForegroundPermissionsAsync();

        if (permission.status !== "granted") {
            Alert.alert(
                "Location Permission",
                "Live navigation ke liye location permission zaroori hai."
            );
            return;
        }

        const initialLocation =
            await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

        const initialCoordinates = {
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
        };

        if (locationSubscriptionRef.current) {
    locationSubscriptionRef.current.remove();
    locationSubscriptionRef.current = null;
}

lastRouteUpdateRef.current = null;

        setCurrentLocation(initialCoordinates);
        setIsNavigating(true);

        await updateLiveRoute(initialCoordinates);

        locationSubscriptionRef.current =
            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (location) => {
                    const newCoordinates = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };
                    
                    console.log("LIVE GPS LOCATION:", newCoordinates);
                    setCurrentLocation(newCoordinates);
                    updateLiveRoute(newCoordinates);
                }
            );

    } catch (error) {
        console.log("Live Navigation Error:", error.message);

        Alert.alert(
            "Navigation Error",
            "Live GPS tracking start nahi ho paayi."
        );

    }
};

    // Backend: GET /api/places/:placeId/analyze
    const analyzeReviews = async () => {
        try {
            setAnalysisLoading(true);
            setReviewAnalysis("");

            const response = await api.get(
                `/places/${encodeURIComponent(placeId)}/analyze`
            );

            const analysis = response.data?.analysis;

            if (!analysis) {
                throw new Error("Review analysis was not returned.");
            }

            setReviewAnalysis(analysis);

        } catch (error) {
            console.log(
                "Review Analysis Error:",
                error.response?.data?.message || error.message
            );

            Alert.alert(
                "Review Analysis",
                error.response?.data?.message ||
                    "Unable to analyze reviews right now."
            );
        } finally {
            setAnalysisLoading(false);
        }
    };

    const openLink = async (url) => {
        if (!url) return;

        try {
            await Linking.openURL(url);
        } catch (error) {
            Alert.alert("Error", "Unable to open this link.");
        }
    };

    const callPlace = async () => {
        if (!place?.phone) return;

        openLink(`tel:${place.phone}`);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>
                    Loading place details...
                </Text>
            </View>
        );
    }

    if (!place) {
        return (
            <View style={styles.center}>
                <Ionicons
                    name="alert-circle-outline"
                    size={45}
                    color="#64748B"
                />

                <Text style={styles.emptyText}>
                    Place details not available
                </Text>

                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchPlaceDetails}
                >
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
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

                <Text style={styles.headerTitle}>
                    Place Details
                </Text>

                <View style={{ width: 42 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Place Information */}
                <View style={styles.mainCard}>
                    <View style={styles.placeIcon}>
                        <Ionicons
                            name="location"
                            size={32}
                            color="#2563EB"
                        />
                    </View>

                    <Text style={styles.placeName}>
                        {place.name || "Unknown Place"}
                    </Text>

                    <Text style={styles.address}>
                        {place.address || "Address unavailable"}
                    </Text>

                    {place.rating != null && (
                        <View style={styles.ratingRow}>
                            <Ionicons
                                name="star"
                                size={18}
                                color="#F59E0B"
                            />

                            <Text style={styles.rating}>
                                {Number(place.rating).toFixed(1)}
                            </Text>

                            <Text style={styles.reviewsCount}>
                                ({place.totalReviews || 0} reviews)
                            </Text>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.actions}>
                    {place.phone && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={callPlace}
                        >
                            <Ionicons
                                name="call-outline"
                                size={23}
                                color="#2563EB"
                            />
                            <Text style={styles.actionText}>Call</Text>
                        </TouchableOpacity>
                    )}

                    {place.website && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => openLink(place.website)}
                        >
                            <Ionicons
                                name="globe-outline"
                                size={23}
                                color="#2563EB"
                            />
                            <Text style={styles.actionText}>Website</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={startLiveNavigation}
                        disabled={routeLoading}
                    >
                        {routeLoading ? (
                            <ActivityIndicator color="#2563EB" />
                        ) : (
                            <Ionicons
                                name="navigate-outline"
                                size={23}
                                color="#2563EB"
                            />
                        )}

                        <Text style={styles.actionText}>
                            Directions
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* In-App Route */}
                {routeData && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Your Route
                        </Text>

                        <View style={styles.routeStats}>
                            <View style={styles.routeStat}>
                                <Ionicons
                                    name="map-outline"
                                    size={20}
                                    color="#2563EB"
                                />
                                <Text style={styles.routeStatValue}>
                                    {routeData.distanceKm} km
                                </Text>
                                <Text style={styles.routeStatLabel}>
                                    Distance
                                </Text>
                            </View>

                            <View style={styles.routeStat}>
                                <Ionicons
                                    name="time-outline"
                                    size={20}
                                    color="#2563EB"
                                />
                                <Text style={styles.routeStatValue}>
                                    {formatDuration(routeData.duration)}
                                </Text>
                                <Text style={styles.routeStatLabel}>
                                    Estimated time
                                </Text>
                            </View>
                        </View>

                        <MapView
                            ref={mapRef}
                            style={styles.routeMap}
                            initialRegion={{
                                latitude:
                                    (routeData.origin.latitude +
                                        routeData.destination.latitude) / 2,
                                longitude:
                                    (routeData.origin.longitude +
                                        routeData.destination.longitude) / 2,
                                latitudeDelta: 0.08,
                                longitudeDelta: 0.08,
                            }}
                            onMapReady={() => {
                                mapRef.current?.fitToCoordinates(
                                    routeData.coordinates,
                                    {
                                        edgePadding: {
                                            top: 55,
                                            right: 45,
                                            bottom: 55,
                                            left: 45,
                                        },
                                        animated: true,
                                    }
                                );
                            }}
                        >
                            {currentLocation && (
    <Marker
        key="live-user-location"
        coordinate={currentLocation}
        title="Your Live Location"
        pinColor="blue"
    />
)}

                            <Marker
                                key="route-destination"
                                coordinate={routeData.destination}
                                title={place.name}
                                pinColor="red"
                            />

                            <Polyline
                                coordinates={routeData.coordinates}
                                strokeColor="#2563EB"
                                strokeWidth={5}
                                lineCap="round"
                                lineJoin="round"
                            />
                        </MapView>

                        <TouchableOpacity
                            style={styles.clearRouteButton}
                            onPress={() => setRouteData(null)}
                        >
                            <Text style={styles.clearRouteText}>
                                Hide Route
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Information
                    </Text>

                    <InfoRow
                        icon="location-outline"
                        title="Address"
                        value={place.address}
                    />

                    {place.phone && (
                        <InfoRow
                            icon="call-outline"
                            title="Phone"
                            value={place.phone}
                        />
                    )}

                    {place.website && (
                        <InfoRow
                            icon="globe-outline"
                            title="Website"
                            value={place.website}
                        />
                    )}

                    {place.priceLevel && (
                        <InfoRow
                            icon="cash-outline"
                            title="Price Level"
                            value={String(place.priceLevel).replace(
                                "PRICE_LEVEL_",
                                ""
                            )}
                        />
                    )}

                    {place.primaryType && (
                        <InfoRow
                            icon="pricetag-outline"
                            title="Category"
                            value={place.primaryType.replace(/_/g, " ")}
                        />
                    )}
                </View>

                {/* Opening Hours */}
                {place.openingHours?.weekdayDescriptions?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Opening Hours
                        </Text>

                        {place.openingHours.weekdayDescriptions.map(
                            (day, index) => (
                                <Text
                                    key={`opening-day-${index}`}
                                    style={styles.hoursText}
                                >
                                    {day}
                                </Text>
                            )
                        )}
                    </View>
                )}

                {/* Customer Reviews */}
                {place.reviews?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Customer Reviews
                        </Text>

                        {place.reviews.map((review, index) => (
                            <View
                                key={review.name || `review-${index}`}
                                style={styles.reviewCard}
                            >
                                <Text style={styles.reviewerName}>
                                    {review.authorAttribution?.displayName ||
                                        "Google User"}
                                </Text>

                                {review.rating != null && (
                                    <View style={styles.ratingRow}>
                                        <Ionicons
                                            name="star"
                                            size={15}
                                            color="#F59E0B"
                                        />

                                        <Text style={styles.reviewRating}>
                                            {review.rating}/5
                                        </Text>
                                    </View>
                                )}

                                <Text style={styles.reviewText}>
                                    {review.text?.text ||
                                        "No review text available."}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Gemini AI Review Analysis */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        AI Review Analysis
                    </Text>

                    <Text style={styles.analysisDescription}>
                        Understand customer feedback with AI-powered
                        review analysis.
                    </Text>

                    <TouchableOpacity
                        style={styles.analyzeButton}
                        onPress={analyzeReviews}
                        disabled={analysisLoading}
                    >
                        {analysisLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Ionicons
                                name="sparkles"
                                size={19}
                                color="#FFFFFF"
                            />
                        )}

                        <Text style={styles.analyzeButtonText}>
                            {analysisLoading
                                ? "Analyzing Reviews..."
                                : "Analyze Reviews with AI"}
                        </Text>
                    </TouchableOpacity>

                    {!!reviewAnalysis && (
                        <Text style={styles.summaryText}>
                            {reviewAnalysis}
                        </Text>
                    )}
                </View>

                {/* Google Review Summary */}
                {place.reviewSummary?.text?.text && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Google Review Summary
                        </Text>

                        <Text style={styles.summaryText}>
                            {place.reviewSummary.text.text}
                        </Text>
                    </View>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

// Reusable information row
const InfoRow = ({ icon, title, value }) => {
    if (!value) return null;

    return (
        <View style={styles.infoRow}>
            <Ionicons
                name={icon}
                size={21}
                color="#2563EB"
            />

            <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{title}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingTop: 45,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: 25,
    },

    loadingText: {
        marginTop: 12,
        color: "#64748B",
    },

    emptyText: {
        marginTop: 12,
        color: "#334155",
        fontSize: 16,
        fontWeight: "600",
    },

    retryButton: {
        marginTop: 18,
        backgroundColor: "#2563EB",
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 12,
    },

    retryText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 18,
    },

    backButton: {
        width: 42,
        height: 42,
        backgroundColor: "#FFFFFF",
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0F172A",
    },

    mainCard: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        padding: 22,
        borderRadius: 22,
        alignItems: "center",
        elevation: 3,
    },

    placeIcon: {
        width: 65,
        height: 65,
        borderRadius: 22,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },

    placeName: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0F172A",
        textAlign: "center",
    },

    address: {
        fontSize: 13,
        color: "#64748B",
        textAlign: "center",
        marginTop: 9,
        lineHeight: 20,
    },

    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },

    rating: {
        marginLeft: 5,
        fontWeight: "800",
        color: "#0F172A",
    },

    reviewsCount: {
        marginLeft: 5,
        color: "#64748B",
        fontSize: 12,
    },

    actions: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginTop: 17,
        paddingVertical: 17,
        borderRadius: 18,
    },

    actionButton: {
        alignItems: "center",
        paddingHorizontal: 8,
    },

    actionText: {
        marginTop: 7,
        color: "#334155",
        fontSize: 12,
        fontWeight: "700",
    },

    section: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginTop: 17,
        padding: 18,
        borderRadius: 18,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 15,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 17,
    },

    infoContent: {
        flex: 1,
        marginLeft: 12,
    },

    infoTitle: {
        fontSize: 12,
        color: "#94A3B8",
    },

    infoValue: {
        fontSize: 13,
        color: "#334155",
        marginTop: 4,
        lineHeight: 19,
    },

    hoursText: {
        fontSize: 13,
        color: "#475569",
        marginBottom: 10,
        lineHeight: 19,
    },

    reviewCard: {
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingVertical: 13,
    },

    reviewerName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },

    reviewRating: {
        marginLeft: 5,
        fontSize: 12,
        color: "#64748B",
    },

    reviewText: {
        color: "#475569",
        fontSize: 13,
        lineHeight: 20,
        marginTop: 8,
    },

    summaryText: {
        color: "#475569",
        fontSize: 14,
        lineHeight: 22,
        marginTop: 12,
    },

    routeStats: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
    },

    routeStat: {
        alignItems: "center",
        flex: 1,
    },

    routeStatValue: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        marginTop: 6,
    },

    routeStatLabel: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 3,
    },

    routeMap: {
        height: 260,
        borderRadius: 15,
    },

    clearRouteButton: {
        marginTop: 14,
        alignSelf: "flex-end",
        paddingVertical: 9,
        paddingHorizontal: 15,
        backgroundColor: "#DBEAFE",
        borderRadius: 10,
    },

    clearRouteText: {
        color: "#2563EB",
        fontWeight: "700",
    },

    analysisDescription: {
        color: "#64748B",
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 14,
    },

    analyzeButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
    },

    analyzeButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },
});
