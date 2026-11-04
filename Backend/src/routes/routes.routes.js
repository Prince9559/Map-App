const express = require("express");
const router = express.Router();

const {
    calculateRoute
} = require("../controllers/routes.controller");

const { protect } = require("../middleware/auth.middleware");

router.post("/calculate", protect, calculateRoute);

module.exports = router;