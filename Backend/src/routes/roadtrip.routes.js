const express = require("express");
const router = express.Router();

const {
    createRoadTrip,
    getRoadTrips,
    getSingleRoadTrip,
    deleteRoadTrip,
    updateRoadTrip,
    searchRoadTrip
} = require("../controllers/roadtrip.controller");

const { protect } = require("../middleware/auth.middleware");

// Create Road Trip
router.post("/", protect, createRoadTrip);

// Get All Road TripssearchRoadTrip
router.get("/", protect, getRoadTrips);

// Get Single Road Trip
router.get("/:id", protect, getSingleRoadTrip);

// Delete Road Trip
router.delete("/:id", protect, deleteRoadTrip);

// Update Road Trip
router.put("/:id", protect, updateRoadTrip);

router.post("/search", protect, searchRoadTrip);

module.exports = router;