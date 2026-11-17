import { Router } from "express";
import { getModels } from "../controllers/gemini.controller.js";

const router = Router();

router.get("/models", getModels);

export default router;