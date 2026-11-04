
const mongoose = require("mongoose");

const savedPlaceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        latitude: {
            type: Number,
            required: true
        },

        longitude: {
            type: Number,
            required: true
        },

        category: {
            type: String,
            enum: [
                "Home",
                "Work",
                "College",
                "Restaurant",
                "Hotel",
                "Other"
            ],
            default: "Other"
        },

        notes: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate places with the same name and coordinates
savedPlaceSchema.index(
    {
        user: 1,
        name: 1,
        latitude: 1,
        longitude: 1
    },
    {
        unique: true
    }
);

const SavedPlace = mongoose.model("SavedPlace", savedPlaceSchema);

module.exports = SavedPlace;
