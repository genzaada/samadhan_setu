const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');

const genAI = new ChatGoogleGenerativeAI({
    model: "gemini-pro",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.3,
});

// 1. Citizen Issue Enhancement Chain
const enhancementTemplate = `
You are an AI assistant for a civic issue reporting platform.
Your task is to analyze the following citizen report and extract structured information.
Citizen Report: "{description}"

Output strictly in the following JSON format:
{
  "enhanced_description": "Clear, professional, and detailed description of the issue.",
  "category": "One of: Sanitation, Roads, Water, Electricity, Public Safety, Other",
  "priority": "One of: Low, Medium, High, Critical"
}
`;

const enhancementChain = RunnableSequence.from([
    PromptTemplate.fromTemplate(enhancementTemplate),
    genAI,
    new StringOutputParser(),
]);

const enhanceIssueDescription = async (description) => {
    try {
        const response = await enhancementChain.invoke({ description });
        // Attempt to clean markdown if present (e.g. ```json ... ```)
        const jsonString = response.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("AI Enhancement Error:", error);
        // Fallback if AI fails
        return {
            enhanced_description: description,
            category: "Other",
            priority: "Medium"
        };
    }
};

// 2. Admin Summarization Chain
const summaryTemplate = `
You are an expert civic analyst. Summarize the following list of pending issues for an executive administrator.
Issues List:
{issues}

Provide a concise summary grouping by category and highlighting critical areas.
Output strictly in text format suitable for a daily report.
`;

const summaryChain = RunnableSequence.from([
    PromptTemplate.fromTemplate(summaryTemplate),
    genAI,
    new StringOutputParser(),
]);

const summarizeIssues = async (issues) => {
    try {
        const issuesText = issues.map(i => `- [${i.category}] ${i.title} (${i.priority}): ${i.location?.address || 'No Address'}`).join('\n');
        const response = await summaryChain.invoke({ issues: issuesText });
        return response;
    } catch (error) {
        console.error("AI Summary Error:", error);
        return "Unable to generate summary at this time.";
    }
};

// 3. Feedback Generation Chain
const feedbackTemplate = `
You are a polite civic representative.Write a short message to a citizen informing them that their issue has been resolved.
Issue Title: "{title}"
Resolution Remark: "{remark}"

Keep it warm, professional, and concise.
`;

const feedbackChain = RunnableSequence.from([
    PromptTemplate.fromTemplate(feedbackTemplate),
    genAI,
    new StringOutputParser(),
]);

const generateFeedback = async (title, remark) => {
    try {
        const response = await feedbackChain.invoke({ title, remark });
        return response;
    } catch (error) {
        console.error("AI Feedback Error:", error);
        return "Thank you for your report. The issue has been resolved.";
    }
};

module.exports = {
    enhanceIssueDescription,
    summarizeIssues,
    generateFeedback
};
