const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Ensure API key matches the one in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiFlash = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
});

module.exports = { geminiFlash };
