
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import geminiRoutes from "./routes/gemini.routes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
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
