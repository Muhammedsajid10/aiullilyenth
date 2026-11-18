import { afterEach, describe, expect, it, vi } from "vitest";
import { generateSpeech } from "./index";
import { pcmToWave } from "../../engine/wave";
const json = (value:unknown,status=200) => new Response(JSON.stringify(value),{status});
const models = {models:[{name:"models/test-flash-tts",displayName:"Test speech",supportedGenerationMethods:["generateContent"]}]};
const sound = {candidates:[{content:{parts:[{inlineData:{mimeType:"audio/L16;codec=pcm;rate=24000",data:"AAD/fw=="}}]}}]};
afterEach(() => vi.unstubAllGlobals());
describe("Gemini speech via backend", () => {
  it("posts text to backend without exposing any API key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({audio:"AAD/fw==",mimeType:"audio/L16;rate=24000",model:"Test TTS"}));
    vi.stubGlobal("fetch", fetchMock);
    const result = await generateSpeech("നമസ്കാരം", "test-key");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/gemini/speech");
    expect(JSON.parse(options.body)).toEqual({text:"നമസ്കാരം"});
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("test-key");
    expect(result.blob.type).toBe("audio/wav");
    expect(result.blob.size).toBe(48);
  });
  it("maps missing speech models", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({},404)));
    await expect(generateSpeech("Hello","test-key")).rejects.toMatchObject({code:"noSpeechModel"});
  });
  it("maps quota errors without retrying", async () => {
    const fetchMock=vi.fn().mockResolvedValue(json({},429)); vi.stubGlobal("fetch",fetchMock);
    await expect(generateSpeech("Hello","test-key")).rejects.toMatchObject({code:"errorQuota"});
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it("rejects non-audio output", async () => {
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue(json({text:"Hello"})));
    await expect(generateSpeech("Hello","test-key")).rejects.toMatchObject({code:"errorData"});
  });
  it("honors cancellation before making a request", async () => {
    const ac=new AbortController(); ac.abort();
    const fetchMock=vi.fn(); vi.stubGlobal("fetch",fetchMock);
    await expect(generateSpeech("Hello","test-key",ac.signal)).rejects.toMatchObject({name:"AbortError"});
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
describe("PCM to browser audio", () => {
  it("writes a mono 16-bit WAV header and preserves sample bytes",async () => {
    const data=await pcmToWave("AAD/fw==","audio/L16;rate=24000").arrayBuffer(); const view=new DataView(data);
    expect(new TextDecoder().decode(data.slice(0,4))).toBe("RIFF");
    expect(view.getUint32(24,true)).toBe(24000); expect(view.getUint16(22,true)).toBe(1);
    expect(view.getUint16(34,true)).toBe(16); expect(view.getInt16(46,true)).toBe(32767);
  });
  it("rejects unsupported formats and truncated samples", () => {
    expect(() => pcmToWave("AA==","audio/L16;rate=24000")).toThrow();
    expect(() => pcmToWave("AAAA","text/plain")).toThrow();
    expect(() => pcmToWave("AAAA","audio/L16;rate=1")).toThrow();
  });
});
