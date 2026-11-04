
require("dotenv").config();

const getGemini = require("./src/config/gemini");

const testGemini = async () => {
    try {
        console.log("Connecting to Gemini AI...");

        const ai = await getGemini();

        const response = await ai.models.generateContent({
            // model: "gemini-flash-latest",
            model: "gemini-3.8-flash",
            contents: "Reply with exactly: Gemini connection successful."
        });

        console.log("\nGemini Response:");
        console.log(response.text);

        console.log("\nGemini API Connected Successfully!");

    } catch (error) {
        console.error("\nGemini Test Failed:");
        console.error(error.message);
    }
};

testGemini();
