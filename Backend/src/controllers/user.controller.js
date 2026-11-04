const getProfile = async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Get Profile Error:", error.stack);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching profile"
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = req.user;

        const { name } = req.body;

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty"
                });
            }

            user.name = name.trim();
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Update Profile Error:", error.stack);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating profile"
        });
    }
};

const cloudinary = require("../config/cloudinary");

const uploadProfileImage = async (req, res) => {
    try {
        const user = req.user;

        // Check uploaded image
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a profile image"
            });
        }

        // Store old image public ID
        const oldPublicId = user.profileImage?.publicId;

        // Save new image details
        user.profileImage = {
            url: req.file.path,
            publicId: req.file.filename
        };

        // Save new image in MongoDB
        await user.save();

        // Delete old image after successful database update
        if (oldPublicId && oldPublicId !== req.file.filename) {
            try {
                const result = await cloudinary.uploader.destroy(oldPublicId);

                if (result.result !== "ok" && result.result !== "not found") {
                    console.error("Old image deletion result:", result);
                }
            } catch (deleteError) {
                console.error("Old image deletion failed:", deleteError);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            profileImage: user.profileImage
        });

    } catch (error) {
        console.error("Profile Image Error:", error.stack);

        // Remove newly uploaded image if database update fails
        if (req.file?.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cleanupError) {
                console.error("New image cleanup failed:", cleanupError);
            }
        }

        return res.status(500).json({
            success: false,
            message: "Profile image upload failed"
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfileImage
};