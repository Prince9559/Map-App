
const SearchHistory = require("../models/SearchHistory");

// @desc    Save a search history record
// @route   POST /api/search-history
// @access  Private
const addSearchHistory = async (req, res) => {
    try {
        const {
            searchQuery,
            placeName,
            address,
            latitude,
            longitude
        } = req.body;

        if (!searchQuery || !searchQuery.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // Validate coordinates if provided
        const hasLatitude = latitude !== undefined && latitude !== null;
        const hasLongitude = longitude !== undefined && longitude !== null;

        if (hasLatitude !== hasLongitude) {
            return res.status(400).json({
                success: false,
                message: "Both latitude and longitude are required together"
            });
        }

        if (
            hasLatitude &&
            (
                !Number.isFinite(Number(latitude)) ||
                !Number.isFinite(Number(longitude)) ||
                Number(latitude) < -90 ||
                Number(latitude) > 90 ||
                Number(longitude) < -180 ||
                Number(longitude) > 180
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude"
            });
        }

        const history = await SearchHistory.create({
            user: req.user._id,
            searchQuery: searchQuery.trim(),
            placeName,
            address,
            latitude: hasLatitude ? Number(latitude) : null,
            longitude: hasLongitude ? Number(longitude) : null
        });

        return res.status(201).json({
            success: true,
            message: "Search history added successfully",
            history
        });

    } catch (error) {
        console.error("Add Search History Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to add search history"
        });
    }
};


// @desc    Get user's search history
// @route   GET /api/search-history
// @access  Private
const getSearchHistory = async (req, res) => {
    try {
        const history = await SearchHistory.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Search history fetched successfully",
            count: history.length,
            history
        });

    } catch (error) {
        console.error("Get Search History Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch search history"
        });
    }
};


// @desc    Delete one search history record
// @route   DELETE /api/search-history/:id
// @access  Private
const deleteSearchHistory = async (req, res) => {
    try {
        const history = await SearchHistory.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "Search history not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Search history deleted successfully"
        });

    } catch (error) {
        console.error("Delete Search History Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete search history"
        });
    }
};


// @desc    Clear all search history
// @route   DELETE /api/search-history
// @access  Private
const clearSearchHistory = async (req, res) => {
    try {
        const result = await SearchHistory.deleteMany({
            user: req.user._id
        });

        return res.status(200).json({
            success: true,
            message: "Search history cleared successfully",
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error("Clear Search History Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to clear search history"
        });
    }
};


module.exports = {
    addSearchHistory,
    getSearchHistory,
    deleteSearchHistory,
    clearSearchHistory
};
