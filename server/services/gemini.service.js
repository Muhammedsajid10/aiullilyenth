import { GoogleGenAI } from "@google/genai";

export async function fetchGeminiModels() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: 15000 }
  });

  const models = await ai.models.list();
  const result = [];

  for await (const model of models) {
    result.push({
      name: model.name,
      displayName: model.displayName || model.name,
      supportedGenerationMethods: model.supportedActions || []
    });
  }

  return result;
}