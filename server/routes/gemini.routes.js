
import { Router } from "express";


import { getModels, generateExplanation,generateLesson,} from "../controllers/gemini.controller.js";

const router = Router();

// GET: Fetch available Gemini models
router.get("/models", getModels);

// POST: Generate Malayalam explanation for a sentence
router.post("/explain", generateExplanation);

// POST: Generate a structured AI learning lesson
router.post("/lesson", generateLesson);

export default router;
