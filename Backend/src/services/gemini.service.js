
const getGemini = require("../config/gemini");

// Analyze place reviews using Gemini AI
const analyzePlaceReviews = async (reviews, placeName) => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
        throw new Error("No reviews available for analysis");
    }

    const ai = await getGemini();

    const reviewText = reviews
        .map((review, index) => {
            return `${index + 1}. ${review.text?.text || "No review text available"} 
Rating: ${review.rating || "Not available"}`;
        })
        .join("\n\n");

    const prompt = `
You are a place review analysis assistant.

Analyze the following customer reviews for "${placeName}".

Reviews:
${reviewText}

Provide your analysis in these sections:

1. Overall Summary
2. Positive Points
3. Negative Points
4. Common Customer Complaints
5. Overall Customer Experience
6. Final Recommendation

Keep the explanation simple, clear and useful for someone deciding whether to visit this place.

Do not invent information that is not present in the reviews.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt
    });

    const answer = response.text;

    if (!answer || !answer.trim()) {
        throw new Error("Gemini could not generate review analysis");
    }

    return answer;
};

module.exports = {
    analyzePlaceReviews
};
