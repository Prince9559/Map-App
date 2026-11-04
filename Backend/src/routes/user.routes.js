const express = require("express");

const {
    getProfile,
    updateProfile,
    uploadProfileImage
} = require("../controllers/user.controller");

const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

// Get profile
router.get("/profile", protect, getProfile);

// Update profile
router.put("/profile", protect, updateProfile);

// Upload profile image
router.put(
    "/profile/image",
    protect,
    upload.single("profileImage"),
    uploadProfileImage
);

module.exports = router;