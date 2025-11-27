import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function breakdownTask(title, description) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Break the following task into actionable subtasks.
Return ONLY a JSON array of short subtasks.

Example output:
["Define requirements", "Create UI screens", "Setup backend API"]

Task Title: ${title}
Task Description: ${description || "No Description"}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error("AI Breakdown Error:", error);
    return [];
  }
}
