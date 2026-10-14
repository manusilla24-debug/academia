import { classify } from "./transcripts";
import { now, type Video } from "./domain";
export interface MetadataProvider {
  videos(ids: string[]): Promise<Video[]>;
  channel(
    url: string,
    pageToken?: string,
  ): Promise<{ videos: Video[]; nextPageToken?: string }>;
}
export function youtubeId(value: string) {
  try {
    const u = new URL(value);
    if (
      !["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(
        u.hostname,
      ) ||
      u.protocol !== "https:"
    )
      throw new Error();
    const id =
      u.hostname === "youtu.be"
        ? u.pathname.slice(1)
        : u.pathname.startsWith("/shorts/")
          ? u.pathname.split("/")[2]
          : u.searchParams.get("v");
    if (!id || !/^[\w-]{11}$/.test(id)) throw new Error();
    return id;
  } catch {
    throw new Error(
      "URL de YouTube inválida. Usa https://www.youtube.com/watch?v=…",
    );
  }
}
type ApiItem = {
  id: string;
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails?: { medium?: { url: string } };
    resourceId?: { videoId: string };
  };
  contentDetails?: {
    duration?: string;
    relatedPlaylists?: { uploads: string };
  };
  status?: { privacyStatus: string };
};
export class YouTubeMetadataProvider implements MetadataProvider {
  constructor(private key = process.env.YOUTUBE_API_KEY) {
    if (!key)
      throw new Error(
        "Configura YOUTUBE_API_KEY en el servidor. Puedes importar URLs sin metadatos y subir transcripciones.",
      );
  }
  private async request(resource: string, params: Record<string, string>) {
    const u = new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
    u.search = new URLSearchParams({ ...params, key: this.key! }).toString();
    const res = await fetch(u, {
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
    if (!res.ok)
      throw new Error(
        res.status === 403
          ? "YouTube: cuota agotada o API no autorizada. Reintenta tras revisar la cuota."
          : `YouTube: error ${res.status}.`,
      );
    return (await res.json()) as { items: ApiItem[]; nextPageToken?: string };
  }
  async videos(ids: string[]) {
    const { items } = await this.request("videos", {
      part: "snippet,contentDetails,status",
      id: ids.join(","),
    });
    return items
      .filter((i) => i.status?.privacyStatus === "public")
      .map((i) => {
        const d = i.contentDetails?.duration?.match(
          /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/,
        );
        return {
          id: `yt_${i.id}`,
          youtubeId: i.id,
          title: i.snippet.title,
          url: `https://www.youtube.com/watch?v=${i.id}`,
          thumbnail: i.snippet.thumbnails?.medium?.url,
          duration: d
            ? Number(d[1] ?? 0) * 3600 +
              Number(d[2] ?? 0) * 60 +
              Number(d[3] ?? 0)
            : undefined,
          publishedAt: i.snippet.publishedAt,
          ...classify(i.snippet.title),
          demo: false,
          sourceType: "youtube" as const,
          metadataSource: "youtube-api" as const,
          status: "transcript_missing" as const,
          createdAt: now(),
        };
      });
  }
  async channel(url: string, pageToken?: string) {
    const u = new URL(url);
    if (!["www.youtube.com", "youtube.com"].includes(u.hostname))
      throw new Error("Canal de YouTube inválido.");
    const handle = decodeURIComponent(u.pathname.split("/")[1] ?? "");
    const channels = await this.request("channels", {
      part: "contentDetails",
      ...(handle.startsWith("@")
        ? { forHandle: handle }
        : { id: handle === "channel" ? u.pathname.split("/")[2] : handle }),
    });
    const playlist =
      channels.items[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!playlist)
      throw new Error(
        "Canal no encontrado. Usa su URL con @handle o /channel/ID.",
      );
    const page = await this.request("playlistItems", {
      part: "snippet",
      playlistId: playlist,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    const ids = page.items
      .map((i) => i.snippet.resourceId?.videoId)
      .filter((i): i is string => !!i);
    return {
      videos: ids.length ? await this.videos(ids) : [],
      nextPageToken: page.nextPageToken,
    };
  }
}
