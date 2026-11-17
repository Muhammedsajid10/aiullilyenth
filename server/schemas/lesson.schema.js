
const string = { type: "STRING" };
const integer = { type: "INTEGER" };

// Expected JSON structure for Gemini-generated lessons.
export const lessonResponseSchema = {
    type: "OBJECT",
    properties: {
        safe: { type: "BOOLEAN" },
        sentence: string,
        teaching_tokens: {
            type: "ARRAY",
            items: string,
        },
        dimensions: {
            type: "ARRAY",
            minItems: 2,
            maxItems: 2,
            items: {
                type: "OBJECT",
                properties: {
                    name_ml: string,
                    name_en: string,
                    meaning_ml: string,
                    meaning_en: string,
                },
                required: [
                    "name_ml",
                    "name_en",
                    "meaning_ml",
                    "meaning_en",
                ],
            },
        },
        words: {
            type: "ARRAY",
            minItems: 2,
            maxItems: 6,
            items: {
                type: "OBJECT",
                properties: {
                    text: string,
                    x: { ...integer, minimum: 0, maximum: 10 },
                    y: { ...integer, minimum: 0, maximum: 10 },
                    meaning_ml: string,
                },
                required: ["text", "x", "y", "meaning_ml"],
            },
        },
        focus_word: string,
        insight_ml: string,
        next_word_options: {
            type: "ARRAY",
            minItems: 3,
            maxItems: 3,
            items: {
                type: "OBJECT",
                properties: {
                    text: string,
                    percent: integer,
                },
                required: ["text", "percent"],
            },
        },
    },
    required: [
        "safe",
        "sentence",
        "teaching_tokens",
        "dimensions",
        "words",
        "focus_word",
        "insight_ml",
        "next_word_options",
    ],

};