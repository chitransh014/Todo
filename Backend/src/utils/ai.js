import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI function: Breakdown goal into subtasks
export async function breakGoalIntoSubtasks(goalTitle, goalDescription = "") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Break this goal into 5-8 short, clear subtasks.
Goal: "${goalTitle}"
Description: "${goalDescription || 'N/A'}"

Return ONLY a JSON array like:
[
  {"title": "Do something"},
  {"title": "Next step"},
  {"title": "Another step"}
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Breakdown Error:", error);
    return []; // fallback
  }
}
