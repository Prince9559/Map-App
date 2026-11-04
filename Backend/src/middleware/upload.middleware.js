const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,

    params: {
        folder: "map-app/profile-images",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],

        transformation: [
            {
                width: 500,
                height: 500,
                crop: "limit"
            }
        ]
    }
});

// Multer configuration
const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;