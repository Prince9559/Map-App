const crypto = require("crypto");

const generateOtp = () => {
    // Generate a secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Create OTP hash
    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    return {
        otp,
        otpHash
    };
};

module.exports = generateOtp;