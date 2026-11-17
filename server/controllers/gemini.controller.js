import { fetchGeminiModels } from "../services/gemini.service.js";

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