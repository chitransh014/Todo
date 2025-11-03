import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export const breakDownGoalIntoTasks = async (goalTitle, goalDescription) => {
  try {
    const prompt = `
      Break down the following goal into actionable tasks. Provide a JSON array of tasks, each with "title" and "description" fields.

      Goal: ${goalTitle}
      Description: ${goalDescription || 'No additional description provided.'}

      Example output:
      [
        {"title": "Task 1", "description": "Description of task 1"},
        {"title": "Task 2", "description": "Description of task 2"}
      ]
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content.trim();
    const tasks = JSON.parse(content);

    if (!Array.isArray(tasks)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return tasks;
  } catch (error) {
    console.error('Error breaking down goal with OpenAI:', error);
    throw new Error('Failed to break down goal into tasks');
  }
};
