
const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        searchQuery: {
            type: String,
            required: true,
            trim: true
        },

        placeName: {
            type: String,
            trim: true,
            default: ""
        },

        address: {
            type: String,
            trim: true,
            default: ""
        },

        latitude: {
            type: Number,
            default: null
        },

        longitude: {
            type: Number,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Fetch recent searches efficiently
searchHistorySchema.index({
    user: 1,
    createdAt: -1
});

const SearchHistory = mongoose.model(
    "SearchHistory",
    searchHistorySchema
);

module.exports = SearchHistory;
