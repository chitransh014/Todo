import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function breakdownTask(title, description) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",   // ✅ USE GEMINI 2.0 FLASH
    });

    const prompt = `
Break the following task into 4–5 clear actionable subtasks.
Return ONLY a simple bullet list, no extra text.

Task: ${title}
Description: ${description || ""}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    console.log("AI RAW OUTPUT:", raw);

    // Convert output to array
    const subtasks = raw
      .split("\n")
      .map(line => line.replace(/[-*•]/g, "").trim())
      .filter(line => line.length > 0);

    return subtasks;
  } catch (err) {
    console.error("AI Breakdown Error:", err);
    return [];
  }
}
