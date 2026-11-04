require("dotenv").config();

const transporter = require("./src/config/email");

const testEmail = async () => {
    try {
        await transporter.verify();

        console.log("Gmail SMTP Connected Successfully!");

    } catch (error) {
        console.error("Email Connection Failed:", error.message);
    }
};

testEmail();