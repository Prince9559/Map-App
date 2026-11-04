const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
    secure: true
});

module.exports = cloudinary;