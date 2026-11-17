import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { generateExplanation } from "./gemini.js";
import geminiRoutes from "./routes/gemini.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json({ limit: "32kb" }));

app.use("/api", rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false
}));

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "AI Ullil Backend Running"
    });
});


app.post("/api/gemini/explain", generateExplanation);
app.use("/api/gemini", geminiRoutes);

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});