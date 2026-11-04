
const express = require("express");
const router = express.Router();

const { askAI } = require("../controllers/ai.controller");
const { protect } = require("../middleware/auth.middleware");

// AI Assistant API
router.post("/ask", protect, askAI);

module.exports = router;
