import { YouTubeMetadataProvider } from "../src/lib/youtube";
import { YouTubeRssMetadataProvider } from "../src/lib/youtube-rss";
import { mutate, readState } from "../src/lib/db/store";
import { now } from "../src/lib/domain";
const provider = process.env.YOUTUBE_API_KEY
  ? new YouTubeMetadataProvider()
  : new YouTubeRssMetadataProvider();
let s = await readState();
let cursor =
  process.env.YOUTUBE_API_KEY &&
  s.settings.channelSync?.channel === s.settings.channel
    ? s.settings.channelSync.cursor
    : undefined;
do {
  const channel = s.settings.channel;
  const page = await provider.channel(channel, cursor);
  const nextPageToken =
    "nextPageToken" in page
      ? (page.nextPageToken as string | undefined)
      : undefined;
  await mutate((state) => {
    for (const video of page.videos) {
      const existing = state.videos.find(
        (v) => v.youtubeId === video.youtubeId,
      );
      if (!existing) state.videos.push(video);
      else
        Object.assign(existing, {
          title: video.title,
          duration: video.duration,
          thumbnail: video.thumbnail,
          publishedAt: video.publishedAt,
        });
    }
    state.settings.channelSync = {
      channel,
      cursor: nextPageToken,
      updatedAt: now(),
    };
  });
  cursor = nextPageToken;
  s = await readState();
  console.log(
    `Página guardada: ${page.videos.length} vídeos públicos. ${cursor ? "Continuando…" : "Sincronización completa."}`,
  );
} while (cursor);
if (!process.env.YOUTUBE_API_KEY)
  console.log(
    "Feed reciente importado. El RSS no incluye el histórico completo ni transcripciones.",
  );
