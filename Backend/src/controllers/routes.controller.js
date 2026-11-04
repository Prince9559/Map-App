const { getRoute } = require("../services/route.service");

const calculateRoute = async (req, res) => {
    try {
        const {
            origin,
            destination,
            travelMode
        } = req.body;

        // Validate input
        if (!origin || !destination) {
            return res.status(400).json({
                success: false,
                message: "Origin and destination are required"
            });
        }

        // Get route from Google Routes API
        const route = await getRoute({
            origin,
            destination,
            travelMode: travelMode || "DRIVE"
        });

        // Send response
        return res.status(200).json({
            success: true,
            message: "Route calculated successfully",

            route: {
                distanceMeters: route.distanceMeters,

                distanceKm: (
                    route.distanceMeters / 1000
                ).toFixed(2),

                duration: route.duration,

                polyline:
                    route.polyline?.encodedPolyline || "",

                startLocation:
                    route.legs?.[0]?.startLocation || null,

                endLocation:
                    route.legs?.[0]?.endLocation || null
            }
        });

    } catch (error) {
        console.error("Calculate Route Error:", error.message);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to calculate route"
        });
    }
};

module.exports = {
    calculateRoute
};