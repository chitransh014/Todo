import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function breakdownTask(title, description) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Break the following task into 4–7 clear actionable subtasks.
Return them ONLY as bullet lines. No explanations. No numbering.

Task: ${title}
Description: ${description || ""}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    console.log("AI RAW OUTPUT:", raw);

    // Convert bullet list → array
    const subtasks = raw
      .split("\n")
      .map((line) => line.replace(/[-*•]/g, "").trim())
      .filter((line) => line.length > 0);

    return subtasks;
  } catch (error) {
    console.error("AI Breakdown Error:", error);
    return [];
  }
}
