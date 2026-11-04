const express = require("express");

const {
    signup,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword
} = require("../controllers/auth.controller");

const router = express.Router();

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", resetPassword);

module.exports = router;