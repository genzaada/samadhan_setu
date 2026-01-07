const { geminiFlash } = require("../ai/gemini");

const improveIssue = async (req, res) => {
    try {
        const { rawText } = req.body;

        const prompt = `
You are an AI assistant inside a civic issue reporting platform (VISIONX).
Your task is to analyze ADMIN‑SIDE issue submissions.

User Issue:
"${rawText}"

Generate the following strictly in JSON format:
{
  "category": "...",
  "improved_description": "...",
  "severity_level": "low | medium | high",
  "priority": "Low | Medium | High | Critical",
  "recommended_action": "...",
  "why_flagged": "brief explanation"
}
`;

        const result = await geminiFlash.generateContent(prompt);
        // Handle potential markdown code block wrapping in response
        let responseText = result.response.text();
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const output = JSON.parse(responseText);

        return res.json(output);
    } catch (err) {
        console.log("AI Error:", err);
        return res.status(500).json({ error: "AI processing failed" });
    }
};

module.exports = { improveIssue };
