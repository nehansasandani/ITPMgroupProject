import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

export const generateQuiz = async (skill, level) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured. Please add GROQ_API_KEY to .env file.");
    }

    // Create fresh Groq instance with current API key (this ensures .env changes are picked up)
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    
    if (!text) {
      throw new Error("Empty response from Groq API");
    }

    // Clean markdown if present
    const cleaned = text.replace(/```json|```/g, "").trim();
    const quiz = JSON.parse(cleaned);

    if (!Array.isArray(quiz) || quiz.length !== 5) {
      throw new Error("Failed to generate exactly 5 questions.");
    }

    return quiz;
  } catch (error) {
    console.error("=== QUIZ ERROR ===");
    console.error("Error Message:", error.message);
    console.error("Error Status:", error.status);
    console.error("Full Error:", error);
    
    // Provide more specific error messages
    if (error.status === 401 || error.message.includes("401") || error.message.includes("Unauthorized") || error.message.includes("authentication")) {
      throw new Error("Groq API key is invalid or expired. Please check your credentials.");
    } else if (error.status === 429 || error.message.includes("429") || error.message.includes("Too many requests")) {
      throw new Error("Too many requests. Please try again in a moment.");
    } else if (error.message.includes("GROQ_API_KEY")) {
      throw error;
    } else if (error.message.includes("Failed to generate exactly 5 questions")) {
      throw new Error("Quiz format invalid. Try again.");
    } else {
      throw new Error("Failed to generate quiz: " + error.message);
    }
  }
};