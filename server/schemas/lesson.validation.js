import { z } from "zod";

// Validate non-empty strings with a maximum length.
const str = (max = 160) =>
  z.string().trim().min(1).max(max);

// Each meaning dimension.
const dimensionSchema = z.object({
  name_ml: str(50),
  name_en: str(50),
  meaning_ml: str(300).optional(),
  meaning_en: str(300).optional(),
});

// Each word and its visualization coordinates.
const wordSchema = z.object({
  text: str(40),
  x: z.number().finite(),
  y: z.number().finite(),
  meaning_ml: str(160),
});

// Each predicted next word.
const predictionSchema = z.object({
  text: str(80),
  percent: z.number().finite(),
});

// Validate the complete lesson.
export const lessonValidationSchema = z.object({
  safe: z.literal(true),
  sentence: str(300),
  teaching_tokens: z.array(str(60)).min(1).max(60),
  dimensions: z.array(dimensionSchema).length(2),
  words: z.array(wordSchema).min(2).max(6),
  focus_word: str(40),
  insight_ml: str(300),
  next_word_options: z.array(predictionSchema).length(3),
}).superRefine((lesson, ctx) => {
  const words = lesson.words.map((word) => word.text);

  // Duplicate words are not allowed.
  if (new Set(words).size !== words.length) {
    ctx.addIssue({
      code: "custom",
      message: "Duplicate words are not allowed",
      path: ["words"],
    });
  }

  // Focus word must exist in the words array.
  if (!words.includes(lesson.focus_word)) {
    ctx.addIssue({
      code: "custom",
      message: "Focus word musqt exist in words",
      path: ["focus_word"],
    });
  }
});