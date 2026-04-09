import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateQuiz = async (skill, level) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Generate 5 multiple-choice questions for the skill "${skill}" at "${level}" level.
          Return ONLY a valid JSON array with exactly 5 objects. Each object MUST have:
          - "question": string
          - "options": array of exactly 4 strings  
          - "correctIndex": integer (0 to 3)
          - "explanation": a concise string explaining why the correct answer is right.
          No explanation text outside JSON, no markdown, just raw JSON array.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    
    // Clean markdown if present
    const cleaned = text.replace(/```json|```/g, "").trim();
    const quiz = JSON.parse(cleaned);

    if (!Array.isArray(quiz) || quiz.length !== 5) {
      throw new Error("Failed to generate exactly 5 questions.");
    }

    return quiz;
  } catch (error) {
    console.error("=== QUIZ ERROR ===", error.message);
    throw new Error("Failed to generate quiz: " + error.message);
  }
};