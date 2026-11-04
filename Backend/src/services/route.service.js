
const { decode } = require("@googlemaps/polyline-codec");

const ROUTES_API_URL =
    "https://routes.googleapis.com/directions/v2:computeRoutes";

const getRoute = async ({
    origin,
    destination,
    travelMode = "DRIVE"
}) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            throw new Error("Google Maps API key is missing");
        }

        // Validate coordinates
        const isValidLocation = (location) => {
            if (!location) return false;

            const latitude = Number(location.latitude);
            const longitude = Number(location.longitude);

            return (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude) &&
                latitude >= -90 &&
                latitude <= 90 &&
                longitude >= -180 &&
                longitude <= 180
            );
        };

        if (
            !isValidLocation(origin) ||
            !isValidLocation(destination)
        ) {
            throw new Error("Valid origin and destination coordinates are required");
        }

        // Validate travel mode
        const allowedModes = [
            "DRIVE",
            "WALK",
            "BICYCLE",
            "TWO_WHEELER",
            "TRANSIT"
        ];

        if (!allowedModes.includes(travelMode)) {
            throw new Error("Invalid travel mode");
        }

        const requestBody = {
            origin: {
                location: {
                    latLng: {
                        latitude: Number(origin.latitude),
                        longitude: Number(origin.longitude)
                    }
                }
            },

            destination: {
                location: {
                    latLng: {
                        latitude: Number(destination.latitude),
                        longitude: Number(destination.longitude)
                    }
                }
            },

            travelMode,
            languageCode: "en",
            units: "METRIC"
        };

        const response = await fetch(ROUTES_API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": [
                    "routes.distanceMeters",
                    "routes.duration",
                    "routes.polyline.encodedPolyline",
                    "routes.legs.distanceMeters",
                    "routes.legs.duration",
                    "routes.legs.startLocation",
                    "routes.legs.endLocation"
                ].join(",")
            },

            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(
                data.error?.message || "Google Routes API request failed"
            );

            error.status = response.status;
            throw error;
        }

        if (!data.routes || data.routes.length === 0) {
            throw new Error("No route found between these locations");
        }

        return data.routes[0];

    } catch (error) {
        console.error("Routes API Error:", error.message);
        throw error;
    }
};

// Calculate distance between two coordinates using Haversine formula
const getDistance = (point1, point2) => {
    const earthRadius = 6371000;

    const toRadians = (degree) => {
        return degree * (Math.PI / 180);
    };

    const lat1 = toRadians(point1[0]);
    const lon1 = toRadians(point1[1]);

    const lat2 = toRadians(point2[0]);
    const lon2 = toRadians(point2[1]);

    const differenceLat = lat2 - lat1;
    const differenceLon = lon2 - lon1;

    const a =
        Math.sin(differenceLat / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(differenceLon / 2) ** 2;

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return earthRadius * c;
};


// Calculate actual halfway point of route
const getHalfwayPoint = (encodedPolyline) => {

    if (!encodedPolyline) {
        throw new Error("Encoded polyline is required");
    }

    // Decode polyline into coordinates
    const points = decode(encodedPolyline);

    if (points.length < 2) {
        throw new Error("Route does not contain enough points");
    }

    // Calculate total route distance
    let totalDistance = 0;

    for (let i = 0; i < points.length - 1; i++) {
        totalDistance += getDistance(
            points[i],
            points[i + 1]
        );
    }

    const halfwayDistance = totalDistance / 2;

    let coveredDistance = 0;

    // Find the segment containing halfway point
    for (let i = 0; i < points.length - 1; i++) {

        const segmentDistance = getDistance(
            points[i],
            points[i + 1]
        );

        if (
            coveredDistance + segmentDistance >= halfwayDistance
        ) {

            const remainingDistance =
                halfwayDistance - coveredDistance;

            const ratio =
                remainingDistance / segmentDistance;

            const latitude =
                points[i][0] +
                (points[i + 1][0] - points[i][0]) * ratio;

            const longitude =
                points[i][1] +
                (points[i + 1][1] - points[i][1]) * ratio;

            return {
                latitude,
                longitude,
                totalDistanceMeters: totalDistance
            };
        }

        coveredDistance += segmentDistance;
    }

    throw new Error("Unable to calculate halfway point");
};


// Get a point at a specific distance from route starting point
const getPointAtDistance = (encodedPolyline, targetDistanceMeters) => {

    const points = decode(encodedPolyline);

    targetDistanceMeters = Number(targetDistanceMeters);

    if (!Number.isFinite(targetDistanceMeters) || targetDistanceMeters < 0) {
        throw new Error("Distance must be a valid positive number");
    }

    if (!points || points.length < 2) {
        throw new Error("Invalid route polyline");
    }

    let travelledDistance = 0;

    for (let i = 1; i < points.length; i++) {

        const segmentDistance = getDistance(
            points[i - 1],
            points[i]
        );

        if (travelledDistance + segmentDistance >= targetDistanceMeters) {

            const remainingDistance = targetDistanceMeters - travelledDistance;

            const fraction = segmentDistance === 0
                ? 0
                : remainingDistance / segmentDistance;

            const latitude =
                points[i - 1][0] +
                (points[i][0] - points[i - 1][0]) * fraction;

            const longitude =
                points[i - 1][1] +
                (points[i][1] - points[i - 1][1]) * fraction;

            return {
                latitude,
                longitude,
                distanceMeters: targetDistanceMeters
            };
        }

        travelledDistance += segmentDistance;
    }

    throw new Error("Requested distance exceeds route distance");
};



module.exports = {
    getRoute,
    getHalfwayPoint,
    getPointAtDistance
};