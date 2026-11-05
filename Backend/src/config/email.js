
const { Resend } = require("resend");

// Resend API configuration
const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = {
    async sendMail({ to, subject, text, html }) {

        const { data, error } = await resend.emails.send({
            from:
                process.env.EMAIL_FROM ||
                "Map-App <onboarding@resend.dev>",

            to: [to],
            subject,
            text,
            html,
        });

        if (error) {
            console.error("Resend Email Error:", error.message);
            throw new Error(error.message || "Email sending failed");
        }

        return data;
    },
};

module.exports = transporter;
