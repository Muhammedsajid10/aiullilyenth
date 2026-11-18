import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import {
  generateLesson,
  listModels,
  realNumbers,
  saveConfig,
  loadConfig,
  removeKey,
  chooseModels,
  generateLessonWithRecovery,
} from "./index";
import { demos } from "../../lessons";
import type { Config } from "../../types";
const cfg: Config = {
  key: "test-only-not-a-real-key",
  remember: false,
  textModel: "models/test-text",
  embeddingModel: "models/test-embedding",
  models: [],
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const fakeStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => map.set(k, v),
    removeItem: (k: string) => map.delete(k),
  };
};
beforeEach(() => {
  vi.stubGlobal("sessionStorage", fakeStorage());
  vi.stubGlobal("localStorage", fakeStorage());
});
afterEach(() => vi.unstubAllGlobals());
describe("Gemini browser client", () => {

  it("sends lesson requests to our backend without exposing the API key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({ success: true, lesson: demos[1] }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const lesson = await generateLesson("A bat flew", cfg);

    expect(lesson.safe).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe("/api/gemini/lesson");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");

    expect(JSON.parse(options.body)).toEqual({
      sentence: "A bat flew",
    });

    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain(cfg.key);
  });


  it("fetches models from our backend without exposing the API key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({
        models: [
          {
            name: "models/a",
            displayName: "Model A",
            supportedGenerationMethods: ["generateContent"],
          },
          {
            name: "models/b",
            displayName: "Model B",
            supportedGenerationMethods: ["embedContent"],
          },
        ],
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const models = await listModels(cfg.key);

    expect(models).toHaveLength(2);
    expect(models[0].name).toBe("models/a");
    expect(models[1].name).toBe("models/b");

    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe("/api/gemini/models");
    expect(options.method).toBe("GET");

    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain(cfg.key);
  });


  it("accepts a valid backend lesson with one request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({
        success: true,
        lesson: demos[1],
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const lesson = await generateLesson("The bat flew", cfg);

    expect(lesson.safe).toBe(true);
    expect(lesson.sentence).toBe("The bat flew");

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects an invalid backend lesson without retrying", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({ success: true, lesson: { safe: true } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(generateLesson("The bat flew", cfg)).rejects.toMatchObject({
      code: "errorData",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("never retries or renders unsafe lessons", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({
        success: false,
        error: "CONTENT_BLOCKED",
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      generateLesson("test sentence", cfg),
    ).rejects.toMatchObject({
      code: "errorBlocked",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    [401, "errorKey"],
    [429, "errorQuota"],
    [404, "errorModelUnavailable"],
    [400, "errorRequest"],
    [500, "errorService"],
  ])("maps HTTP %s to a safe error", async (status, code) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json({}, status as number)),
    );
    await expect(generateLesson("test sentence", cfg)).rejects.toMatchObject({
      code,
    });
  });
  it("maps network and blocked-content failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
    await expect(listModels(cfg.key)).rejects.toMatchObject({
      code: "errorNetwork",
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()

        .mockResolvedValue(
          json({
            success: false,
            error: "CONTENT_BLOCKED",
          }),
        ),

    );
    await expect(generateLesson("test sentence", cfg)).rejects.toMatchObject({
      code: "errorBlocked",
    });
  });
  it("never persists a user API key and clears legacy stored keys", () => {
    saveConfig(cfg);
    expect(sessionStorage.getItem("ai-ullil-key")).toBeNull();
    expect(localStorage.getItem("ai-ullil-key")).toBeNull();
    expect(loadConfig().key).toBe("backend-managed");
    localStorage.setItem("ai-ullil-key", "legacy-key");
    removeKey();
    expect(localStorage.getItem("ai-ullil-key")).toBeNull();
  });
  it("gets token count and embeddings through the backend only", async () => {
    const words=demos[1].words.map(w=>w.text);
    const fetchMock=vi.fn().mockResolvedValue(json({count:9,vectors:words.map(word=>({word,values:[0.1,0.2,0.3]}))}));
    vi.stubGlobal("fetch",fetchMock);
    const result=await realNumbers(demos[1],cfg);
    expect(result.count).toBe(9);
    expect(result.vectors).toHaveLength(words.length);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/gemini/real-numbers");
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain(cfg.key);
  });
  it("maps backend HTTP 400 to a request error without inspecting Google-specific payloads", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({ error: { details: [{ reason: "API_KEY_INVALID" }] } }, 400),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(generateLesson("A bat flew", cfg)).rejects.toMatchObject({
      code: "errorRequest",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
describe("model availability recovery", () => {
  const model = (name: string) => ({
    name,
    displayName: name,
    supportedGenerationMethods: ["generateContent"],
  });
  const old = model("models/gemini-2.5-flash");
  const current = model("models/gemini-3.1-flash-lite");
  const saved = { ...cfg, textModel: old.name, models: [old, current] };
  it("does not pretend a frontend preference change can recover a server-owned model", async () => {
    const fetchMock=vi.fn().mockResolvedValue(json({},404)); vi.stubGlobal("fetch",fetchMock);
    await expect(generateLessonWithRecovery("A bat flew",saved)).rejects.toMatchObject({code:"errorModelUnavailable"});
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it("keeps a working selected model without extra discovery or generation calls", async () => {
    const fetch = vi.fn().mockResolvedValue(json({ success: true, lesson: demos[1] }));
    vi.stubGlobal("fetch", fetch);
    const result = await generateLessonWithRecovery("A bat flew", saved);
    expect(result.switched).toBe(false);
    expect(result.config.textModel).toBe(old.name);
    expect(fetch).toHaveBeenCalledOnce();
  });
  it("does not retry a server-owned model 404 from the browser", async () => {
    const fetchMock=vi.fn().mockResolvedValue(json({},404)); vi.stubGlobal("fetch",fetchMock);
    await expect(generateLessonWithRecovery("A bat flew",saved)).rejects.toMatchObject({code:"errorModelUnavailable"});
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it.each([401, 429, 503])(
    "does not switch models for HTTP %s",
    async (status) => {
      const fetch = vi.fn().mockResolvedValue(json({}, status));
      vi.stubGlobal("fetch", fetch);
      await expect(
        generateLessonWithRecovery("A bat flew", saved),
      ).rejects.toBeInstanceOf(Error);
      expect(fetch).toHaveBeenCalledOnce();
    },
  );
  it("chooses current stable lightweight text models without fixed model IDs", () => {
    const models = [
      model("models/gemini-9.4-flash-image"),
      model("models/gemini-2.5-flash"),
      model("models/gemini-9.3-flash-lite"),
      model("models/gemini-9.4-flash-lite-preview"),
      model("models/gemini-8.9-flash-lite"),
    ];
    expect(chooseModels(models, { ...cfg, textModel: "" }).textModel).toBe(
      "models/gemini-9.3-flash-lite",
    );
    expect(
      chooseModels(models, { ...cfg, textModel: "models/gemini-2.5-flash" })
        .textModel,
    ).toBe("models/gemini-2.5-flash");
  });
});
