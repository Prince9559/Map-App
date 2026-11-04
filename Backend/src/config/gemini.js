
let geminiClient = null;

const getGemini = async () => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing in .env file");
        }

        if (!geminiClient) {
            const { GoogleGenAI } = await import("@google/genai");

            geminiClient = new GoogleGenAI({
                apiKey: process.env.GEMINI_API_KEY
            });
        }

        return geminiClient;

    } catch (error) {
        console.error("Gemini Initialization Error:", error.message);
        throw error;
    }
};

module.exports = getGemini;
