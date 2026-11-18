import {
    fetchGeminiModels,
    explainSentence,
    createLesson,
    createSpeech,
    createRealNumbers,
} from "../services/gemini.service.js";

import { z } from 'zod'

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





/**
 * POST /api/gemini/lesson
 * Validates user input and requests a structured AI lesson.
 */
export async function generateLesson(req, res) {
    // Validate the incoming request body using the existing Zod schema.
    const parsed = inputSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid sentence",
        });
    }

    const sentence = parsed.data.sentence;

    // Keep the same 12-word limit used by the frontend.
    if (sentence.split(/\s+/).length > 12) {
        return res.status(400).json({
            success: false,
            error: "Maximum 12 words allowed",
        });
    }

    // The Gemini API key must remain on the backend.
    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
            success: false,
            error: "AI service not configured",
        });
    }

    try {
        // Delegate AI generation to the service layer.

        const lesson = await createLesson(sentence);

        // The request was processed, but the lesson was blocked.
        if (lesson.safe === false) {
            return res.status(200).json({
                success: false,
                error: "CONTENT_BLOCKED",
            });
        }

        // Return a successfully generated lesson.
        return res.json({
            success: true,
            lesson,
        });


    } catch (error) {
        console.error("Lesson generation failed:", {
            name: error?.name,
            status: error?.status,
            message: error?.message,
        });

        return res.status(502).json({
            success: false,
            error: "Unable to generate lesson",
        });
    }

}


const speechSchema = z.object({ text: z.string().trim().min(1).max(5000) });
const realSchema = z.object({ sentence: z.string().trim().min(1).max(300), words: z.array(z.string().trim().min(1).max(100)).min(2).max(6) });

export async function generateSpeech(req, res) {
    const parsed = speechSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid speech text"
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
            error: "AI service not configured"
        });
    }

    try {
        const result = await createSpeech(parsed.data.text);
        return res.json(result);

    } catch (error) {
        console.error("Speech generation failed:", {
            name: error?.name,
            status: error?.status,
            code: error?.code,
            message: error?.message
        });

        const status =
            error?.code === "NO_SPEECH_MODEL" ? 404 :
            Number(error?.status) === 429 ? 429 : 502;

        return res.status(status).json({
            error: error?.code === "NO_SPEECH_MODEL"
                ? "NO_SPEECH_MODEL"
                : "Speech unavailable"
        });
    }
}

export async function getRealNumbers(req, res) {
    const parsed = realSchema.safeParse(req.body);
    if (!parsed.success || parsed.data.sentence.split(/\s+/).length > 12) return res.status(400).json({ error: "Invalid real-number request" });
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "AI service not configured" });
    try { return res.json(await createRealNumbers(parsed.data.sentence, parsed.data.words)); }
    catch (error) { console.error("Real numbers failed:", { name: error?.name, status: error?.status }); return res.status(Number(error?.status) === 429 ? 429 : 502).json({ error: "Real-number service unavailable" }); }
}
