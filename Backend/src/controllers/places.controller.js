
const SavedPlace = require("../models/SavedPlace");
const {
    searchPlaces,
    nearbyPlaces,
    getPlaceDetails,
    searchPlacesAlongRoute,
    searchPlacesNearLocation
} = require("../services/maps.service");
const { getRoute ,getHalfwayPoint,getPointAtDistance} = require("../services/route.service");
const { analyzePlaceReviews } = require("../services/gemini.service");

const savePlace = async (req, res) => {
    try {
        const {
            name,
            address,
            latitude,
            longitude,
            category,
            notes
        } = req.body;

         
        if (
            !name ||
            !address ||
            latitude === undefined ||
            longitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, address, latitude and longitude are required"
            });
        }

        // Validate coordinates
        if (
            !Number.isFinite(Number(latitude)) ||
            !Number.isFinite(Number(longitude)) ||
            Number(latitude) < -90 ||
            Number(latitude) > 90 ||
            Number(longitude) < -180 ||
            Number(longitude) > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude"
            });
        }

        // Create saved place
        const place = await SavedPlace.create({
            user: req.user._id,
            name,
            address,
            latitude: Number(latitude),
            longitude: Number(longitude),
            category,
            notes
        });

        return res.status(201).json({
            success: true,
            message: "Place saved successfully",
            place
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This place is already saved"
            });
        }

        console.error("Save Place Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to save place"
        });
    }
};

// @desc    Get all saved places
// @route   GET /api/places
// @access  Private
const getSavedPlaces = async (req, res) => {
    try {
        const places = await SavedPlace.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Saved places fetched successfully",
            count: places.length,
            places
        });

    } catch (error) {
        console.error("Get Saved Places Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch saved places"
        });
    }
};

// @desc    Delete a saved place
// @route   DELETE /api/places/:id
// @access  Private
const deleteSavedPlace = async (req, res) => {
    try {
        const place = await SavedPlace.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Saved place not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Place deleted successfully"
        });

    } catch (error) {
        console.error("Delete Saved Place Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete place"
        });
    }
};


const searchLocations = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // Call Google Places API
        const data = await searchPlaces(query);

        // Format Google response
        const places = (data.places || []).map((place) => ({
            placeId: place.id,
            name: place.displayName?.text || "",
            address: place.formattedAddress || "",
            latitude: place.location?.latitude ?? null,
            longitude: place.location?.longitude ?? null,
            types: place.types || []
        }));

        return res.status(200).json({
            success: true,
            message: "Locations fetched successfully",
            count: places.length,
            places
        });

    } catch (error) {
        console.error("Location Search Error:", error.message);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to search locations"
        });
    }
};

const getNearbyPlaces = async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            radius,
            type
        } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });
        }

        const includedTypes = type ? [type] : [];

        const data = await nearbyPlaces({
            latitude,
            longitude,
            radius: radius || 1500,
            includedTypes
        });

        const places = (data.places || []).map((place) => ({
            placeId: place.id,
            name: place.displayName?.text || "",
            address: place.formattedAddress || "",
            latitude: place.location?.latitude ?? null,
            longitude: place.location?.longitude ?? null,
            types: place.types || [],

            // Additional place information
            rating: place.rating || null,
            totalReviews: place.userRatingCount || 0,
            priceLevel: place.priceLevel || null,
            primaryType: place.primaryType || null
        }));

        return res.status(200).json({
            success: true,
            message: "Nearby places fetched successfully",
            count: places.length,
            places
        });

    } catch (error) {
        console.error("Nearby Places Error:", error.message);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to fetch nearby places"
        });
    }
};

// Search places along a route
// Search places along route with detour calculation
const searchAlongRoute = async (req, res) => {
    try {
        const {
            origin,
            destination,
            travelMode,
            searchQuery,
            maxDetourMinutes = 15
        } = req.body;

        if (!origin || !destination || !searchQuery) {
            return res.status(400).json({
                success: false,
                message: "Origin, destination and search query are required"
            });
        }

        if (
            !Number.isFinite(Number(maxDetourMinutes)) ||
            Number(maxDetourMinutes) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid maxDetourMinutes is required"
            });
        }

        // Convert duration like "1628s" into seconds
        const durationToSeconds = (duration) => {
            if (!duration) return 0;

            return parseFloat(duration.replace("s", ""));
        };

        // Step 1: Calculate original route
        const route = await getRoute({
            origin,
            destination,
            travelMode: travelMode || "DRIVE"
        });

        const encodedPolyline =
            route.polyline?.encodedPolyline;

        if (!encodedPolyline) {
            return res.status(404).json({
                success: false,
                message: "Route polyline not found"
            });
        }

        const originalRouteSeconds =
            durationToSeconds(route.duration);

        // Step 2: Search places along route
        const data = await searchPlacesAlongRoute({
            searchQuery,
            encodedPolyline
        });

        // Step 3: Calculate detour for each place
        const places = (data.places || [])
            .map((place, index) => {

                const summary =
                    data.routingSummaries?.[index];

                const legs = summary?.legs || [];

                // Both legs must be available
                if (legs.length !== 2) {
                    return null;
                }

                const firstLegSeconds =
                    durationToSeconds(legs[0].duration);

                const secondLegSeconds =
                    durationToSeconds(legs[1].duration);

                const totalViaPlaceSeconds =
                    firstLegSeconds + secondLegSeconds;

                const extraDetourSeconds =
                    Math.max(
                        0,
                        totalViaPlaceSeconds - originalRouteSeconds
                    );

                const detourMinutes =
                    Math.round(extraDetourSeconds / 60);

                return {
                    placeId: place.id,
                    name: place.displayName?.text || "",
                    address: place.formattedAddress || "",
                    latitude: place.location?.latitude ?? null,
                    longitude: place.location?.longitude ?? null,
                    rating: place.rating ?? null,
                    totalReviews: place.userRatingCount || 0,
                    primaryType: place.primaryType || null,

                    firstLegSeconds,
                    secondLegSeconds,

                    totalViaPlaceSeconds,

                    detourMinutes,

                    directionsUri: summary.directionsUri || null
                };
            })
            .filter(
                (place) =>
                    place !== null &&
                    place.detourMinutes <= Number(maxDetourMinutes)
            )
            .sort(
                (a, b) => a.detourMinutes - b.detourMinutes
            );

        // Step 4: Send response
        return res.status(200).json({
            success: true,
            message: "Places with detour calculation fetched successfully",

            originalRoute: {
                distanceMeters: route.distanceMeters,
                duration: route.duration,
                durationSeconds: originalRouteSeconds
            },

            searchQuery,
            maxDetourMinutes,

            count: places.length,
            places
        });

    } catch (error) {
        console.error(
            "Search Along Route Error:",
            error.message
        );

        return res.status(error.status || 500).json({
            success: false,
            message: error.message ||
                "Failed to search places along route"
        });
    }
};

// BASIC SEARCH ALONG ROUTE
const searchAlongRouteBasic = async (req, res) => {
    try {
        const {
            origin,
            destination,
            travelMode = "DRIVE",
            searchQuery
        } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({
                success: false,
                message: "Origin and destination are required"
            });
        }

        if (
            typeof searchQuery !== "string" ||
            !searchQuery.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // Step 1: Calculate route
        const route = await getRoute({
            origin,
            destination,
            travelMode
        });

        const encodedPolyline = route.polyline?.encodedPolyline;

        if (!encodedPolyline) {
            return res.status(404).json({
                success: false,
                message: "Route polyline not found"
            });
        }

        // Step 2: Search places along route
        const data = await searchPlacesAlongRoute({
            searchQuery: searchQuery.trim(),
            encodedPolyline
        });

        // Step 3: Format places
        const places = (data.places || []).map((place) => ({
            placeId: place.id,
            name: place.displayName?.text || "Unknown Place",
            address: place.formattedAddress || "",
            latitude: place.location?.latitude ?? null,
            longitude: place.location?.longitude ?? null,
            rating: place.rating ?? null,
            totalReviews: place.userRatingCount || 0,
            types: place.types || []
        }));

        return res.status(200).json({
            success: true,
            message: "Places along route fetched successfully",
            route: {
                distanceMeters: route.distanceMeters,
                duration: route.duration
            },
            searchQuery: searchQuery.trim(),
            count: places.length,
            places
        });

    } catch (error) {
        console.error("Basic Route Search Error:", error.message);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message ||
                "Failed to search places along route"
        });
    }
};

// Get details of a specific place
const getPlaceDetailsController = async (req, res) => {
    try {
        const { placeId } = req.params;

        if (!placeId) {
            return res.status(400).json({
                success: false,
                message: "Place ID is required"
            });
        }

        const place = await getPlaceDetails(placeId);

        return res.status(200).json({
            success: true,
            message: "Place details fetched successfully",

            place: {
                placeId: place.id,
                name: place.displayName?.text || "",
                address: place.formattedAddress || "",

                latitude: place.location?.latitude ?? null,
                longitude: place.location?.longitude ?? null,

                types: place.types || [],
                primaryType: place.primaryType || null,

                rating: place.rating ?? null,
                totalReviews: place.userRatingCount || 0,
                priceLevel: place.priceLevel || null,

                phone: place.nationalPhoneNumber || null,
                internationalPhone: place.internationalPhoneNumber || null,

                website: place.websiteUri || null,
                googleMapsUrl: place.googleMapsUri || null,

                openingHours: place.regularOpeningHours || null,
                reviews: place.reviews || [],
                reviewSummary: place.reviewSummary || null
            }
        });

    } catch (error) {
        console.error("Place Details Controller Error:", error.message);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to fetch place details"
        });
    }
};

// Analyze customer reviews of a place using Gemini AI
// @route   GET /api/places/:placeId/analyze
// @access  Private

const analyzePlaceReviewsController = async (req, res) => {
    try {
        const { placeId } = req.params;

        // Validate Place ID
        if (!placeId) {
            return res.status(400).json({
                success: false,
                message: "Place ID is required"
            });
        }

        // Step 1: Get place details from Google Places API
        const place = await getPlaceDetails(placeId);

        // Step 2: Get customer reviews
        const reviews = place.reviews || [];

        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No reviews available for this place"
            });
        }

        // Step 3: Analyze reviews using Gemini AI
        const analysis = await analyzePlaceReviews(
            reviews,
            place.displayName?.text || "Unknown Place"
        );

        // Step 4: Send response
        return res.status(200).json({
            success: true,
            message: "Place reviews analyzed successfully",

            place: {
                placeId: place.id,
                name: place.displayName?.text || "",
                address: place.formattedAddress || "",
                rating: place.rating ?? null,
                totalReviews: place.userRatingCount || 0
            },

            analyzedReviews: reviews.length,
            analysis
        });

    } catch (error) {
        console.error(
            "Place Review Analysis Error:",
            error.message
        );

        return res.status(error.status || 500).json({
            success: false,
            message: error.message ||
                "Failed to analyze place reviews"
        });
    }
};
// Search nearby places around the halfway point
const searchHalfwayNearby = async (req, res) => {
    try {
        const {
            origin,
            destination,
            travelMode,
            radius = 1500,
            type
        } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({
                success: false,
                message: "Origin and destination are required"
            });
        }

        const searchRadius = Number(radius);

        if (
            !Number.isFinite(searchRadius) ||
            searchRadius < 1 ||
            searchRadius > 50000
        ) {
            return res.status(400).json({
                success: false,
                message: "Radius must be between 1 and 50000 meters"
            });
        }

        // Step 1: Calculate route
        const route = await getRoute({
            origin,
            destination,
            travelMode: travelMode || "DRIVE"
        });

        const encodedPolyline = route.polyline?.encodedPolyline;

        if (!encodedPolyline) {
            return res.status(404).json({
                success: false,
                message: "Route polyline not found"
            });
        }

        // Step 2: Find halfway point
        const halfwayPoint = getHalfwayPoint(encodedPolyline);

        // Step 3: Search nearby places
        const data = await nearbyPlaces({
            latitude: halfwayPoint.latitude,
            longitude: halfwayPoint.longitude,
            radius: searchRadius,
            includedTypes: type ? [type] : []
        });

        // Step 4: Format places
        const places = (data.places || []).map((place) => ({
            placeId: place.id,
            name: place.displayName?.text || "",
            address: place.formattedAddress || "",
            latitude: place.location?.latitude ?? null,
            longitude: place.location?.longitude ?? null,
            types: place.types || [],
            rating: place.rating ?? null,
            totalReviews: place.userRatingCount || 0,
            primaryType: place.primaryType || null
        }));

        return res.status(200).json({
            success: true,
            message: "Halfway nearby places fetched successfully",

            route: {
                distanceMeters: route.distanceMeters,
                duration: route.duration
            },

            halfwayPoint: {
                latitude: halfwayPoint.latitude,
                longitude: halfwayPoint.longitude
            },

            radius: searchRadius,
            count: places.length,
            places
        });

    } catch (error) {
        console.error("Halfway Nearby Error:", error.message);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to search halfway nearby places"
        });
    }
};

// Search places near route halfway point using text query
const searchHalfwaySearch = async (req, res) => {
    try {
        const {
            origin,
            destination,
            travelMode = "DRIVE",
            searchQuery,
            radius = 1500
        } = req.body;

        // Validate required fields
        if (!origin || !destination || !searchQuery) {
            return res.status(400).json({
                success: false,
                message: "Origin, destination and searchQuery are required"
            });
        }

        // Calculate main route
        const route = await getRoute({
            origin,
            destination,
            travelMode
        });

        // Get encoded polyline
        const encodedPolyline = route.polyline.encodedPolyline;

        // Calculate halfway point
        const halfwayPoint = getHalfwayPoint(encodedPolyline);

        // Search places near halfway point
        const data = await searchPlacesNearLocation({
            searchQuery,
            latitude: halfwayPoint.latitude,
            longitude: halfwayPoint.longitude,
            radius
        });

        const places = (data.places || []).map((place) => ({
            placeId: place.id,
            name: place.displayName?.text || "Unknown Place",
            address: place.formattedAddress || "",
            latitude: place.location?.latitude,
            longitude: place.location?.longitude,
            rating: place.rating || null,
            totalReviews: place.userRatingCount || 0,
            types: place.types || [],
            primaryType: place.primaryType || null
        }));

        return res.status(200).json({
            success: true,
            message: "Halfway places searched successfully",
            route: {
                distanceMeters: route.distanceMeters,
                duration: route.duration
            },
            searchQuery,
            halfwayPoint,
            radius,
            count: places.length,
            places
        });

    } catch (error) {
        console.error("Halfway Search Error:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to search halfway places"
        });
    }
};


// Search places at a specific distance along a route
const searchPlacesByDistance = async (req, res) => {
    try {
        const {
            origin,
            destination,
            travelMode = "DRIVE",
            distanceMeters,
            searchQuery,
            radius = 1500
        } = req.body;

        // Validate required fields
        if (
            !origin ||
            !destination ||
            distanceMeters === undefined ||
            !searchQuery
        ) {
            return res.status(400).json({
                success: false,
                message: "Origin, destination, distanceMeters and searchQuery are required"
            });
        }

        // Calculate route
        const route = await getRoute({
            origin,
            destination,
            travelMode
        });

        // Get encoded polyline
        const encodedPolyline = route.polyline.encodedPolyline;

        // Calculate point at requested distance
        const targetPoint = getPointAtDistance(
            encodedPolyline,
            distanceMeters
        );

        // Search places near calculated point
        const data = await searchPlacesNearLocation({
            searchQuery,
            latitude: targetPoint.latitude,
            longitude: targetPoint.longitude,
            radius
        });

        // Format places
        const places = (data.places || []).map((place) => ({
            placeId: place.id,
            name: place.displayName?.text || "Unknown Place",
            address: place.formattedAddress || "",
            latitude: place.location?.latitude,
            longitude: place.location?.longitude,
            rating: place.rating || null,
            totalReviews: place.userRatingCount || 0,
            types: place.types || [],
            primaryType: place.primaryType || null
        }));

        return res.status(200).json({
            success: true,
            message: "Places searched at requested distance successfully",
            route: {
                distanceMeters: route.distanceMeters,
                duration: route.duration
            },
            searchQuery,
            targetPoint,
            radius,
            count: places.length,
            places
        });

    } catch (error) {
        console.error("Search Places By Distance Error:", error.message);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Unable to search places by distance"
        });
    }
};

module.exports = {
    savePlace,
    getSavedPlaces,
    deleteSavedPlace,
    searchLocations,
    getNearbyPlaces,
    getPlaceDetailsController,
    searchAlongRoute,
    searchHalfwayNearby,
    searchHalfwaySearch,
    searchPlacesByDistance,
    searchAlongRouteBasic,
    analyzePlaceReviewsController,
};