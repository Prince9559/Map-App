const RoadTrip = require("../models/RoadTrip");

const {searchPlacesAlongRoute,searchPlacesNearLocation} = require("../services/maps.service");

const {getRoute,getHalfwayPoint} = require("../services/route.service");

// CREATE ROAD TRIP
const createRoadTrip = async (req, res) => {
    try {
        const {
            title,
            description,
            startLocation,
            destinations,
            travelMode,
            travelDate
        } = req.body;

        if (!title || !startLocation || !destinations || destinations.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Title, start location and destinations are required"
            });
        }

        const roadTrip = await RoadTrip.create({
            user: req.user._id,
            title,
            description,
            startLocation,
            destinations,
            travelMode,
            travelDate
        });

        return res.status(201).json({
            success: true,
            message: "Road trip created successfully",
            roadTrip
        });

    } catch (error) {
        console.error("Create Road Trip Error:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create road trip"
        });
    }
};


// GET ALL ROAD TRIPS
const getRoadTrips = async (req, res) => {
    try {
        const roadTrips = await RoadTrip.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: roadTrips.length,
            roadTrips
        });

    } catch (error) {
        console.error("Get Road Trips Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch road trips"
        });
    }
};


// GET SINGLE ROAD TRIP
const getSingleRoadTrip = async (req, res) => {
    try {
        const roadTrip = await RoadTrip.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!roadTrip) {
            return res.status(404).json({
                success: false,
                message: "Road trip not found"
            });
        }

        return res.status(200).json({
            success: true,
            roadTrip
        });

    } catch (error) {
        console.error("Get Single Road Trip Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch road trip"
        });
    }
};


// DELETE ROAD TRIP
const deleteRoadTrip = async (req, res) => {
    try {
        const roadTrip = await RoadTrip.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!roadTrip) {
            return res.status(404).json({
                success: false,
                message: "Road trip not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Road trip deleted successfully"
        });

    } catch (error) {
        console.error("Delete Road Trip Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete road trip"
        });
    }
};

// UPDATE ROAD TRIP
const updateRoadTrip = async (req, res) => {
    try {
        const {
            title,
            description,
            startLocation,
            destinations,
            travelMode,
            travelDate,
            status
        } = req.body;

        const roadTrip = await RoadTrip.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!roadTrip) {
            return res.status(404).json({
                success: false,
                message: "Road trip not found"
            });
        }

        // Update only provided fields
        if (title !== undefined) {
            roadTrip.title = title;
        }

        if (description !== undefined) {
            roadTrip.description = description;
        }

        if (startLocation !== undefined) {
            roadTrip.startLocation = startLocation;
        }

        if (destinations !== undefined) {
            roadTrip.destinations = destinations;
        }

        if (travelMode !== undefined) {
            roadTrip.travelMode = travelMode;
        }

        if (travelDate !== undefined) {
            roadTrip.travelDate = travelDate;
        }

        if (status !== undefined) {
            roadTrip.status = status;
        }

        await roadTrip.save();

        return res.status(200).json({
            success: true,
            message: "Road trip updated successfully",
            roadTrip
        });

    } catch (error) {
        console.error("Update Road Trip Error:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update road trip"
        });
    }
};

// ROAD TRIP COPILOT SEARCH
const searchRoadTrip = async (req, res) => {
    try {
        const {
            origin,
            destination,
            travelMode = "DRIVE",
            searchQuery = "restaurant",
            radius = 1500,
            maxDetourMinutes = 15
        } = req.body;

        // Validate required fields
        if (!origin || !destination) {
            return res.status(400).json({
                success: false,
                message: "Origin and destination are required"
            });
        }

        if (!searchQuery.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const searchRadius = Number(radius);
        const maxDetour = Number(maxDetourMinutes);

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

        if (!Number.isFinite(maxDetour) || maxDetour < 0) {
            return res.status(400).json({
                success: false,
                message: "Valid maxDetourMinutes is required"
            });
        }

        // Step 1: Calculate main route
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

        // Step 2: Find halfway point
        const halfwayPoint = getHalfwayPoint(encodedPolyline);

        // Convert duration like "1606s" into seconds
        const durationToSeconds = (duration) => {
            if (!duration) return 0;
            return parseFloat(duration.replace("s", ""));
        };

        const originalRouteSeconds =
            durationToSeconds(route.duration);

        // Step 3: Search places along route
        const routePlacesData = await searchPlacesAlongRoute({
            searchQuery,
            encodedPolyline
        });

        // Step 4: Search places near halfway point
        const halfwayPlacesData = await searchPlacesNearLocation({
            searchQuery,
            latitude: halfwayPoint.latitude,
            longitude: halfwayPoint.longitude,
            radius: searchRadius
        });

        // Step 5: Combine both search results
        const allPlaces = [
            ...(routePlacesData.places || []),
            ...(halfwayPlacesData.places || [])
        ];

        // Remove duplicate places using Google Place ID
        const uniquePlaces = Array.from(
            new Map(
                allPlaces.map((place) => [place.id, place])
            ).values()
        );

        // Step 6: Calculate detour for route-search results
        const routePlaces = (routePlacesData.places || [])
            .map((place, index) => {
                const summary =
                    routePlacesData.routingSummaries?.[index];

                const legs = summary?.legs || [];

                if (legs.length !== 2) {
                    return null;
                }

                const firstLegSeconds =
                    durationToSeconds(legs[0].duration);

                const secondLegSeconds =
                    durationToSeconds(legs[1].duration);

                const totalViaPlaceSeconds =
                    firstLegSeconds + secondLegSeconds;

                const extraDetourSeconds = Math.max(
                    0,
                    totalViaPlaceSeconds - originalRouteSeconds
                );

                const detourMinutes =
                    Math.round(extraDetourSeconds / 60);

                return {
                    placeId: place.id,
                    name: place.displayName?.text || "Unknown Place",
                    address: place.formattedAddress || "",
                    latitude: place.location?.latitude ?? null,
                    longitude: place.location?.longitude ?? null,
                    rating: place.rating ?? null,
                    totalReviews: place.userRatingCount || 0,
                    detourMinutes,
                    totalViaPlaceSeconds,
                    directionsUri: summary.directionsUri || null,
                    source: "route"
                };
            })
            .filter(
                (place) =>
                    place !== null &&
                    place.detourMinutes <= maxDetour
            );

        // Step 7: Add halfway places not already present
        const routePlaceIds = new Set(
            routePlaces.map((place) => place.placeId)
        );

        const halfwayPlaces = uniquePlaces
            .filter(
                (place) => !routePlaceIds.has(place.id)
            )
            .map((place) => ({
                placeId: place.id,
                name: place.displayName?.text || "Unknown Place",
                address: place.formattedAddress || "",
                latitude: place.location?.latitude ?? null,
                longitude: place.location?.longitude ?? null,
                rating: place.rating ?? null,
                totalReviews: place.userRatingCount || 0,
                detourMinutes: null,
                totalViaPlaceSeconds: null,
                directionsUri: null,
                source: "halfway"
            }));

        // Step 8: Combine and sort results
        const places = [
            ...routePlaces,
            ...halfwayPlaces
        ].sort((a, b) => {
            if (a.detourMinutes === null) return 1;
            if (b.detourMinutes === null) return -1;
            return a.detourMinutes - b.detourMinutes;
        });

        // Step 9: Send response
        return res.status(200).json({
            success: true,
            message: "Road trip places searched successfully",

            route: {
                distanceMeters: route.distanceMeters,
                duration: route.duration,
                durationSeconds: originalRouteSeconds
            },

            halfwayPoint,
            searchQuery,
            radius: searchRadius,
            maxDetourMinutes: maxDetour,

            count: places.length,
            places
        });

    } catch (error) {
        console.error("Road Trip Search Error:", error.message);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message ||
                "Failed to search road trip places"
        });
    }
};

module.exports = {
    createRoadTrip,
    getRoadTrips,
    getSingleRoadTrip,
    deleteRoadTrip,
    updateRoadTrip,
    searchRoadTrip
};