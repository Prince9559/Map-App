
const express = require("express");

const router = express.Router();

const {
    addSearchHistory,
    getSearchHistory,
    deleteSearchHistory,
    clearSearchHistory
} = require("../controllers/searchHistory.controller");

const { protect } = require("../middleware/auth.middleware");

// All routes are protected
router.post("/", protect, addSearchHistory);

router.get("/", protect, getSearchHistory);

// Clear all history
router.delete("/", protect, clearSearchHistory);

// Delete one history record
router.delete("/:id", protect, deleteSearchHistory);

module.exports = router;
