const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const transporter = require("../config/email");
const generateOtp = require("../utils/generateOtp");

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        const token = generateToken(user);
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error("Signup Error:", error.stack);

        res.status(500).json({
            success: false,
            message: "Something went wrong during signup"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user and include password
        const user = await User.findOne({
            email: email.toLowerCase().trim()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate token
        const token = generateToken(user);

        // Success response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error("Login Error:", error.stack);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during login"
        });
    }
};

// FORGOT PASSWORD - SEND OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        }).select(
            "+resetPasswordOtpHash +resetPasswordOtpExpiresAt +resetPasswordOtpAttempts +resetPasswordOtpLastSentAt"
        );

        // Generic response to prevent email enumeration
        const genericResponse = {
            success: true,
            message: "If this email is registered, an OTP will be sent."
        };

        if (!user) {
            return res.status(200).json(genericResponse);
        }

        // 60-second resend cooldown
        if (
            user.resetPasswordOtpLastSentAt &&
            Date.now() - user.resetPasswordOtpLastSentAt.getTime() < 60000
        ) {
            return res.status(429).json({
                success: false,
                message: "Please wait 60 seconds before requesting another OTP."
            });
        }

        // Generate secure OTP
        const { otp, otpHash } = generateOtp();

        user.resetPasswordOtpHash = otpHash;
        user.resetPasswordOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        user.resetPasswordOtpAttempts = 0;
        user.resetPasswordOtpLastSentAt = new Date();

        await user.save();

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: "Map-App - Password Reset OTP",
                text: `Your Map-App password reset OTP is ${otp}. It is valid for 5 minutes. Do not share this OTP with anyone.`,
                html: `
                    <div style="font-family:Arial,sans-serif;padding:25px;">
                        <h2>Map-App Password Reset</h2>
                        <p>Your password reset OTP is:</p>
                        <h1 style="letter-spacing:8px;">${otp}</h1>
                        <p>This OTP expires in 5 minutes.</p>
                        <p>Do not share this OTP with anyone.</p>
                    </div>
                `
            });

        } catch (emailError) {
            // Clear OTP if email delivery fails
            user.resetPasswordOtpHash = null;
            user.resetPasswordOtpExpiresAt = null;
            user.resetPasswordOtpLastSentAt = null;

            await user.save();

            throw emailError;
        }

        return res.status(200).json(genericResponse);

    } catch (error) {
        console.error("Forgot Password Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to process password reset request"
        });
    }
};


// VERIFY PASSWORD RESET OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 6-digit OTP"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select(
            "+resetPasswordOtpHash +resetPasswordOtpExpiresAt +resetPasswordOtpAttempts"
        );

        if (!user || !user.resetPasswordOtpHash) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        if (
            !user.resetPasswordOtpExpiresAt ||
            user.resetPasswordOtpExpiresAt.getTime() < Date.now()
        ) {
            user.resetPasswordOtpHash = null;
            user.resetPasswordOtpExpiresAt = null;
            user.resetPasswordOtpAttempts = 0;
            await user.save();

            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        if (user.resetPasswordOtpAttempts >= 5) {
            user.resetPasswordOtpHash = null;
            user.resetPasswordOtpExpiresAt = null;
            user.resetPasswordOtpAttempts = 0;
            await user.save();

            return res.status(429).json({
                success: false,
                message: "Too many attempts. Please request a new OTP."
            });
        }

        const submittedHash = crypto
            .createHash("sha256")
            .update(String(otp))
            .digest("hex");

        const isMatch = crypto.timingSafeEqual(
            Buffer.from(submittedHash, "hex"),
            Buffer.from(user.resetPasswordOtpHash, "hex")
        );

        if (!isMatch) {
            user.resetPasswordOtpAttempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: "Incorrect OTP"
            });
        }

        // OTP verified: generate a secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordOtpHash = null;
        user.resetPasswordOtpExpiresAt = null;
        user.resetPasswordOtpAttempts = 0;

        user.resetPasswordTokenHash = resetTokenHash;
        user.resetPasswordTokenExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            resetToken
        });

    } catch (error) {
        console.error("OTP Verification Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "OTP verification failed"
        });
    }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, reset token and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            resetPasswordTokenHash: tokenHash,
            resetPasswordTokenExpiresAt: { $gt: new Date() }
        }).select(
            "+resetPasswordTokenHash +resetPasswordTokenExpiresAt"
        );

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        // Update password
        user.password = newPassword;
        // Invalidate all previous JWT tokens
        user.tokenVersion += 1;

        // Remove reset token after successful password reset
        user.resetPasswordTokenHash = null;
        user.resetPasswordTokenExpiresAt = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Please login again."
        });

    } catch (error) {
        console.error("Reset Password Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Password reset failed"
        });
    }
};

module.exports = {
    signup,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword
};