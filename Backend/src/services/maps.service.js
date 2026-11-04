
const PLACES_API_URL = "https://places.googleapis.com/v1/places";


// Fields returned by Google Places API
const PLACE_FIELDS = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.types",
    "places.primaryType",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel"
].join(",");

// Common function to call Google Places API
const googlePlacesRequest = async (endpoint, body) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            throw new Error("Google Maps API key is missing");
        }

        const response = await fetch(
            `${PLACES_API_URL}:${endpoint}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": PLACE_FIELDS
                },

                body: JSON.stringify(body)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(
                data.error?.message || "Google Maps API request failed"
            );

            error.status = response.status;

            throw error;
        }

        return data;

    } catch (error) {
        console.error("Google Places API Error:", error.message);
        throw error;
    }
};


// Search places by name or text
const searchPlaces = async (searchQuery) => {

    if (!searchQuery || !searchQuery.trim()) {
        throw new Error("Search query is required");
    }

    const body = {
        textQuery: searchQuery.trim(),
        maxResultCount: 10,
        languageCode: "en",
        regionCode: "IN"
    };

    return await googlePlacesRequest(
        "searchText",
        body
    );
};


// Search places near a specific location using text query
const searchPlacesNearLocation = async ({
    searchQuery,
    latitude,
    longitude,
    radius = 1500
}) => {

    if (!searchQuery || !searchQuery.trim()) {
        throw new Error("Search query is required");
    }

    latitude = Number(latitude);
    longitude = Number(longitude);
    radius = Number(radius);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        throw new Error("Invalid latitude or longitude");
    }

    if (
        !Number.isFinite(radius) ||
        radius < 1 ||
        radius > 50000
    ) {
        throw new Error("Radius must be between 1 and 50000 meters");
    }

    const body = {
        textQuery: searchQuery.trim(),
        maxResultCount: 20,
        languageCode: "en",
        regionCode: "IN",

        locationBias: {
            circle: {
                center: {
                    latitude,
                    longitude
                },
                radius
            }
        }
    };

    return await googlePlacesRequest("searchText", body);
};

// Find nearby places
const nearbyPlaces = async ({
    latitude,
    longitude,
    radius = 1500,
    includedTypes = []
}) => {

    latitude = Number(latitude);
    longitude = Number(longitude);
    radius = Number(radius);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        throw new Error("Invalid latitude or longitude");
    }

    if (
        !Number.isFinite(radius) ||
        radius <= 0 ||
        radius > 50000
    ) {
        throw new Error("Radius must be between 1 and 50000 meters");
    }

    const body = {
        maxResultCount: 10,

        rankPreference: "DISTANCE",

        locationRestriction: {
            circle: {
                center: {
                    latitude,
                    longitude
                },
                radius
            }
        }
    };

    if (includedTypes.length > 0) {
        body.includedTypes = includedTypes;
    }

    return await googlePlacesRequest(
        "searchNearby",
        body
    );
};

// Search places along a route
// Search places along route with routing summaries
const searchPlacesAlongRoute = async ({
    searchQuery,
    encodedPolyline
}) => {
    if (!searchQuery || !searchQuery.trim()) {
        throw new Error("Search query is required");
    }

    if (!encodedPolyline) {
        throw new Error("Route polyline is required");
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        throw new Error("Google Maps API key is missing");
    }

    const fields = [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.types",
        "places.rating",
        "places.userRatingCount",
        "places.primaryType",
        "routingSummaries"
    ].join(",");

    try {
        const response = await fetch(
            `${PLACES_API_URL}:searchText`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": fields
                },

                body: JSON.stringify({
                    textQuery: searchQuery.trim(),

                    searchAlongRouteParameters: {
                        polyline: {
                            encodedPolyline
                        }
                    },

                    routingParameters: {
                        travelMode: "DRIVE"
                    },

                    maxResultCount: 20,
                    languageCode: "en",
                    regionCode: "IN"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(
                data.error?.message || "Search along route failed"
            );

            error.status = response.status;
            throw error;
        }

        return data;

    } catch (error) {
        console.error(
            "Search Along Route Error:",
            error.message
        );

        throw error;
    }
};

// Get details of a specific place using Place ID
const getPlaceDetails = async (placeId) => {

    if (!placeId || !placeId.trim()) {
        throw new Error("Place ID is required");
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        throw new Error("Google Maps API key is missing");
    }

    // Fields required for Place Details
    const fields = [
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "types",
    "primaryType",
    "rating",
    "userRatingCount",
    "priceLevel",
    "nationalPhoneNumber",
    "internationalPhoneNumber",
    "websiteUri",
    "regularOpeningHours",
    "googleMapsUri",
    "reviews",
    "reviewSummary"
].join(",");

    try {
        const response = await fetch(
            `${PLACES_API_URL}/${encodeURIComponent(placeId)}`,
            {
                method: "GET",

                headers: {
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": fields
                }
            }
        );

        const data = await response.json();
        console.log(
    "GOOGLE PLACE DETAILS RAW RESPONSE:",
    JSON.stringify(data, null, 2)
);

        if (!response.ok) {
            const error = new Error(
                data.error?.message || "Failed to fetch place details"
            );

            error.status = response.status;

            throw error;
        }

        console.log("Google Raw Reviews:", data.reviews);
console.log("Google Raw Review Summary:", data.reviewSummary);

        return data;

    } catch (error) {
        console.error("Place Details API Error:", error.message);
        throw error;
    }
};

module.exports = {
    searchPlaces,
    nearbyPlaces,
    getPlaceDetails,
    searchPlacesAlongRoute,
    searchPlacesNearLocation
};