
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import geminiRoutes from "./routes/gemini.routes.js";

const app = express();

app.use(cors({
  origin: (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173").split(",").map(s => s.trim()),
}));

app.use(express.json({ limit: "32kb" }));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
}));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AI Ullil Backend Running",
  });
});

app.use("/api/gemini", geminiRoutes);

export default app;
