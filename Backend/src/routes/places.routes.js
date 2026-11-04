
const express = require("express");

const router = express.Router();
const {
    savePlace,
    getSavedPlaces,
    deleteSavedPlace,
    searchLocations,
    getNearbyPlaces,
    getPlaceDetailsController,
    analyzePlaceReviewsController,
    searchAlongRoute,
    searchHalfwayNearby,
    searchHalfwaySearch,
    searchPlacesByDistance,
    searchAlongRouteBasic
    
} = require("../controllers/places.controller");

const { protect } = require("../middleware/auth.middleware");

// All routes are protected
router.post("/", protect, savePlace);

router.get("/", protect, getSavedPlaces);

router.delete("/:id", protect, deleteSavedPlace);

router.get("/search", protect, searchLocations);

router.get("/nearby", protect, getNearbyPlaces);

router.post("/search-along-route-detour", protect, searchAlongRoute);

router.post("/halfway-nearby", protect, searchHalfwayNearby);
// Get details of a specific place
router.get("/:placeId/details", protect, getPlaceDetailsController);

router.get("/:placeId/analyze", protect, analyzePlaceReviewsController);

router.post("/halfway-search", protect, searchHalfwaySearch);

router.post("/halfway-by-distance",protect,searchPlacesByDistance);

router.post("/search-along-route-basic", protect, searchAlongRouteBasic);



module.exports = router;
