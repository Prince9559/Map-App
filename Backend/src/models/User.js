const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 50
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false
        },
       tokenVersion: {
            type: Number,
            default: 0
        },

        profileImage: {
            url: {
                type: String,
                default: ""
            },
            publicId: {
                type: String,
                default: ""
            }
        },
        // Forgot Password OTP Fields
        resetPasswordOtpHash: {
            type: String,
            default: null,
            select: false
        },

        resetPasswordOtpExpiresAt: {
            type: Date,
            default: null,
            select: false
        },

        resetPasswordOtpAttempts: {
            type: Number,
            default: 0,
            select: false
        },

        resetPasswordOtpLastSentAt: {
            type: Date,
            default: null,
            select: false
        },

        // Password Reset Token Fields
        resetPasswordTokenHash: {
            type: String,
            default: null,
            select: false
        },

        resetPasswordTokenExpiresAt: {
            type: Date,
            default: null,
            select: false
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;