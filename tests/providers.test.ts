import { describe, it, expect, vi, afterEach } from "vitest";
import { YouTubeMetadataProvider } from "../src/lib/youtube";
import { OpenAICompatibleProvider, estimatedCost } from "../src/lib/ai";
const segment = {
  id: "s",
  transcriptId: "t",
  videoId: "v",
  text: "La selección de bluffcatchers exige estudiar los rangos y las condiciones del rival.",
  hash: "h",
  ordinal: 0,
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("integraciones con respuestas controladas", () => {
  it("resuelve handle, pagina uploads y recupera duración de vídeos públicos", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: URL) => {
      if (url.pathname.endsWith("/channels")) {
        expect(url.searchParams.get("forHandle")).toBe(
          "@ClubdePokerDeTusSueños",
        );
        return Response.json({
          items: [
            { contentDetails: { relatedPlaylists: { uploads: "uploads" } } },
          ],
        });
      }
      if (url.pathname.endsWith("/playlistItems")) {
        expect(url.searchParams.get("pageToken")).toBe("cursor");
        return Response.json({
          items: [{ snippet: { resourceId: { videoId: "abcdefghijk" } } }],
          nextPageToken: "next",
        });
      }
      return Response.json({
        items: [
          {
            id: "abcdefghijk",
            snippet: { title: "NL5 cash turn", publishedAt: "2026-01-01" },
            status: { privacyStatus: "public" },
            contentDetails: { duration: "PT5H3M2S" },
          },
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const p = await new YouTubeMetadataProvider("test-key").channel(
      "https://www.youtube.com/@ClubdePokerDeTusSue%C3%B1os",
      "cursor",
    );
    expect(p.nextPageToken).toBe("next");
    expect(p.videos[0].duration).toBe(18182);
    expect(p.videos[0].status).toBe("transcript_missing");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it("maneja cuota de YouTube sin incluir secretos en el error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 403 })),
    );
    await expect(
      new YouTubeMetadataProvider("secret-key").videos(["abcdefghijk"]),
    ).rejects.toThrow("cuota");
  });
  it("valida esquema y citas del proveedor de IA", async () => {
    vi.stubEnv("AI_API_KEY", "test-private-key");
    vi.stubEnv("AI_MODEL", "test-model");
    vi.stubEnv("AI_INPUT_USD_PER_MILLION", "1");
    vi.stubEnv("AI_OUTPUT_USD_PER_MILLION", "3");
    const c = {
      title: "Bluffcatchers",
      explanation: "La selección depende de los rangos y las condiciones.",
      quote: segment.text,
      topic: "River",
      conditions: ["Rangos no especificados"],
      warnings: ["No es solver"],
      question: "¿Qué debes estudiar antes de pagar?",
      options: ["Rangos", "Resultado previo"],
      accepted: [0],
      answer: "Debes estudiar los rangos y las condiciones.",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          choices: [
            { message: { content: JSON.stringify({ concepts: [c] }) } },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 120 },
        }),
      ),
    );
    const result = await new OpenAICompatibleProvider().extract(segment);
    expect(result.input).toBe(100);
    expect(result.result.concepts[0].quote).toBe(segment.text);
    expect(estimatedCost([segment])).toBeGreaterThan(0);
  });
});
