const mongoose = require("mongoose");

const roadTripSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        startLocation: {
            name: {
                type: String,
                required: true
            },
            address: {
                type: String,
                default: ""
            },
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        },

        destinations: [
            {
                name: {
                    type: String,
                    required: true
                },
                address: {
                    type: String,
                    default: ""
                },
                latitude: {
                    type: Number,
                    required: true
                },
                longitude: {
                    type: Number,
                    required: true
                },
                order: {
                    type: Number,
                    required: true
                }
            }
        ],

        totalDistance: {
            type: Number,
            default: 0
        },

        estimatedDuration: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["planned", "ongoing", "completed"],
            default: "planned"
        },

    travelMode: {
    type: String,
    enum: [
        "DRIVE",
        "TWO_WHEELER",
        "BICYCLE",
        "WALK",
        "TRANSIT"
    ],
    default: "DRIVE"
},

        travelDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

roadTripSchema.index({
    user: 1,
    createdAt: -1
});

const RoadTrip = mongoose.model("RoadTrip", roadTripSchema);

module.exports = RoadTrip;