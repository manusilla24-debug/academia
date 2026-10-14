import { now, type Video } from "./domain";
import { classify } from "./transcripts";
import type { MetadataProvider } from "./youtube";
export const initialChannelId = "UCduG4BZqwZOR93yr8FL2ICg";
export function publicChannelId(url: string) {
  const u = new URL(url);
  if (
    !["www.youtube.com", "youtube.com"].includes(u.hostname) ||
    u.protocol !== "https:"
  )
    throw new Error("Canal de YouTube inválido.");
  const path = decodeURIComponent(u.pathname);
  if (/^\/@ClubdePokerDeTusSueños\/?$/i.test(path)) return initialChannelId;
  const match = path.match(/^\/channel\/(UC[\w-]{22})\/?$/);
  if (match) return match[1];
  throw new Error(
    "Sin API key, usa la URL /channel/ID del canal o el canal inicial.",
  );
}
function decode(text: string) {
  return text.replace(
    /&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi,
    (entity) => {
      const values: Record<string, string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'",
      };
      if (values[entity]) return values[entity];
      const value = entity.startsWith("&#x")
        ? parseInt(entity.slice(3, -1), 16)
        : parseInt(entity.slice(2, -1), 10);
      return Number.isFinite(value) && value <= 0x10ffff
        ? String.fromCodePoint(value)
        : "";
    },
  );
}
export function parseYouTubeFeed(xml: string): Video[] {
  if (xml.length > 1000000 || /<!DOCTYPE|<!ENTITY/i.test(xml))
    throw new Error("Feed XML inválido.");
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  return entries.flatMap((entry) => {
    const id = entry.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
    const title = decode(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    if (!id || !title) return [];
    const thumbnail = entry.match(/<media:thumbnail\s+url="([^"]+)"/)?.[1];
    return [
      {
        id: `yt_${id}`,
        youtubeId: id,
        title,
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail: thumbnail?.startsWith("https://") ? thumbnail : undefined,
        publishedAt: entry.match(/<published>([^<]+)<\/published>/)?.[1],
        demo: false,
        sourceType: "youtube" as const,
        metadataSource: "youtube-rss" as const,
        ...classify(title),
        status: "transcript_missing" as const,
        createdAt: now(),
      },
    ];
  });
}
export class YouTubeRssMetadataProvider implements MetadataProvider {
  async videos(): Promise<Video[]> {
    throw new Error(
      "El feed oficial solo expone publicaciones recientes por canal. Usa YouTube Data API para URLs individuales con metadatos.",
    );
  }
  async channel(url: string, pageToken?: string) {
    if (pageToken)
      throw new Error("El feed RSS no tiene paginación histórica.");
    const id = publicChannelId(url);
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,
      { signal: AbortSignal.timeout(20000), cache: "no-store" },
    );
    if (!response.ok)
      throw new Error(`Feed público de YouTube: HTTP ${response.status}.`);
    return { videos: parseYouTubeFeed(await response.text()), limited: true };
  }
}
