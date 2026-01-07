const { geminiFlash } = require('./ai/gemini');
require('dotenv').config();

console.log("API Key present:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log("API Key length:", process.env.GEMINI_API_KEY.length);
    console.log("API Key start:", process.env.GEMINI_API_KEY.substring(0, 5));
}

(async () => {
    try {
        console.log("Testing Gemini generation...");
        const result = await geminiFlash.generateContent("Hello, are you working?");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Gemini Error:", e);
    }
})();
