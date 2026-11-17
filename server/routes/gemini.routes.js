import { Router } from "express";

// Import controller functions
import { getModels, generateExplanation} from "../controllers/gemini.controller.js";

const router = Router();

// GET: Fetch available Gemini models
router.get("/models", getModels);

// POST: Generate Malayalam explanation for a sentence
router.post("/explain", generateExplanation);

export default router;