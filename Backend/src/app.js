
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// Security middleware
app.use(helmet());

// Common middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const placesRoutes = require("./routes/places.routes");
const searchHistoryRoutes = require("./routes/searchHistory.routes");
const routesRoutes = require("./routes/routes.routes");
const roadtripRoutes = require("./routes/roadtrip.routes");
const aiRoutes = require("./routes/ai.routes");

// Health Check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Map-App Backend is running successfully!",
        status: "OK"
    });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/search-history", searchHistoryRoutes);
app.use("/api/routes", routesRoutes);
app.use("/api/roadtrips", roadtripRoutes);
app.use("/api/ai", aiRoutes);

// Error handler (must be last)
const errorHandler = require("./middleware/error.middleware");
app.use(errorHandler);

module.exports = app;
