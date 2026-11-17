import { fetchGeminiModels,explainSentence } from "../services/gemini.service.js";
import {z} from 'zod'

export async function getModels(req, res) {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: "AI service not configured"
    });
  }

  try {
    const models = await fetchGeminiModels();
    return res.json({ models });
  } catch (error) {
    console.error("Model listing failed:", {
      status: error?.status,
      name: error?.name
    });

    return res.status(502).json({
      error: "Unable to retrieve AI models"
    });
  }
}



const inputSchema = z.object({
  sentence: z.string().trim().min(1).max(300)
});

export async function generateExplanation(req, res) {
  const parsed = inputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid sentence"
    });
  }

  const sentence = parsed.data.sentence;

  if (sentence.split(/\s+/).length > 12) {
    return res.status(400).json({
      success: false,
      error: "Maximum 12 words allowed"
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      success: false,
      error: "AI service not configured"
    });
  }

  try {
    const explanation = await explainSentence(sentence);

    return res.json({
      success: true,
      explanation
    });
  } catch (error) {
    console.error("Gemini API Error:", {
      name: error?.name,
      status: error?.status,
      message: error?.message
    });

    return res.status(502).json({
      success: false,
      error: "AI service unavailable"
    });
  }
}