
import { describe, it, expect, vi , beforeEach,afterEach} from "vitest";
import request from "supertest";

vi.mock("../services/gemini.service.js", () => ({
    fetchGeminiModels: vi.fn(),
    explainSentence: vi.fn(),
    createLesson: vi.fn(),
}));

import { createLesson } from "../services/gemini.service.js";
import app from "../app.js";



describe("Gemini Lesson API", () => {
    it("rejects an empty sentence", async () => {
        const response = await request(app)
            .post("/api/gemini/lesson")
            .send({
                sentence: "",
            });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            error: "Invalid sentence",
        });
    });



    it("rejects sentences longer than 12 words", async () => {
        const sentence = Array(13).fill("word").join(" ");

        const response = await request(app)
            .post("/api/gemini/lesson")
            .send({ sentence });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            success: false,
            error: "Maximum 12 words allowed",
        });
    });




    it("returns 503 when Gemini API key is missing", async () => {
        const originalKey = process.env.GEMINI_API_KEY;

        try {
            delete process.env.GEMINI_API_KEY;

            const response = await request(app)
                .post("/api/gemini/lesson")
                .send({ sentence: "The bat flew" });

            expect(response.status).toBe(503);

            expect(response.body).toEqual({
                success: false,
                error: "AI service not configured",
            });
        } finally {
            if (originalKey === undefined) {
                delete process.env.GEMINI_API_KEY;
            } else {
                process.env.GEMINI_API_KEY = originalKey;
            }
        }
    });




    it("returns a safe lesson from the mocked AI service", async () => {
        const originalKey = process.env.GEMINI_API_KEY;

        try {
            process.env.GEMINI_API_KEY = "test-only-key";

            const mockLesson = {
                safe: true,
                sentence: "The bat flew",
            };

            vi.mocked(createLesson).mockResolvedValueOnce(mockLesson);

            const response = await request(app)
                .post("/api/gemini/lesson")
                .send({ sentence: "The bat flew" });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                lesson: mockLesson,
            });

            expect(createLesson).toHaveBeenCalledWith("The bat flew");
        } finally {
            if (originalKey === undefined) {
                delete process.env.GEMINI_API_KEY;
            } else {
                process.env.GEMINI_API_KEY = originalKey;
            }
        }
    });




    it("blocks unsafe lessons from the AI service", async () => {
        const originalKey = process.env.GEMINI_API_KEY;

        try {
            process.env.GEMINI_API_KEY = "test-only-key";

            vi.mocked(createLesson).mockResolvedValueOnce({
                safe: false,
            });

            const response = await request(app)
                .post("/api/gemini/lesson")
                .send({ sentence: "Test sentence" });

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                success: false,
                error: "CONTENT_BLOCKED",
            });

            expect(createLesson).toHaveBeenCalledWith("Test sentence");
        } finally {
            if (originalKey === undefined) {
                delete process.env.GEMINI_API_KEY;
            } else {
                process.env.GEMINI_API_KEY = originalKey;
            }
        }
    });





    it("returns 502 when the AI service fails", async () => {
        const originalKey = process.env.GEMINI_API_KEY;

        try {
            process.env.GEMINI_API_KEY = "test-only-key";

            vi.mocked(createLesson).mockRejectedValueOnce(
                new Error("Simulated AI service failure")
            );

            const response = await request(app)
                .post("/api/gemini/lesson")
                .send({ sentence: "The bat flew" });

            expect(response.status).toBe(502);

            expect(response.body).toEqual({
                success: false,
                error: "Unable to generate lesson",
            });

            expect(createLesson).toHaveBeenCalledWith("The bat flew");
        } finally {
            if (originalKey === undefined) {
                delete process.env.GEMINI_API_KEY;
            } else {
                process.env.GEMINI_API_KEY = originalKey;
            }
        }
    });



});
