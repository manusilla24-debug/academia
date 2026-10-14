import { describe, it, expect } from "vitest";
import {
  parseYouTubeFeed,
  publicChannelId,
  initialChannelId,
} from "../src/lib/youtube-rss";
import { FileTranscriptProvider } from "../src/lib/transcripts";
describe("fuentes públicas sin API key", () => {
  it("resuelve el canal inicial verificado y URLs con ID", () => {
    expect(
      publicChannelId("https://www.youtube.com/@ClubdePokerDeTusSue%C3%B1os"),
    ).toBe(initialChannelId);
    expect(
      publicChannelId(`https://www.youtube.com/channel/${initialChannelId}`),
    ).toBe(initialChannelId);
    expect(() => publicChannelId("https://evil.test/@canal")).toThrow();
  });
  it("lee RSS sin afirmar que haya una transcripción", () => {
    const videos = parseYouTubeFeed(
      '<feed><entry><yt:videoId>abcdefghijk</yt:videoId><title>Cash NL5 &amp; turn</title><published>2025-01-01</published><media:thumbnail url="https://i.ytimg.com/test.jpg"/></entry></feed>',
    );
    expect(videos[0].title).toBe("Cash NL5 & turn");
    expect(videos[0].status).toBe("transcript_missing");
    expect(videos[0].metadataSource).toBe("youtube-rss");
    expect(() => parseYouTubeFeed("<!DOCTYPE malicious>")).toThrow();
  });
  it("conserva los inicios originales del export de navegador sin inventar finales", () => {
    const p = new FileTranscriptProvider().parse(
      "YouTube transcript\nVideo ID: abcdefghijk\nLanguage: es\nCaptions: auto-generated\n\n[0:05] El rango de check necesita manos capaces de continuar.\n[1:10] La posición y la textura condicionan la decisión.",
      "youtube.txt",
    );
    expect(p.cues).toHaveLength(2);
    expect(p.cues[0].start).toBe(5);
    expect(p.cues[1].start).toBe(70);
    expect(p.cues[1].end).toBeUndefined();
  });
});
