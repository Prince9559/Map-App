import api from "./api";

export const getNearbyPlaces = async ({
    latitude,
    longitude,
    radius = 1500,
    type,
}) => {
    const response = await api.get("/places/nearby", {
        params: {
            latitude,
            longitude,
            radius,
            ...(type ? { type } : {}),
        },
    });

    return response.data.places || [];
};


export const getPlaceDetails = async (placeId) => {
    if (!placeId) {
        throw new Error("Place ID is required");
    }

    const response = await api.get(
        `/places/${encodeURIComponent(placeId)}/details`
    );

    return response.data.place;
};

export const searchLocations = async (query) => {
    if (!query || !query.trim()) {
        throw new Error("Search query is required");
    }

    const response = await api.get("/places/search", {
        params: {
            query: query.trim(),
        },
    });

    return response.data.places || [];
};
