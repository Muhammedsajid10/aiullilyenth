import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 15000
  }
});

try {
  const models = await ai.models.list();

  for await (const model of models) {
    if (model.supportedActions?.includes("generateContent")) {
      console.log(model.name);
    }
  }
} catch (error) {
  console.error("Failed to list models:", {
    status: error?.status,
    message: error?.message
  });
}