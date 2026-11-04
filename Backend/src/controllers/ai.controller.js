
const getGemini = require("../config/gemini");

// Retry helper function
const generateAIResponse = async (ai, question) => {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await ai.models.generateContent({
                // model: "gemini-flash-latest",
                model:"gemini-3.8-flash",
                contents: question
            });

            return response;

        } catch (error) {
            const errorMessage = error.message || "";

            const isTemporaryError =
                error.status === 503 ||
                error.code === 503 ||
                errorMessage.includes('"code":503');

            // Retry only temporary 503 errors
            if (!isTemporaryError || attempt === maxAttempts) {
                throw error;
            }

            const delay = attempt * 2000;

            console.log(
                `Gemini attempt ${attempt} failed. Retrying after ${delay / 1000} seconds...`
            );

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// AI Assistant Controller
const askAI = async (req, res) => {
    try {
        const { question } = req.body;

        // Validate question
        if (
            typeof question !== "string" ||
            !question.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid question"
            });
        }

        // Maximum question length validation
        if (question.trim().length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Question cannot exceed 2000 characters"
            });
        }

        // Connect to Gemini
        const ai = await getGemini();

        // Generate response with automatic retry
        const response = await generateAIResponse(
            ai,
            question.trim()
        );

        // Check empty AI response
        const answer = response.text;

        if (!answer || !answer.trim()) {
            return res.status(502).json({
                success: false,
                message: "AI could not generate a response. Please try again."
            });
        }

        return res.status(200).json({
            success: true,
            message: "AI response generated successfully",
            question: question.trim(),
            answer: answer
        });

    } catch (error) {
        console.error("AI Controller Error:", error.message);

        const errorMessage = error.message || "";

        // Handle 503 error
        if (
            error.status === 503 ||
            error.code === 503 ||
            errorMessage.includes('"code":503')
        ) {
            return res.status(503).json({
                success: false,
                message: "AI Assistant is temporarily busy. Please try again later."
            });
        }

        // Handle 429 error
        if (
            error.status === 429 ||
            error.code === 429 ||
            errorMessage.includes('"code":429')
        ) {
            return res.status(429).json({
                success: false,
                message: "AI request limit reached. Please try again later."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong with AI Assistant."
        });
    }
};

module.exports = { askAI };
