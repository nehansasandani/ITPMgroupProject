import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

console.log("--- Gemini Connection Test ---");
console.log(`API Key Found: ${API_KEY ? "YES (" + API_KEY.substring(0, 6) + "...)" : "NO"}`);

if (!API_KEY) {
  console.error("FAIL: API Key is missing in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function testConnection() {
  try {
    console.log("Connecting to model 'gemini-pro'...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = "Say 'SUCCESS: Connection Established' if you receive this.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Response from AI:", text);
    if (text.includes("SUCCESS")) {
      console.log("--- TEST PASSED ✅ ---");
    } else {
      console.log("--- TEST FAILED ❌ (AI responded but check failed) ---");
    }
  } catch (error) {
    console.error("--- TEST FAILED ❌ ---");
    console.error("Status:", error.status);
    console.error("Message:", error.message);
  }
}

testConnection();
